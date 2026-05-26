# SaludYa 🩺

SaludYa es una plataforma integral de gestión de salud diseñada para facilitar la interacción entre pacientes y servicios médicos. Este sistema permite la gestión de usuarios, programación de citas y recuperación de contraseñas de manera segura y eficiente.

## 🚀 Características

- **Autenticación Segura**: Registro e inicio de sesión de usuarios con identificadores únicos (UUID), contraseñas encriptadas (Bcryptjs) y tokens de sesión (JWT).
- **Gestión de Citas**: Interfaz para que los pacientes puedan solicitar y gestionar sus citas médicas.
- **Recuperación de Contraseña**: Sistema automatizado de recuperación mediante envío de correos electrónicos con plantillas personalizadas.
- **Roles de Usuario**: Soporte para diferentes niveles de acceso (pacientes, administradores).
- **Diseño Moderno**: Interfaz de usuario limpia y funcional utilizando tecnologías web estándar.

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js**: Entorno de ejecución.
- **Express**: Framework para la API REST.
- **MySQL**: Base de datos relacional.
- **JWT (JSON Web Tokens)**: Manejo de sesiones y seguridad.
- **Bcryptjs**: Encriptación de contraseñas.
- **UUID**: Generación de identificadores únicos para los usuarios.
- **Nodemailer**: Envío de correos electrónicos para notificaciones y recuperación.

### Frontend
- **HTML5 & CSS3**: Estructura y diseño visual.
- **JavaScript (Vanilla)**: Lógica de interacción en el cliente.
- **SweetAlert2**: Notificaciones interactivas y elegantes.

## 📂 Estructura del Proyecto

```text
SaludYa/
├── Backend/              # Lógica del servidor y API
│   ├── src/
│   │   ├── controllers/  # Controladores de rutas
│   │   ├── config/       # Configuraciones (DB, Mailer)
│   │   └── utils/        # Plantillas y funciones de ayuda
│   └── index.js          # Punto de entrada del servidor
├── frontend/             # Interfaz de usuario (HTML, CSS, JS)
│   ├── css/
│   ├── js/
│   └── views/
├── sql.sql               # Esquema de la base de datos
└── package.json          # Dependencias generales
```

## ⚙️ Configuración e Instalación

### Requisitos Previos
- Node.js instalado.
- MySQL Server en ejecución.

### Pasos a seguir:

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/SaludYa.git
   cd SaludYa
   ```

2. **Configurar el Backend**:
   - Entra a la carpeta del backend:
     ```bash
     cd Backend
     ```
   - Instala las dependencias:
     ```bash
     npm install
     ```
   - Crea un archivo `.env` en la carpeta `Backend/` con los siguientes campos:
     ```env
     PORT=3000
     DB_HOST=localhost
     DB_USER=tu_usuario
     DB_PASSWORD=tu_contraseña
     DB_NAME=saludya_db
     JWT_SECRET=tu_secreto_super_seguro
     EMAIL_USER=tu_correo@gmail.com
     EMAIL_PASS=tu_token_de_aplicacion
     ```

3. **Configurar la Base de Datos**:
   - Ejecuta el script `sql.sql` en tu gestor de MySQL para crear la base de datos y las tablas necesarias.

4. **Iniciar el servidor**:
   ```bash
   npm run dev
   ```

5. **Acceder al Frontend**:
   - Abre el archivo `frontend/login.html` en tu navegador o usa un servidor local (como Live Server en VS Code).

## 📚 Documentación Técnica del Proyecto

El proyecto cuenta con documentación técnica completa para facilitar la comprensión, instalación y mantenimiento del sistema.

### README del Repositorio
Este archivo contiene:
- Descripción del proyecto
- Guía de instalación del sistema
- Arquitectura general del sistema
- Tecnologías utilizadas
- Instrucciones para ejecutar el proyecto localmente

### Documentación de API
La documentación de los endpoints está disponible mediante ¿

### Documentación del Código
El código utiliza **JSDoc** para documentar funciones clave:
- **Backend**: Todos los controladores, middlewares y utilidades incluyen comentarios JSDoc descriptivos
- **Frontend**: Funciones principales están documentadas para facilitar el mantenimiento

### Wiki del Repositorio
Se mantiene una **Wiki activa en GitHub** con información adicional:
- Guías de desarrollo
- Explicación de la arquitectura detallada
- Solución de problemas comunes
- Contribuciones y mejores prácticas

---

6. **Proximas Actualizaciones**:
   - Descargar un reporte de la citas mensual
   - Envio de notificacione y recordatorio de la citas al correo (opcional WhatsApp)
---
Desarrollado con ❤️ para mejorar la gestión de salud.
