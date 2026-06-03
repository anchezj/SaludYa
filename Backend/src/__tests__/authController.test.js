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
  });

  test('register crea el usuario y envia correo', async () => {
    db.query.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [] });
    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('hashed');
    uuidv4.mockReturnValue('uuid-1');
    transporter.sendMail.mockResolvedValue();

    const req = { body: { nombre: 'Ana', email: 'ana@test.com', password: '123', rol: 'paciente' } };
    const res = createRes();
    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(templates.getWelcomeTemplate).toHaveBeenCalledWith('Ana');
  });

  test('register usa rol paciente por defecto', async () => {
    db.query.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [] });
    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('hashed');
    uuidv4.mockReturnValue('uuid-1');
    transporter.sendMail.mockResolvedValue();

    const req = { body: { nombre: 'Ana', email: 'ana@test.com', password: '123' } };
    const res = createRes();
    await authController.register(req, res);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO usuarios'), ['uuid-1', 'Ana', 'ana@test.com', 'hashed', 'paciente']);
  });

  test('register responde 500 si falla la consulta inicial', async () => {
    db.query.mockRejectedValueOnce(new Error('db down'));
    const req = { body: { nombre: 'Ana', email: 'ana@test.com', password: '123', rol: 'paciente' } };
    const res = createRes();
    await authController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('login devuelve token con credenciales validas', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id_usuario: 'u-1', nombre: 'Ana', rol: 'paciente', password: 'hashed' }] });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockImplementation((payload, secret, options, cb) => cb(null, 'token-abc'));

    const req = { body: { email: 'ana@test.com', password: '123' } };
    const res = createRes();
    await authController.login(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'token-abc' }));
  });

  test('login rechaza cuando no existe el usuario', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const req = { body: { email: 'missing@test.com', password: '123' } };
    const res = createRes();
    await authController.login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('login rechaza credenciales incorrectas', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id_usuario: 'u-1', nombre: 'Ana', rol: 'paciente', password: 'hashed' }] });
    bcrypt.compare.mockResolvedValue(false);
    const req = { body: { email: 'ana@test.com', password: 'wrong' } };
    const res = createRes();
    await authController.login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('login responde 500 si falla la consulta', async () => {
    db.query.mockRejectedValueOnce(new Error('db down'));
    const req = { body: { email: 'ana@test.com', password: '123' } };
    const res = createRes();
    await authController.login(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('forgotPassword actualiza el token y envia correo', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ nombre: 'Ana' }] }).mockResolvedValueOnce({ rows: [] });
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
  });

  test('forgotPassword responde 500 si falla la consulta inicial', async () => {
    db.query.mockRejectedValueOnce(new Error('db down'));
    const req = { body: { email: 'ana@test.com' } };
    const res = createRes();
    await authController.forgotPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('forgotPassword responde 500 si falla el envio', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ nombre: 'Ana' }] });
    transporter.sendMail.mockRejectedValueOnce(new Error('mail down'));
    const req = { body: { email: 'ana@test.com' } };
    const res = createRes();
    await authController.forgotPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('resetPassword valida datos y actualiza la contrasena', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id_usuario: 'u-1', password: 'old', nombre: 'Ana' }] }).mockResolvedValueOnce({ rows: [] });
    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('new-hash');
    const req = { body: { token: 'reset-token', newPassword: 'nueva' } };
    const res = createRes();
    await authController.resetPassword(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  test('resetPassword rechaza cuando faltan datos', async () => {
    const req = { body: { token: '', newPassword: '' } };
    const res = createRes();
    await authController.resetPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('resetPassword rechaza tokens invalidos', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const req = { body: { token: 'bad-token', newPassword: 'nueva' } };
    const res = createRes();
    await authController.resetPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('resetPassword responde 500 si falla la consulta inicial', async () => {
    db.query.mockRejectedValueOnce(new Error('db down'));
    const req = { body: { token: 'bad-token', newPassword: 'nueva' } };
    const res = createRes();
    await authController.resetPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('getProfile devuelve el perfil del usuario', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ nombre: 'Ana', email: 'ana@test.com', numero_contacto: '123', edad: 30, fecha_nacimiento: '1996-01-01', direccion: 'Calle 1' }] });
    const req = { usuario: { id: 'u-1' } };
    const res = createRes();
    await authController.getProfile(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  test('getProfile responde 404 cuando el usuario no existe', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const req = { usuario: { id: 'u-1' } };
    const res = createRes();
    await authController.getProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('getProfile responde 500 si falla la consulta', async () => {
    db.query.mockRejectedValueOnce(new Error('db down'));
    const req = { usuario: { id: 'u-1' } };
    const res = createRes();
    await authController.getProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('updateProfile guarda los campos y convierte vacios a null', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const req = {
      usuario: { id: 'u-1' },
      body: {
        nombre: 'Ana',
        email: '',
        numero_contacto: '300',
        edad: '',
        fecha_nacimiento: '1996-01-01',
        direccion: ''
      }
    };
    const res = createRes();
    await authController.updateProfile(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Perfil actualizado exitosamente' });
  });

  test('updateProfile responde 500 si falla la consulta', async () => {
    db.query.mockRejectedValueOnce(new Error('db down'));
    const req = { usuario: { id: 'u-1' }, body: { nombre: 'Ana' } };
    const res = createRes();
    await authController.updateProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
