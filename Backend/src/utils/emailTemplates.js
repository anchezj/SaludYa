const getBaseTemplate = (content, title) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #007bff, #00c6ff); padding: 30px; text-align: center; color: white; }
        .header img { max-width: 150px; margin-bottom: 10px; }
        .content { padding: 40px; color: #333; line-height: 1.6; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #777; font-size: 12px; }
        .button { display: inline-block; padding: 12px 25px; background-color: #007bff; color: white; text-decoration: none; border-radius: 25px; font-weight: bold; margin-top: 20px; }
        h2 { color: #007bff; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="cid:logo_saludya" alt="SaludYa Logo">
            <h1>${title}</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            &copy; 2026 SaludYa. Todos los derechos reservados.<br>
            Cuidando tu bienestar, siempre.
        </div>
    </div>
</body>
</html>
    `;
};
const getWelcomeTemplate = (nombre) => {
    const appUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://salud-ya-wheat.vercel.app';
    const content = `
<h2>¡Hola ${nombre}!</h2>
<p>Tu cuenta ha sido creada con éxito. Estamos felices de tenerte con nosotros para cuidar de tu salud.</p>
<center><a href="${appUrl}/login.html" class="button">Iniciar Sesión</a></center>
    `;
    return getBaseTemplate(content, "¡Bienvenido a SaludYa!");
};

const getPasswordResetTemplate = (nombre, resetLink) => {
    const content = `
<h2>Recuperación de Contraseña</h2>
<p>Hola ${nombre}, hemos recibido una solicitud para restablecer tu contraseña.</p>
<p>Si no fuiste tú, puedes ignorar este correo. Si deseas continuar, haz clic en el siguiente botón:</p>
<center><a href="${resetLink}" class="button">Restablecer Contraseña</a></center>
<p>Este enlace expirará en 1 hora.</p>
    `;
    return getBaseTemplate(content, "Seguridad SaludYa");
};

const getAppointmentTemplate = (nombre, fechaHora, especialidad) => {
    // Formatear la fecha para que sea más legible (opcional)
    const fecha = new Date(fechaHora).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' });

    const content = `
<h2>¡Cita Confirmada, ${nombre}!</h2>
<p>Tu cita ha sido agendada con éxito en nuestro sistema.</p>
<p><strong>Detalles de tu cita:</strong></p>
<ul>
    <li><strong>Especialidad:</strong> ${especialidad}</li>
    <li><strong>Fecha y Hora:</strong> ${fecha}</li>
</ul>
<p>Por favor, recuerda llegar con 15 minutos de anticipación. ¡Te esperamos!</p>
    `;
    return getBaseTemplate(content, "Confirmación de Cita - SaludYa");
};

const getStatusUpdateTemplate = (nombre, fechaHora, especialidad, nuevoEstado) => {
    const fecha = new Date(fechaHora).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' });

    const content = `
<h2>Actualización de Cita, ${nombre}</h2>
<p>El estado de tu cita ha sido actualizado a: <strong style="text-transform: uppercase;">${nuevoEstado}</strong>.</p>
<p><strong>Detalles de tu cita:</strong></p>
<ul>
    <li><strong>Especialidad/Motivo:</strong> ${especialidad}</li>
    <li><strong>Fecha y Hora:</strong> ${fecha}</li>
</ul>
<p>Si tienes alguna duda con respecto a este cambio, por favor contáctanos.</p>
    `;
    return getBaseTemplate(content, "Actualización de Estado de Cita - SaludYa");
};



module.exports = { getWelcomeTemplate, getPasswordResetTemplate, getAppointmentTemplate, getStatusUpdateTemplate };


