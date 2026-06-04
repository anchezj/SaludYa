const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter.verify().then(() => {
        console.log('✅ Servidor de correos listo');
    }).catch((error) => {
        console.error('❌ Error en mailer.js:', error);
    });
}

module.exports = transporter;
