const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

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
