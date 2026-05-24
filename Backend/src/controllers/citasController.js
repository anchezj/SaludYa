const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const transporter = require('../utils/mailer');
const { getAppointmentTemplate } = require('../utils/emailTemplates');
const path = require('path');
const { getStatusUpdateTemplate } = require('../utils/emailTemplates');

exports.crearCita = async (req, res) => {
    try {
        const { fecha_hora, motivo } = req.body;
        // El id del usuario lo sacamos del token, no del formulario por seguridad
        const id_usuario = req.usuario.id;

        if (!fecha_hora || !motivo) {
            return res.status(400).json({ message: 'La fecha y la especialidad son requeridas.' });
        }

        const id_cita = uuidv4();

        // Bloqueamos la misma fecha/hora para la misma especialidad
        // Así una cita de Psicología a las 8:00 ocupa ese turno,
        // pero otra especialidad puede usar ese mismo horario.
        const conflictQuery = `
            SELECT id_cita
            FROM citas
            WHERE fecha_hora = ?
              AND LOWER(TRIM(motivo)) = LOWER(TRIM(?))
              AND estado <> 'cancelada'
            LIMIT 1
        `;
        const [conflict] = await db.query(conflictQuery, [fecha_hora, motivo]);
        if (conflict.length > 0) {
            return res.status(409).json({ message: 'Ese horario ya está ocupado para esa especialidad.' });
        }
        // Definir la query de inserción
        const query = 'INSERT INTO citas (id_cita, id_usuario, fecha_hora, motivo, estado) VALUES (?, ?, ?, ?, ?)';
        // Insertar la nueva cita
        await db.query(query, [id_cita, id_usuario, fecha_hora, motivo, 'programada']);


        try {
            // 1. Obtener el correo y nombre del paciente usando su id_usuario
            const [users] = await db.query('SELECT nombre, email FROM usuarios WHERE id_usuario = ?', [id_usuario]);

            if (users.length > 0) {
                const paciente = users[0];

                // 2. Enviar el correo
                await transporter.sendMail({
                    from: '"SaludYa 🏥" <' + process.env.EMAIL_USER + '>',
                    to: paciente.email,
                    subject: "Confirmación de Cita - SaludYa 🏥",
                    html: getAppointmentTemplate(paciente.nombre, fecha_hora, motivo),
                    attachments: [{
                        filename: 'logo.png',
                        path: path.join(__dirname, '../../../frontend/assest/logo.png'),
                        cid: 'logo_saludya'
                    }]
                });
                console.log('Correo de confirmación de cita enviado a:', paciente.email);
            }
        } catch (mailError) {
            console.error('Error enviando correo de confirmación de cita:', mailError);
        }



        res.status(201).json({ message: 'Cita creada exitosamente', id_cita });
    } catch (error) {
        console.error('Error creando cita:', error);
        res.status(500).json({ message: 'Error interno del servidor al crear la cita.' });
    }
};

// --- NUEVO: OBTENER MIS CITAS ---
exports.obtenerTodasCitas = async (req, res) => {
    try {
        // Return all appointments with patient name for doctor view and shared UI sync
        const query = `
            SELECT
                c.id_cita,
                c.id_usuario,
                c.fecha_hora,
                c.motivo,
                c.motivo AS especialidad,
                c.estado,
                u.nombre AS paciente
            FROM citas c
            JOIN usuarios u ON c.id_usuario = u.id_usuario
            ORDER BY c.fecha_hora DESC
        `;
        const [citas] = await db.query(query);
        res.json(citas);
    } catch (error) {
        console.error('Error al obtener todas las citas:', error);
        res.status(500).json({ message: 'Error al obtener todas las citas.' });
    }
};


exports.obtenerMisCitas = async (req, res) => {
    try {
        const id_usuario = req.usuario.id; // Del token
        const query = `
            SELECT id_cita, fecha_hora, motivo, estado
            FROM citas
            WHERE id_usuario = ?
            ORDER BY fecha_hora DESC
        `;
        const [citas] = await db.query(query, [id_usuario]);
        res.json(citas);
    } catch (error) {
        console.error('Error al obtener tus citas:', error);
        res.status(500).json({ message: 'Error al obtener tus citas.' });
    }
};


exports.actualizarEstado = async (req, res) => {
    try {
        const { id_cita } = req.params;
        const { nuevoEstado } = req.body;
        const allowed = ['programada', 'en curso', 'cancelada', 'reprogramada', 'asistio'];
        if (!allowed.includes(nuevoEstado)) {
            return res.status(400).json({ message: 'Estado no permitido' });
        }

        // 1. Actualizar el estado en la base de datos
        const query = 'UPDATE citas SET estado = ? WHERE id_cita = ?';
        await db.query(query, [nuevoEstado, id_cita]);

        // 2. Obtener los datos de la cita y del paciente para el correo
        const citaQuery = `
            SELECT c.fecha_hora, c.motivo, u.nombre, u.email 
            FROM citas c 
            JOIN usuarios u ON c.id_usuario = u.id_usuario 
            WHERE c.id_cita = ?
        `;
        const [citaData] = await db.query(citaQuery, [id_cita]);

        // 3. Enviar el correo si se encontraron los datos
        if (citaData.length > 0) {
            const cita = citaData[0];
            try {
                await transporter.sendMail({
                    from: '"SaludYa 🏥" <' + process.env.EMAIL_USER + '>',
                    to: cita.email,
                    subject: "Actualización de Estado de Cita - SaludYa 🏥",
                    html: getStatusUpdateTemplate(cita.nombre, cita.fecha_hora, cita.motivo, nuevoEstado),
                    attachments: [{
                        filename: 'logo.png',
                        path: path.join(__dirname, '../../../frontend/assest/logo.png'),
                        cid: 'logo_saludya'
                    }]
                });
                console.log('Correo de actualización enviado a:', cita.email);
            } catch (mailError) {
                console.error('Error enviando correo de actualización de estado:', mailError);
            }
        }
        res.json({ message: 'Estado actualizado y correo enviado' });
    } catch (error) {
        console.error('Error actualizando estado:', error);
        res.status(500).json({ message: 'Error interno' });
    }
};
