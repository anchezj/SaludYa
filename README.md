# SaludYa 🩺

SaludYa es una plataforma integral de gestión de salud diseñada para facilitar la interacción entre pacientes y servicios médicos. Este sistema permite la gestión de usuarios, programación de citas y recuperación de contraseñas de manera segura y eficiente.

## 🚀 Características

- **Autenticación Segura**: Registro e inicio de sesión de usuarios con identificadores únicos (UUID), contraseñas encriptadas (Bcryptjs) y tokens de sesión (JWT).
- **Gestión de Citas**: Interfaz para que los pacientes puedan solicitar y gestionar sus citas médicas.
- **Recuperación de Contraseña**: Sistema automatizado de recuperación mediante envío de correos electrónicos con plantillas personalizadas.
- **Roles de Usuario**: Soporte para diferentes niveles de acceso (pacientes, administradores).
- **Diseño Moderno**: Interfaz de usuario limpia y funcional utilizando tecnologías web estándar.
- **Testing**: Suite de pruebas con Jest para backend y frontend.
- **Despliegue Flexible**: Soporte para Docker, Firebase y Vercel.

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js**: Entorno de ejecución.
- **Express**: Framework para la API REST.
- **PostgreSQL**: Base de datos relacional.
- **JWT (JSON Web Tokens)**: Manejo de sesiones y seguridad.
- **Bcryptjs**: Encriptación de contraseñas.
- **UUID**: Generación de identificadores únicos para los usuarios.
- **Nodemailer**: Envío de correos electrónicos para notificaciones y recuperación.
- **Jest**: Framework de pruebas.

### Frontend
- **HTML5 & CSS3**: Estructura y diseño visual.
- **JavaScript (Vanilla)**: Lógica de interacción en el cliente.
- **SweetAlert2**: Notificaciones interactivas y elegantes.

### DevOps
- **Docker**: Contenedorización de la aplicación.
- **Firebase**: Hosting y despliegue.
- **Vercel**: Plataforma de despliegue serverless.

## 📂 Estructura del Proyecto

```text
SaludYa/
├── api/                  # Lógica del servidor y API
│   └── index.js          # Punto de entrada del servidor
├── frontend/             # Interfaz de usuario (HTML, CSS, JS)
│   ├── css/
│   ├── js/
│   └── views/
├── Backend/              # Estructura legacy (en migración)
├── sql.sql               # Esquema de la base de datos
├── Dockerfile            # Configuración Docker
├── docker-compose.yml    # Orquestación Docker
├── firebase.json         # Configuración Firebase
├── vercel.json           # Configuración Vercel
├── package.json          # Dependencias y scripts
└── jest.*.config.cjs     # Configuraciones de Jest
```

## ⚙️ Configuración e Instalación

### Requisitos Previos
- Node.js instalado.
- PostgreSQL en ejecución.
- Docker (opcional, para contenedorización).

### Pasos a seguir:

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/SaludYa.git
   cd SaludYa
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   - Crea un archivo `.env` en la raíz del proyecto:
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

4. **Configurar la Base de Datos**:
   - Ejecuta el script `sql.sql` en tu gestor de PostgreSQL para crear la base de datos y las tablas necesarias.

5. **Iniciar el servidor**:
   ```bash
   npm run dev
   ```
   O para producción:
   ```bash
   npm start
   ```

6. **Ejecutar pruebas**:
   ```bash
   # Todas las pruebas
   npm test

   # Con coverage
   npm run test:coverage

   # Solo backend
   npm run test:coverage:backend

   # Solo frontend
   npm run test:coverage:frontend
   ```

7. **Acceder al Frontend**:
   - Abre el archivo `frontend/login.html` en tu navegador o usa un servidor local (como Live Server en VS Code).

## 🐳 Docker

Para ejecutar la aplicación con Docker:

```bash
# Construir y levantar contenedores
docker-compose up --build

# Detener contenedores
docker-compose down
```

## � Despliegue

### Firebase
```bash
npm run deploy
```

### Vercel
El proyecto está configurado para despliegue en Vercel mediante `vercel.json`.

## �📚 Documentación Técnica del Proyecto

El proyecto cuenta con documentación técnica completa para facilitar la comprensión, instalación y mantenimiento del sistema.

### README del Repositorio
Este archivo contiene:
- Descripción del proyecto
- Guía de instalación del sistema
- Arquitectura general del sistema
- Tecnologías utilizadas
- Instrucciones para ejecutar el proyecto localmente

### Documentación de API
La documentación de los endpoints está disponible en el código fuente mediante comentarios JSDoc.

### Documentación del Código
El código utiliza **JSDoc** para documentar funciones clave:
- **Backend**: Todos los controladores, middlewares y utilidades incluyen comentarios JSDoc descriptivos
- **Frontend**: Funciones principales están documentadas para facilitar el mantenimiento

### Testing
El proyecto incluye suites de pruebas para backend y frontend configuradas con Jest:
- Configuraciones separadas para cada parte del proyecto
- Scripts para ejecutar pruebas con y sin coverage
- Integración con CI/CD

---

6. **Proximas Actualizaciones**:
   - Descargar un reporte de la citas mensual (paciente)
   - Envio de notificacione y recordatorio de la citas al correo (opcional WhatsApp)
---

Desarrollado con ❤️ para mejorar la gestión de salud.
