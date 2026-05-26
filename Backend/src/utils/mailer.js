const nodemailer = require('nodemailer');
require('dotenv').config();

// Creamos el "transporter" (el cartero)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Usamos SSL/TLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verificamos si la conexión es correcta (solo en ambiente de producción)
if (process.env.NODE_ENV !== 'test') {
    transporter.verify().then(() => {
        console.log('✅ Servidor de correos listo');
    }).catch((error) => {
        console.error('❌ Error en mailer.js:', error);
    });
}

module.exports = transporter;