const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function seedMedico() {
    const nombre = process.env.MEDICO_NOMBRE || 'Doctor Eddison';
    const email = process.env.MEDICO_EMAIL || 'medico@saludya.com';
    const password = process.env.MEDICO_PASSWORD || 'Medico123*';
    const rol = 'especialista';

    try {
        const [users] = await db.query('SELECT id_usuario, nombre, email, rol FROM usuarios WHERE email = ?', [email]);

        if (users.length > 0) {
            console.log(`El usuario ya existe: ${users[0].nombre} <${users[0].email}> (${users[0].rol})`);
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const id_usuario = cryptoRandomUUID();

        await db.query(
            'INSERT INTO usuarios (id_usuario, nombre, email, password, rol) VALUES (?, ?, ?, ?, ?)',
            [id_usuario, nombre, email, hashedPassword, rol]
        );

        console.log('Usuario medico creado correctamente:');
        console.log(`- Nombre: ${nombre}`);
        console.log(`- Email: ${email}`);
        console.log(`- Rol: ${rol}`);
        console.log(`- Password temporal: ${password}`);
    } catch (error) {
        console.error('Error creando el usuario medico:', error.message);
        process.exitCode = 1;
    } finally {
        process.exit();
    }
}

function cryptoRandomUUID() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    const { randomUUID } = require('crypto');
    return randomUUID();
}

seedMedico();
