jest.mock('../config/db', () => ({
  query: jest.fn()
}));

jest.mock('uuid', () => ({
  v4: jest.fn()
}));

const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const citasController = require('../controllers/citasController');

function createRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('citasController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('crearCita rechaza campos requeridos vacíos', async () => {
    const req = { body: {}, usuario: { id: 'u-1' } };
    const res = createRes();

    await citasController.crearCita(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'La fecha y la especialidad son requeridas.'
    });
  });

  test('crearCita detecta conflicto de horario', async () => {
    db.query
      .mockResolvedValueOnce([[{ id_cita: 'c-1' }]]);

    const req = {
      body: { fecha_hora: '2026-05-23 08:00:00', motivo: 'General' },
      usuario: { id: 'u-1' }
    };
    const res = createRes();

    await citasController.crearCita(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Ese horario ya está ocupado para esa especialidad.'
    });
  });

  test('crearCita inserta una cita programada', async () => {
    db.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{}]);
    uuidv4.mockReturnValue('cita-1');

    const req = {
      body: { fecha_hora: '2026-05-23 08:00:00', motivo: 'General' },
      usuario: { id: 'u-1' }
    };
    const res = createRes();

    await citasController.crearCita(req, res);

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT id_cita'),
      ['2026-05-23 08:00:00', 'General']
    );
    expect(db.query).toHaveBeenCalledWith(
      'INSERT INTO citas (id_cita, id_usuario, fecha_hora, motivo, estado) VALUES (?, ?, ?, ?, ?)',
      ['cita-1', 'u-1', '2026-05-23 08:00:00', 'General', 'programada']
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Cita creada exitosamente',
      id_cita: 'cita-1'
    });
  });

  test('crearCita responde con error interno si la consulta falla', async () => {
    db.query.mockRejectedValueOnce(new Error('db down'));

    const req = {
      body: { fecha_hora: '2026-05-23 08:00:00', motivo: 'General' },
      usuario: { id: 'u-1' }
    };
    const res = createRes();

    await citasController.crearCita(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error interno del servidor al crear la cita.'
    });
  });

  test('obtenerTodasCitas retorna los resultados', async () => {
    db.query.mockResolvedValueOnce([[{ id_cita: 'c-1' }]]);
    const req = {};
    const res = createRes();

    await citasController.obtenerTodasCitas(req, res);

    expect(res.json).toHaveBeenCalledWith([{ id_cita: 'c-1' }]);
  });

  test('obtenerTodasCitas responde con error interno cuando falla', async () => {
    db.query.mockRejectedValueOnce(new Error('db down'));
    const req = {};
    const res = createRes();

    await citasController.obtenerTodasCitas(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener todas las citas.' });
  });

  test('obtenerMisCitas usa el id del usuario autenticado', async () => {
    db.query.mockResolvedValueOnce([[{ id_cita: 'c-1' }]]);
    const req = { usuario: { id: 'u-1' } };
    const res = createRes();

    await citasController.obtenerMisCitas(req, res);

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('FROM citas'),
      ['u-1']
    );
    expect(res.json).toHaveBeenCalledWith([{ id_cita: 'c-1' }]);
  });

  test('obtenerMisCitas responde con error cuando falla la consulta', async () => {
    db.query.mockRejectedValueOnce(new Error('db down'));
    const req = { usuario: { id: 'u-1' } };
    const res = createRes();

    await citasController.obtenerMisCitas(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener tus citas.' });
  });

  test('actualizarEstado rechaza estados no permitidos', async () => {
    const req = { params: { id_cita: 'c-1' }, body: { nuevoEstado: 'invalido' } };
    const res = createRes();

    await citasController.actualizarEstado(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Estado no permitido' });
  });

  test('actualizarEstado persiste un estado válido', async () => {
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    db.query.mockResolvedValueOnce([[{ fecha_hora: '2026-05-23 08:00:00', motivo: 'General', nombre: 'Test User', email: 'test@example.com' }]]);
    const req = { params: { id_cita: 'c-1' }, body: { nuevoEstado: 'cancelada' } };
    const res = createRes();

    await citasController.actualizarEstado(req, res);

    expect(db.query).toHaveBeenCalledWith(
      'UPDATE citas SET estado = ? WHERE id_cita = ?',
      ['cancelada', 'c-1']
    );
    expect(res.json).toHaveBeenCalledWith({ message: 'Estado actualizado y correo enviado' });
  });

  test('actualizarEstado responde con error cuando la consulta falla', async () => {
    db.query.mockRejectedValueOnce(new Error('db down'));
    const req = { params: { id_cita: 'c-1' }, body: { nuevoEstado: 'cancelada' } };
    const res = createRes();

    await citasController.actualizarEstado(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error interno' });
  });
});
