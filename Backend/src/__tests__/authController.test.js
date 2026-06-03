jest.mock('../config/db', () => ({
  query: jest.fn()
}));

jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn()
}));

jest.mock('uuid', () => ({
  v4: jest.fn()
}));

jest.mock('../utils/mailer', () => ({
  sendMail: jest.fn()
}));

jest.mock('../utils/emailTemplates', () => ({
  getWelcomeTemplate: jest.fn(() => '<html>welcome</html>'),
  getPasswordResetTemplate: jest.fn(() => '<html>reset</html>')
}));

const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const transporter = require('../utils/mailer');
const templates = require('../utils/emailTemplates');
const authController = require('../controllers/authController');

function createRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('authController', () => {
  beforeEach(() => {
    process.env.EMAIL_USER = 'test@example.com';
    process.env.JWT_SECRET = 'secret';
    jest.clearAllMocks();
  });

  test('register rechaza un usuario existente', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ email: 'a@a.com' }] });

    const req = { body: { nombre: 'Ana', email: 'a@a.com', password: '123', rol: 'paciente' } };
    const res = createRes();

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'El usuario ya existe con este email.'
    });
  });

  test('register crea el usuario y envía correo', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });
    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('hashed');
    uuidv4.mockReturnValue('uuid-1');
    transporter.sendMail.mockResolvedValue();

    const req = {
      body: {
        nombre: 'Ana',
        email: 'ana@test.com',
        password: '123',
        rol: 'paciente'
      }
    };
    const res = createRes();

    await authController.register(req, res);

    expect(bcrypt.hash).toHaveBeenCalledWith('123', 'salt');
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO usuarios'),
      ['uuid-1', 'Ana', 'ana@test.com', 'hashed', 'paciente']
    );
    expect(transporter.sendMail).toHaveBeenCalled();
    expect(templates.getWelcomeTemplate).toHaveBeenCalledWith('Ana');
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('register continúa aunque falle el correo de bienvenida', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });
    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('hashed');
    uuidv4.mockReturnValue('uuid-1');
    transporter.sendMail.mockRejectedValueOnce(new Error('mail down'));

    const req = {
      body: {
        nombre: 'Ana',
        email: 'ana@test.com',
        password: '123',
        rol: 'paciente'
      }
    };
    const res = createRes();

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('login devuelve token con credenciales válidas', async () => {
    db.query.mockResolvedValueOnce({ rows: [{
      id_usuario: 'u-1',
      nombre: 'Ana',
      rol: 'paciente',
      password: 'hashed'
    }] });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockImplementation((payload, secret, options, cb) => cb(null, 'token-abc'));

    const req = { body: { email: 'ana@test.com', password: '123' } };
    const res = createRes();

    await authController.login(req, res);

    expect(jwt.sign).toHaveBeenCalledWith(
      {
        usuario: {
          id: 'u-1',
          rol: 'paciente'
        }
      },
      'secret',
      { expiresIn: '2h' },
      expect.any(Function)
    );
    expect(res.json).toHaveBeenCalledWith({
      token: 'token-abc',
      message: 'Inicio de sesión exitoso',
      usuario: { nombre: 'Ana', rol: 'paciente' }
    });
  });

  test('login rechaza cuando no existe el usuario', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const req = { body: { email: 'missing@test.com', password: '123' } };
    const res = createRes();

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Credenciales inválidas.' });
  });

  test('login rechaza credenciales incorrectas', async () => {
    db.query.mockResolvedValueOnce({ rows: [{
      id_usuario: 'u-1',
      nombre: 'Ana',
      rol: 'paciente',
      password: 'hashed'
    }] });
    bcrypt.compare.mockResolvedValue(false);

    const req = { body: { email: 'ana@test.com', password: 'wrong' } };
    const res = createRes();

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Credenciales inválidas.' });
  });

  test('forgotPassword actualiza el token de reseteo y envía correo', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ nombre: 'Ana' }] })
      .mockResolvedValueOnce({ rows: [] });
    uuidv4.mockReturnValue('reset-token');
    transporter.sendMail.mockResolvedValue();

    const req = {
      body: { email: 'ana@test.com' },
      protocol: 'https',
      get: jest.fn(() => 'saludya.vercel.app')
    };
    const res = createRes();

    await authController.forgotPassword(req, res);

    expect(db.query).toHaveBeenCalledWith(
      'UPDATE usuarios SET reset_token = $1, reset_expires = $2 WHERE email = $3',
      ['reset-token', expect.any(Date), 'ana@test.com']
    );
    expect(transporter.sendMail).toHaveBeenCalled();
    expect(templates.getPasswordResetTemplate).toHaveBeenCalledWith(
      'Ana',
      'https://saludya.vercel.app/cambio_contrasena.html?token=reset-token'
    );
    expect(res.json).toHaveBeenCalledWith({
      message: 'Se ha enviado un enlace de recuperación a tu correo.'
    });
  });

  test('forgotPassword rechaza correos no registrados', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const req = { body: { email: 'missing@test.com' } };
    const res = createRes();

    await authController.forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'El correo no está registrado.'
    });
  });

  test('resetPassword valida datos y actualiza la contraseña', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{
        id_usuario: 'u-1',
        password: 'old',
        nombre: 'Ana'
      }] })
      .mockResolvedValueOnce({ rows: [] });
    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('new-hash');

    const req = { body: { token: 'reset-token', newPassword: 'nueva' } };
    const res = createRes();

    await authController.resetPassword(req, res);

    expect(db.query).toHaveBeenCalledWith(
      'SELECT * FROM usuarios WHERE reset_token = $1 AND reset_expires > NOW()',
      ['reset-token']
    );
    expect(bcrypt.hash).toHaveBeenCalledWith('nueva', 'salt');
    expect(db.query).toHaveBeenCalledWith(
      'UPDATE usuarios SET password = $1, reset_token = NULL, reset_expires = NULL WHERE id_usuario = $2',
      ['new-hash', 'u-1']
    );
    expect(res.json).toHaveBeenCalledWith({
      message: 'Tu contraseña ha sido actualizada exitosamente.'
    });
  });

  test('resetPassword rechaza cuando faltan datos', async () => {
    const req = { body: { token: '', newPassword: '' } };
    const res = createRes();

    await authController.resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'El token y la nueva contraseña son requeridos.'
    });
  });

  test('resetPassword rechaza tokens inválidos', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const req = { body: { token: 'bad-token', newPassword: 'nueva' } };
    const res = createRes();

    await authController.resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'El enlace de recuperación es inválido o ha expirado.'
    });
  });
});
