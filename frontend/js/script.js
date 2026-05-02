document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Evita que la página recargue
            const isLogin = document.getElementById('formTitle').textContent.includes('INICIAR');

            if (isLogin) {
                // --- LÓGICA DE INICIO DE SESIÓN ---
                // Tu HTML de login usa el id "username", pero en BD es un email
                const email = document.getElementById('username').value;
                const password = document.getElementById('password').value;

                try {
                    const response = await fetch('http://localhost:3000/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        alert('¡Inicio de sesión exitoso!');
                        // Guardar el Token en el navegador para usarlo después
                        localStorage.setItem('token', data.token);
                        // Guardar los datos del usuario
                        localStorage.setItem('usuario', JSON.stringify(data.usuario));
                        window.location.href = '/views/patient/citas.html';
                    } else {
                        alert('Error: ' + data.message);
                    }
                } catch (error) {
                    console.error('Error al conectar:', error);
                    alert('Error al conectar con el servidor.');
                }

            } else {
                // --- LÓGICA DE REGISTRO ---
                const nombre = document.getElementById('username').value;
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirmPassword').value;

                if (password !== confirmPassword) {
                    alert('Las contraseñas no coinciden');
                    return;
                }

                try {
                    const response = await fetch('http://localhost:3000/api/auth/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            nombre: nombre,
                            email: email,
                            password: password,
                            rol: 'paciente' // Rol por defecto
                        })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        alert('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
                        window.location.href = 'login.html'; // Redirige a la pantalla de login
                    } else {
                        alert('Error: ' + data.message);
                    }
                } catch (error) {
                    console.error('Error al conectar:', error);
                    alert('Error al conectar con el servidor.');
                }
            }
        });
    }

    // --- LÓGICA DE RECUPERACIÓN DE CONTRASEÑA ---
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const submitBtn = document.getElementById('submitBtn');

            // Deshabilitar botón para evitar múltiples envíos
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';

            try {
                const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();
                if (response.ok) {
                    alert('Si el correo está registrado, recibirás un enlace de recuperación pronto.');
                    localStorage.clear(); 
                    window.location.href = 'login.html';
                } else {
                    alert('Error: ' + data.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error al conectar con el servidor.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'ENVIAR ENLACE';
            }
        });
    }

    // --- SEGURIDAD: CONTROL DE SESIÓN (FIXED PARA EVITAR LOOP) ---
    const currentPath = window.location.pathname;
    const isPublicPage = currentPath.includes('login.html') || 
                         currentPath.includes('registro.html') || 
                         currentPath.includes('olvido_contrasena.html') ||
                         currentPath === '/';

    const usuarioData = localStorage.getItem('usuario');
    const token = localStorage.getItem('token');

    if (!isPublicPage) {
        // Si es una página privada y no hay token, redirigir
        if (!usuarioData || !token) {
            window.location.href = '../../login.html';
            return;
        }

        // Mostrar nombre en el sidebar si existe el elemento
        const nameDisplay = document.getElementById('userNameDisplay');
        if (nameDisplay && usuarioData) {
            const usuario = JSON.parse(usuarioData);
            nameDisplay.textContent = usuario.nombre || 'Usuario';
        }
    } else {
        // Si estamos en login y ya hay sesión, podemos redirigir al dashboard
        if (usuarioData && token && currentPath.includes('login.html')) {
            window.location.href = 'views/Patient/citas.html';
        }
    }

    const logoutBtn = document.querySelector('a[href="../../login.html"]');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            localStorage.clear(); // Borra token y datos de usuario
        });
    }
});
