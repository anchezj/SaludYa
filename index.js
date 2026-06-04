const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const frontendDir = path.join(__dirname, 'frontend');

const loginPage = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SaludYa - Iniciar Sesión</title>
  <link rel="icon" href="/assest/logo.png" type="image/png">
  <link rel="stylesheet" href="/css/styles.css">
  <link rel="stylesheet" href="/css/alerts.css">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />
</head>
<body>
  <div class="main-container">
    <div class="right-panel">
      <div class="form-card">
        <h2 class="form-title" id="formTitle">INICIAR SESION</h2>
        <form id="authForm">
          <div class="input-group" id="userGroup">
            <input type="text" id="username" placeholder="Ingresar usuario" required>
          </div>
          <div class="input-group">
            <input type="password" id="password" placeholder="Ingresar contraseña" required>
          </div>
          <p class="role-group-label">Selecciona el tipo de acceso</p>
          <div class="role-group">
            <label class="custom-radio">Afiliado<input type="radio" name="role" value="afiliado"><span class="radio-mark"></span></label>
            <label class="custom-radio"><input type="radio" name="role" value="especialista" checked><span class="radio-mark"></span>Especialista</label>
          </div>
          <div class="forgot-password"><a href="/olvido_contrasena.html">Recordar contraseña</a></div>
          <div class="submit-container"><button type="submit" class="btn-solid register-btn" id="submitBtn">INICIAR SESIÓN</button></div>
        </form>
      </div>
    </div>
    <div class="left-panel">
      <div class="logo-wrapper"><img src="/assest/logo.png" alt="Logo SaludYa" class="logo-image"></div>
      <h1 class="welcome-title">Bienvenido a<br>SaludYa</h1>
      <div class="login-prompt"><a class="login-link">Quieres crear una cuenta?</a></div>
      <a href="/registro.html" class="btn-solid login-btn" style="text-decoration:none;display:inline-block;text-align:center;">REGISTRARSE</a>
    </div>
  </div>
  <script src="/js/script.js"></script>
  <script src="/js/alerts.js"></script>
</body>
</html>`;

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

app.get('/', (req, res) => res.type('html').send(loginPage));
app.get('/login', (req, res) => res.type('html').send(loginPage));
app.get('/login.html', (req, res) => res.type('html').send(loginPage));

app.use((err, req, res, next) => {
  console.error('Unhandled app error:', err);
  res.status(500).send('Internal Server Error');
});

module.exports = app;
