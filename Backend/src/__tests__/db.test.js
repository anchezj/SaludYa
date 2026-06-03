jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue({
      release: jest.fn()
    })
  }))
}));

jest.mock('dotenv', () => ({
  config: jest.fn()
}));

const { Pool } = require('pg');

describe('db config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DATABASE_URL = 'postgresql://user:pass@db.supabase.co:5432/postgres';
  });

  test('crea el pool con la configuración esperada', async () => {
    const connect = jest.fn().mockResolvedValue({ release: jest.fn() });
    Pool.mockImplementation(() => ({
      connect
    }));

    delete require.cache[require.resolve('../config/db')];
    require('../config/db');

    expect(Pool).toHaveBeenCalledWith({
      connectionString: 'postgresql://user:pass@db.supabase.co:5432/postgres',
      ssl: {
        rejectUnauthorized: false
      }
    });
  });
});
