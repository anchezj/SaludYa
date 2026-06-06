document.addEventListener('DOMContentLoaded', () => {
    const API_AUTH = '/api/auth';
    
    // Helper para localStorage con manejo de errores
    const safeStorage = {
        setItem: (key, value) => {
            try {
                localStorage.setItem(key, value);
                return true;
            } catch (e) {
                console.warn('localStorage bloqueado por el navegador:', e);
                return false;
            }
        },
        getItem: (key) => {
            try {
                return localStorage.getItem(key);
            } catch (e) {
                console.warn('localStorage bloqueado por el navegador:', e);
                return null;
            }
        },
        clear: () => {
            try {
                localStorage.clear();
                return true;
            } catch (e) {
                console.warn('localStorage bloqueado por el navegador:', e);
                return false;
            }
        }
    };
    
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
                const selectedRole = document.querySelector('input[name="role"]:checked')?.value || 'especialista';
                const expectedRole = selectedRole === 'afiliado' ? 'paciente' : 'especialista';

                try {
                    const response = await fetch(`${API_AUTH}/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        const userRole = data.usuario?.rol || 'paciente';

                        if (userRole !== expectedRole) {
                            AlertSystem.error('El rol seleccionado no coincide con tu cuenta');
                            return;
                        }

                        AlertSystem.success('Inicio de sesión exitoso', 'Bienvenido a SaludYa', () => {
                            // Guardar el Token en el navegador para usarlo después
                            safeStorage.setItem('token', data.token);
                            // Guardar los datos del usuario
                            safeStorage.setItem('usuario', JSON.stringify(data.usuario));
                            const redirectUrl = userRole === 'especialista'
                                ? 'views/Doctor/cronograma_citas.html'
                                : 'views/Patient/citas.html';
                            window.location.href = redirectUrl;
                        });
                    } else {
                        AlertSystem.error('Error: ' + data.message);
                    }
                } catch (error) {
                    AlertSystem.error('Error: al conectar con el servidor.');
                }

            } else {
                // --- LÓGICA DE REGISTRO ---
                const nombre = document.getElementById('username').value;
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirmPassword').value;

                if (password !== confirmPassword) {
                    AlertSystem.error('Contraseñas no coinciden');
                    return;
                }

                try {
                    const response = await fetch(`${API_AUTH}/register`, {
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
                        AlertSystem.success('¡Cuenta creada exitosamente!', 'Ahora puedes iniciar sesión.', () => {
                            window.location.href = 'login.html'; // Redirige a la pantalla de login
                        });
                    } else {
                        AlertSystem.error('Error: ' + data.message);
                    }
                } catch (error) {
                    AlertSystem.error('Error al conectar con el servidor.');
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
                const response = await fetch(`${API_AUTH}/forgot-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();
                if (response.ok) {
                    AlertSystem.success('Envio de recuperación de contraseña exitoso', 'Revisa tu correo de recuperación de contraseña para acceder al sistema', () => {
                        safeStorage.clear();
                            window.location.assign('login.html');
                    });
                } else {
                    AlertSystem.error('Error', data.message);
                }
            } catch (error) {
                AlertSystem.error('Error: al conectar con el servidor.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'ENVIAR ENLACE';
            }
        });
    }

    // --- UI GLOBAL ---
    const currentPath = window.location.pathname;
    const isPublicPage = currentPath.includes('login.html') ||
        currentPath.includes('registro.html') ||
        currentPath.includes('olvido_contrasena.html') ||
        currentPath.includes('cambio_contrasena.html') ||
        currentPath === '/';

    const usuarioData = safeStorage.getItem('usuario');
    const token = safeStorage.getItem('token');

    const nameDisplay = document.getElementById('userNameDisplay');
    if (nameDisplay && usuarioData) {
        try {
            const usuario = JSON.parse(usuarioData);
            nameDisplay.textContent = usuario.nombre || 'Usuario';
        } catch (error) {
            nameDisplay.textContent = 'Usuario';
        }
    }

    const logoutBtn = document.querySelector('a[href="../../login.html"]');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            safeStorage.clear(); // Borra token y datos de usuario
        });
    }

    // --- LÓGICA DE CAMBIO DE CONTRASEÑA (RESETEO REAL) ---
    const recoveryForm = document.getElementById('recoveryForm');
    if (recoveryForm) {
        recoveryForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const submitBtn = document.getElementById('submitBtn');

            // 1. Validar que las contraseñas coincidan
            if (newPassword !== confirmPassword) {
                AlertSystem.error('Error', 'Las contraseñas no coinciden. Intenta de nuevo.');
                return;
            }

            // 2. Extraer el token de la URL (ej: ?token=abcd-1234)
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');

            if (!token) {
                AlertSystem.error('Error', 'No se encontró un token de recuperación válido.');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Actualizando...';

            try {
                // 3. Enviar la petición al nuevo Endpoint
                const response = await fetch(`${API_AUTH}/reset-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token, newPassword })
                });

                const data = await response.json();

                if (response.ok) {
                    // Limpiar la URL por seguridad (quitar el token visible)
                    window.history.replaceState({}, document.title, window.location.pathname);

                    AlertSystem.success('¡Éxito!', 'Tu contraseña se ha actualizado correctamente.', () => {
                        window.location.href = 'login.html'; // Redirigir al login
                    });
                } else {
                    AlertSystem.error('Error', data.message);
                }
            } catch (error) {
                AlertSystem.error('Error', 'Problema al conectar con el servidor.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Confirmar';
            }
        });
    }
});
