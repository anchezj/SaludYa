const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const transporter = require('../utils/mailer');
const { getWelcomeTemplate, getPasswordResetTemplate } = require('../utils/emailTemplates');
const path = require('path');

exports.register = async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;

        const [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (users.length > 0) {
            return res.status(400).json({ message: 'El usuario ya existe con este email.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const id_usuario = uuidv4();

        const query = 'INSERT INTO usuarios (id_usuario, nombre, email, password, rol) VALUES (?, ?, ?, ?, ?)';
        await db.query(query, [id_usuario, nombre, email, hashedPassword, rol || 'paciente']);

        // --- INICIO ENVÍO DE CORREO DE BIENVENIDA ---
        try {
            await transporter.sendMail({
                from: '"SaludYa 🏥" <' + process.env.EMAIL_USER + '>',
                to: email,
                subject: "¡Bienvenido a SaludYa! 🏥",
                html: getWelcomeTemplate(nombre),
                attachments: [{
                    filename: 'logo.png',
                    path: path.join(__dirname, '../../../frontend/assest/logo.png'),
                    cid: 'logo_saludya'
                }]
            });
            console.log('Correo de bienvenida enviado a:', email);
        } catch (mailError) {
            console.error('Error enviando correo de bienvenida:', mailError);
        }
        // --- FIN ENVÍO DE CORREO ---

        res.status(201).json({ message: 'Usuario registrado exitosamente.' });
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const payload = {
            usuario: {
                id: user.id_usuario,
                rol: user.rol
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '2h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, message: 'Inicio de sesión exitoso', usuario: { nombre: user.nombre, rol: user.rol } });
            }
        );
    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- NUEVA FUNCIÓN DE RECUPERACIÓN DE CONTRASEÑA ---
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'El correo no está registrado.' });
        }

        const user = users[0];
        const token = uuidv4();
        const expires = new Date(Date.now() + 3600000); // El token expira en 1 hora

        // Guardar token y expiración en la DB
        await db.query('UPDATE usuarios SET reset_token = ?, reset_expires = ? WHERE email = ?', [token, expires, email]);

        const resetLink = `http://localhost:3000/cambio_contrasena.html?token=${token}`;

        // Enviar el correo
        await transporter.sendMail({
            from: '"SaludYa Security 🏥" <' + process.env.EMAIL_USER + '>',
            to: email,
            subject: "Recupera tu contraseña - SaludYa",
            html: getPasswordResetTemplate(user.nombre, resetLink),
            attachments: [{
                filename: 'logo.png',
                path: path.join(__dirname, '../../../frontend/assest/logo.png'),
                cid: 'logo_saludya'
            }]
        });

        res.json({ message: 'Se ha enviado un enlace de recuperación a tu correo.' });
    } catch (error) {
        console.error('Error en forgotPassword:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
