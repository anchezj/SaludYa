const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Define la ruta POST para registrar un usuario
router.post('/register', authController.register);

// Define la ruta POST para iniciar sesión
router.post('/login', authController.login);

// --- NUEVA RUTA: OLVIDAR CONTRASEÑA ---
router.post('/forgot-password', authController.forgotPassword);

// --- NUEVA RUTA: CAMBIAR CONTRASEÑA ---
router.post('/reset-password', authController.resetPassword);

// --- RUTAS DE PERFIL ---
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);

module.exports = router;
