const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const frontendDir = path.join(__dirname, '../frontend');

const sendFrontend = (relativePath) => (req, res) => {
    res.sendFile(path.join(frontendDir, relativePath));
};

app.use(cors({
    origin: (origin, callback) => {
        const localOrigins = [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173'
        ];

        const allowedOrigins = [
            ...localOrigins,
            process.env.FRONTEND_URL,
            process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
        ].filter(Boolean);

        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }

        return callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
    credentials: true
}));

app.use(express.json());

app.use('/api/auth', require('../Backend/src/routes/authRoutes'));
app.use('/api/citas', require('../Backend/src/routes/citasRoutes'));

app.get('/', sendFrontend('login.html'));
app.get('/login', sendFrontend('login.html'));
app.get('/login.html', sendFrontend('login.html'));
app.get('/registro', sendFrontend('registro.html'));
app.get('/registro.html', sendFrontend('registro.html'));
app.get('/olvido_contrasena', sendFrontend('olvido_contrasena.html'));
app.get('/olvido_contrasena.html', sendFrontend('olvido_contrasena.html'));
app.get('/cambio_contrasena', sendFrontend('cambio_contrasena.html'));
app.get('/cambio_contrasena.html', sendFrontend('cambio_contrasena.html'));
app.get('/index.html', sendFrontend('index.html'));

app.get('/views/Patient/citas.html', sendFrontend('views/Patient/citas.html'));
app.get('/views/Patient/perfil.html', sendFrontend('views/Patient/perfil.html'));
app.get('/views/Patient/solicitar_cita.html', sendFrontend('views/Patient/solicitar_cita.html'));
app.get('/views/Doctor/cronograma_citas.html', sendFrontend('views/Doctor/cronograma_citas.html'));
app.get('/views/Doctor/pacientes_programados.html', sendFrontend('views/Doctor/pacientes_programados.html'));
app.get('/views/Doctor/perfil.html', sendFrontend('views/Doctor/perfil.html'));

module.exports = app;
