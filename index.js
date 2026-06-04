const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const frontendDir = path.join(__dirname, 'frontend');
const pageCache = new Map();

const renderFrontend = (relativePath) => (req, res, next) => {
  try {
    if (!pageCache.has(relativePath)) {
      const filePath = path.join(frontendDir, relativePath);
      pageCache.set(relativePath, fs.readFileSync(filePath, 'utf8'));
    }

    res.type('html').send(pageCache.get(relativePath));
  } catch (error) {
    next(error);
  }
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

app.use('/api/auth', require('./Backend/src/routes/authRoutes'));
app.use('/api/citas', require('./Backend/src/routes/citasRoutes'));

app.get('/', renderFrontend('login.html'));
app.get('/login', renderFrontend('login.html'));
app.get('/login.html', renderFrontend('login.html'));
app.get('/registro', renderFrontend('registro.html'));
app.get('/registro.html', renderFrontend('registro.html'));
app.get('/olvido_contrasena', renderFrontend('olvido_contrasena.html'));
app.get('/olvido_contrasena.html', renderFrontend('olvido_contrasena.html'));
app.get('/cambio_contrasena', renderFrontend('cambio_contrasena.html'));
app.get('/cambio_contrasena.html', renderFrontend('cambio_contrasena.html'));
app.get('/index.html', renderFrontend('index.html'));

app.get('/views/Patient/citas.html', renderFrontend('views/Patient/citas.html'));
app.get('/views/Patient/perfil.html', renderFrontend('views/Patient/perfil.html'));
app.get('/views/Patient/solicitar_cita.html', renderFrontend('views/Patient/solicitar_cita.html'));
app.get('/views/Doctor/cronograma_citas.html', renderFrontend('views/Doctor/cronograma_citas.html'));
app.get('/views/Doctor/pacientes_programados.html', renderFrontend('views/Doctor/pacientes_programados.html'));
app.get('/views/Doctor/perfil.html', renderFrontend('views/Doctor/perfil.html'));

app.use((err, req, res, next) => {
  console.error('Unhandled app error:', err);
  res.status(500).send('Internal Server Error');
});

module.exports = app;
