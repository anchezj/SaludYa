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
});

document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtener los datos del localStorage
    const usuarioData = localStorage.getItem('usuario');
    const token = localStorage.getItem('token');

    // 2. Seguridad: Si no hay token o datos, mandar al login
    if (!usuarioData || !token) {
        window.location.href = '../../login.html';
        return;
    }

    // 3. Convertir los datos de texto a un objeto real
    const usuario = JSON.parse(usuarioData);

    // 4. Mostrar el nombre en el sidebar
    const nameDisplay = document.getElementById('userNameDisplay');
    if (nameDisplay && usuario.nombre) {
        nameDisplay.textContent = usuario.nombre;
    }
});
