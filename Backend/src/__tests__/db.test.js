jest.mock('pg', () => ({
  Pool: jest.fn()
}));

jest.mock('dotenv', () => ({
  config: jest.fn()
}));

describe('db config', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.DATABASE_URL = 'postgresql://user:pass@db.supabase.co:5432/postgres';
  });

  test('crea el pool con la configuracion de Supabase esperada', () => {
    const { Pool } = require('pg');
    Pool.mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue({ release: jest.fn() })
    }));

    require('../config/db');

    expect(Pool).toHaveBeenCalledWith({
      connectionString: 'postgresql://user:pass@db.supabase.co:5432/postgres',
      ssl: {
        rejectUnauthorized: false
      }
    });
  });

  test('intenta conectar y libera el cliente cuando la conexion funciona', async () => {
    const { Pool } = require('pg');
    const release = jest.fn();
    const connect = jest.fn().mockResolvedValue({ release });
    Pool.mockImplementation(() => ({
      connect
    }));

    require('../config/db');
    await new Promise((resolve) => setImmediate(resolve));

    expect(connect).toHaveBeenCalled();
    expect(release).toHaveBeenCalled();
  });

  test('maneja el error de conexion sin romper el modulo', async () => {
    const { Pool } = require('pg');
    const error = new Error('db down');
    const connect = jest.fn().mockRejectedValue(error);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    Pool.mockImplementation(() => ({
      connect
    }));

    require('../config/db');
    await new Promise((resolve) => setImmediate(resolve));

    expect(consoleSpy).toHaveBeenCalledWith('Error al conectar a la base de datos:', error);
    consoleSpy.mockRestore();
  });
});
