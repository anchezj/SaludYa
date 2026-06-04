const { Pool } = require('pg');
require('dotenv').config();

const useSsl = process.env.DB_SSL !== 'false';
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const pool = new Pool({
    connectionString,
    ssl: useSsl ? { rejectUnauthorized: false } : false
});

if (connectionString && !process.env.VERCEL) {
    pool.connect()
        .then(client => {
            console.log('Conexión a PostgreSQL verificada exitosamente.');
            client.release();
        })
        .catch(err => {
            console.error('Error al conectar a la base de datos:', err);
        });
}

module.exports = pool;
