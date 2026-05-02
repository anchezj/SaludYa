const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Define la ruta POST para registrar un usuario
router.post('/register', authController.register);

// Define la ruta POST para iniciar sesión
router.post('/login', authController.login);

module.exports = router;
