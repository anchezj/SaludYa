const express = require('express');
const cors = require('cors');
const path = require('path'); // <-- IMPORTANTE: Agregar esto
require('dotenv').config();

const app = express();

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());

// 1. Decirle a Express dónde están tus archivos estáticos (CSS, JS, Imágenes)
app.use(express.static(path.join(__dirname, '../frontend')));

// 2. Rutas de la API (Backend)
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/citas', require('./src/routes/citasRoutes'));

// 3. Ruta Principal (Frontend) - Cuando entres a localhost:3000 cargará el login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
}

module.exports = app;
