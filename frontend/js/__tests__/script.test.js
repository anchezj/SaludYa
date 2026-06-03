const { loadScript, flushPromises } = require('./testHelpers');

describe('script.js', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    window.AlertSystem = {
      success: jest.fn((title, message, callback) => {
        if (typeof callback === 'function') callback();
      }),
      error: jest.fn()
    };
    global.fetch = jest.fn();
  });

  test('inicia sesiÃ³n y llama al flujo de Ã©xito del especialista', async () => {
    document.body.innerHTML = `
      <h2 id="formTitle">INICIAR SESION</h2>
      <form id="authForm">
        <input id="username" value="doctor@test.com">
        <input id="password" value="123456">
        <input type="radio" name="role" value="especialista" checked>
      </form>
      <div id="userNameDisplay"></div>
    `;
    window.history.pushState({}, '', '/login.html');

    fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        token: 'token-123',
        usuario: { rol: 'especialista', nombre: 'Dr. Ana' }
      })
    });

    loadScript('../script.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    document.getElementById('authForm').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );
    await flushPromises();

    expect(fetch).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({
        method: 'POST'
      })
    );
    expect(window.AlertSystem.success).toHaveBeenCalledWith(
      'Inicio de sesión exitoso',
      'Bienvenido a SaludYa',
      expect.any(Function)
    );
  });

  test('rechaza el inicio de sesiÃ³n cuando el rol no coincide', async () => {
    document.body.innerHTML = `
      <h2 id="formTitle">INICIAR SESION</h2>
      <form id="authForm">
        <input id="username" value="doctor@test.com">
        <input id="password" value="123456">
        <input type="radio" name="role" value="afiliado" checked>
      </form>
    `;
    window.history.pushState({}, '', '/login.html');

    fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        token: 'token-123',
        usuario: { rol: 'especialista', nombre: 'Dr. Ana' }
      })
    });

    loadScript('../script.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    document.getElementById('authForm').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );
    await flushPromises();

    expect(window.AlertSystem.error).toHaveBeenCalledWith(
      'El rol seleccionado no coincide con tu cuenta'
    );
  });

  test('rechaza el inicio de sesiÃ³n si el backend falla', async () => {
    document.body.innerHTML = `
      <h2 id="formTitle">INICIAR SESION</h2>
      <form id="authForm">
        <input id="username" value="doctor@test.com">
        <input id="password" value="123456">
        <input type="radio" name="role" value="especialista" checked>
      </form>
    `;
    window.history.pushState({}, '', '/login.html');

    fetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ message: 'Credenciales inválidas.' })
    });

    loadScript('../script.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    document.getElementById('authForm').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );
    await flushPromises();

    expect(window.AlertSystem.error).toHaveBeenCalledWith('Error: Credenciales inválidas.');
  });

  test('muestra error cuando falla la conexiÃ³n al iniciar sesiÃ³n', async () => {
    document.body.innerHTML = `
      <h2 id="formTitle">INICIAR SESION</h2>
      <form id="authForm">
        <input id="username" value="doctor@test.com">
        <input id="password" value="123456">
        <input type="radio" name="role" value="especialista" checked>
      </form>
    `;
    window.history.pushState({}, '', '/login.html');

    fetch.mockRejectedValueOnce(new Error('network'));

    loadScript('../script.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    document.getElementById('authForm').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );
    await flushPromises();

    expect(window.AlertSystem.error).toHaveBeenCalledWith(
      'Error: al conectar con el servidor.'
    );
  });

  test('envÃ­a la solicitud de recuperaciÃ³n de contraseÃ±a', async () => {
    document.body.innerHTML = `
      <form id="forgotPasswordForm">
        <input id="email" value="paciente@test.com">
        <button id="submitBtn">ENVIAR ENLACE</button>
      </form>
    `;
    window.history.pushState({}, '', '/olvido_contrasena.html');

    fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ message: 'ok' })
    });

    loadScript('../script.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    document.getElementById('forgotPasswordForm').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );
    await flushPromises();

    expect(fetch).toHaveBeenCalledWith(
      '/api/auth/forgot-password',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'paciente@test.com' })
      })
    );
    expect(window.AlertSystem.success).toHaveBeenCalled();
  });

  test('muestra error cuando falla la conexiÃ³n en la recuperaciÃ³n', async () => {
    document.body.innerHTML = `
      <form id="forgotPasswordForm">
        <input id="email" value="paciente@test.com">
        <button id="submitBtn">ENVIAR ENLACE</button>
      </form>
    `;
    window.history.pushState({}, '', '/olvido_contrasena.html');

    fetch.mockRejectedValueOnce(new Error('network'));

    loadScript('../script.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    document.getElementById('forgotPasswordForm').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );
    await flushPromises();

    expect(window.AlertSystem.error).toHaveBeenCalledWith(
      'Error: al conectar con el servidor.'
    );
  });

  test('rechaza el registro si las contraseñas no coinciden', async () => {
    document.body.innerHTML = `
      <h2 id="formTitle">REGISTRARSE</h2>
      <form id="authForm">
        <input id="username" value="Ana">
        <input id="email" value="ana@test.com">
        <input id="password" value="123456">
        <input id="confirmPassword" value="654321">
      </form>
    `;
    window.history.pushState({}, '', '/registro.html');

    loadScript('../script.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    document.getElementById('authForm').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );
    await flushPromises();

    expect(window.AlertSystem.error).toHaveBeenCalledWith('Contraseñas no coinciden');
  });

  test('muestra error cuando falla el registro', async () => {
    document.body.innerHTML = `
      <h2 id="formTitle">REGISTRARSE</h2>
      <form id="authForm">
        <input id="username" value="Ana">
        <input id="email" value="ana@test.com">
        <input id="password" value="123456">
        <input id="confirmPassword" value="123456">
      </form>
    `;
    window.history.pushState({}, '', '/registro.html');

    fetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ message: 'Ya existe' })
    });

    loadScript('../script.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    document.getElementById('authForm').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );
    await flushPromises();

    expect(window.AlertSystem.error).toHaveBeenCalledWith('Error: Ya existe');
  });

  test('muestra error cuando falla la conexiÃ³n en el registro', async () => {
    document.body.innerHTML = `
      <h2 id="formTitle">REGISTRARSE</h2>
      <form id="authForm">
        <input id="username" value="Ana">
        <input id="email" value="ana@test.com">
        <input id="password" value="123456">
        <input id="confirmPassword" value="123456">
      </form>
    `;
    window.history.pushState({}, '', '/registro.html');

    fetch.mockRejectedValueOnce(new Error('network'));

    loadScript('../script.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    document.getElementById('authForm').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );
    await flushPromises();

    expect(window.AlertSystem.error).toHaveBeenCalledWith(
      'Error al conectar con el servidor.'
    );
  });

  test('rechaza recuperación si las contraseñas no coinciden', async () => {
    document.body.innerHTML = `
      <form id="recoveryForm">
        <input id="newPassword" value="nueva123">
        <input id="confirmPassword" value="otra123">
        <button id="submitBtn">Confirmar</button>
      </form>
    `;
    window.history.pushState({}, '', '/cambio_contrasena.html?token=abc-123');

    loadScript('../script.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    document.getElementById('recoveryForm').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );
    await flushPromises();

    expect(window.AlertSystem.error).toHaveBeenCalledWith(
      'Error',
      'Las contraseñas no coinciden. Intenta de nuevo.'
    );
  });

  test('rechaza recuperación si no hay token', async () => {
    document.body.innerHTML = `
      <form id="recoveryForm">
        <input id="newPassword" value="nueva123">
        <input id="confirmPassword" value="nueva123">
        <button id="submitBtn">Confirmar</button>
      </form>
    `;
    window.history.pushState({}, '', '/cambio_contrasena.html');

    loadScript('../script.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    document.getElementById('recoveryForm').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );
    await flushPromises();

    expect(window.AlertSystem.error).toHaveBeenCalledWith(
      'Error',
      'No se encontró un token de recuperación válido.'
    );
  });

  test('restablece la contraseña cuando el token es válido', async () => {
    document.body.innerHTML = `
      <form id="recoveryForm">
        <input id="newPassword" value="nueva123">
        <input id="confirmPassword" value="nueva123">
        <button id="submitBtn">Confirmar</button>
      </form>
    `;
    window.history.pushState({}, '', '/cambio_contrasena.html?token=abc-123');

    fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ message: 'ok' })
    });

    loadScript('../script.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    document.getElementById('recoveryForm').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );
    await flushPromises();

    expect(fetch).toHaveBeenCalledWith(
      '/api/auth/reset-password',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ token: 'abc-123', newPassword: 'nueva123' })
      })
    );
    expect(window.AlertSystem.success).toHaveBeenCalled();
  });

  test('muestra error cuando falla la conexión al cambiar la contraseña', async () => {
    document.body.innerHTML = `
      <form id="recoveryForm">
        <input id="newPassword" value="nueva123">
        <input id="confirmPassword" value="nueva123">
        <button id="submitBtn">Confirmar</button>
      </form>
    `;
    window.history.pushState({}, '', '/cambio_contrasena.html?token=abc-123');

    fetch.mockRejectedValueOnce(new Error('network'));

    loadScript('../script.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    document.getElementById('recoveryForm').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );
    await flushPromises();

    expect(window.AlertSystem.error).toHaveBeenCalledWith(
      'Error',
      'Problema al conectar con el servidor.'
    );
  });

  test('redirige al dashboard cuando ya hay sesiÃ³n en login', async () => {
    localStorage.setItem('token', 'token-123');
    localStorage.setItem('usuario', JSON.stringify({ nombre: 'Ana' }));
    document.body.innerHTML = `
      <h2 id="formTitle">INICIAR SESION</h2>
      <form id="authForm"></form>
    `;
    window.history.pushState({}, '', '/login.html');

    loadScript('../script.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    expect(localStorage.getItem('token')).toBe('token-123');
  });

  test('limpia la sesiÃ³n al hacer logout', async () => {
    localStorage.setItem('token', 'token-123');
    localStorage.setItem('usuario', JSON.stringify({ nombre: 'Ana' }));
    document.body.innerHTML = `
      <a href="../../login.html">Salir</a>
      <div id="userNameDisplay"></div>
    `;
    window.history.pushState({}, '', '/views/Doctor/cronograma_citas.html');

    loadScript('../script.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    document.querySelector('a[href="../../login.html"]').dispatchEvent(
      new Event('click', { bubbles: true, cancelable: true })
    );

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('usuario')).toBeNull();
  });
});
