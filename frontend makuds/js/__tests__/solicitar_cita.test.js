const { loadScript } = require('./testHelpers');

function buildOccupiedSlots() {
  const slots = [];

  for (let hour = 8; hour <= 17; hour += 1) {
    ['00', '30'].forEach((minute) => {
      if (hour === 17 && minute === '30') return;
      slots.push({
        fecha_hora: `2026-05-23T${String(hour).padStart(2, '0')}:${minute}:00`,
        especialidad: 'General',
        estado: 'programada'
      });
    });
  }

  return slots;
}

describe('solicitar_cita.js', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-23T12:00:00.000Z'));
    localStorage.clear();
    document.body.innerHTML = `
      <div class="custom-select">General</div>
      <div class="select-dropdown"></div>
      <div id="calendar-days"></div>
      <div id="calendar-month-year"></div>
      <button id="prev-month"></button>
      <button id="next-month"></button>
      <div id="display-day"></div>
      <div id="display-month-year"></div>
      <div class="select-option">General</div>
      <div class="select-option">Pediatría</div>
      <table><tbody id="citas-tbody"></tbody></table>
    `;
    window.AlertSystem = {
      success: jest.fn((title, message, callback) => {
        if (typeof callback === 'function') callback();
      }),
      error: jest.fn()
    };
    window.CitasStore = {
      fetchAll: jest.fn(() => Promise.resolve([]))
    };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: jest.fn().mockResolvedValue({ message: 'ok' })
      })
    );
    localStorage.setItem('token', 'token-123');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('genera turnos disponibles y agenda una cita', async () => {
    loadScript('../solicitar_cita.js');

    document.dispatchEvent(new Event('DOMContentLoaded'));
    await Promise.resolve();
    await Promise.resolve();

    const button = document.querySelector('.btn-seleccionar');
    expect(button).not.toBeNull();

    button.click();
    await Promise.resolve();
    await Promise.resolve();

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/citas/crear',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer token-123'
        })
      })
    );
    expect(window.AlertSystem.success).toHaveBeenCalled();
  });

  test('redirige al login cuando no hay token', async () => {
    localStorage.removeItem('token');
    loadScript('../solicitar_cita.js');

    document.dispatchEvent(new Event('DOMContentLoaded'));
    await Promise.resolve();

    document.querySelector('.btn-seleccionar').click();
    await Promise.resolve();

    expect(window.AlertSystem.error).toHaveBeenCalledWith(
      'Error',
      'Debes iniciar sesión para agendar una cita.'
    );
  });

  test('muestra un mensaje cuando el backend responde mal', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'No se pudo crear' })
      })
    );

    loadScript('../solicitar_cita.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await Promise.resolve();
    await Promise.resolve();

    document.querySelector('.btn-seleccionar').click();
    await Promise.resolve();
    await Promise.resolve();

    expect(window.AlertSystem.error).toHaveBeenCalledWith('Error', 'No se pudo crear');
  });

  test('muestra error cuando falla la conexiÃ³n', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('network')));

    loadScript('../solicitar_cita.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await Promise.resolve();
    await Promise.resolve();

    document.querySelector('.btn-seleccionar').click();
    await Promise.resolve();
    await Promise.resolve();

    expect(window.AlertSystem.error).toHaveBeenCalledWith(
      'Error',
      'Hubo un problema de conexión con el servidor.'
    );
  });

  test('muestra un mensaje cuando no hay horarios disponibles', async () => {
    window.CitasStore.fetchAll = jest.fn(() => Promise.resolve(buildOccupiedSlots()));

    loadScript('../solicitar_cita.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await Promise.resolve();
    await Promise.resolve();

    expect(document.querySelector('#citas-tbody').textContent).toContain(
      'No hay horarios disponibles para esta especialidad en la fecha seleccionada.'
    );
    expect(document.querySelector('.btn-seleccionar')).toBeNull();
  });

  test('muestra error cuando falla la consulta de citas ocupadas', async () => {
    window.CitasStore.fetchAll = jest.fn(() => Promise.reject(new Error('db down')));

    loadScript('../solicitar_cita.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await Promise.resolve();
    await Promise.resolve();

    expect(window.CitasStore.fetchAll).toHaveBeenCalled();
  });

  test('permite seleccionar un dia del calendario', async () => {
    loadScript('../solicitar_cita.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await Promise.resolve();
    await Promise.resolve();

    const day24 = Array.from(document.querySelectorAll('.calendar-day'))
      .find((day) => day.textContent === '24');

    expect(day24).toBeDefined();
    day24.click();

    expect(document.getElementById('display-day').textContent).toBe('24');
  });

  test('retrocede al mes anterior cuando empieza en enero', async () => {
    jest.setSystemTime(new Date('2026-01-15T12:00:00.000Z'));
    loadScript('../solicitar_cita.js');

    document.dispatchEvent(new Event('DOMContentLoaded'));
    await Promise.resolve();
    await Promise.resolve();

    document.getElementById('prev-month').click();

    expect(document.getElementById('calendar-month-year').textContent).toContain(
      'Diciembre de 2025'
    );
  });

  test('avanza al mes siguiente cuando termina en diciembre', async () => {
    jest.setSystemTime(new Date('2026-12-15T12:00:00.000Z'));
    loadScript('../solicitar_cita.js');

    document.dispatchEvent(new Event('DOMContentLoaded'));
    await Promise.resolve();
    await Promise.resolve();

    document.getElementById('next-month').click();

    expect(document.getElementById('calendar-month-year').textContent).toContain(
      'Enero de 2027'
    );
  });

  test('permite cambiar especialidad y mes', async () => {
    loadScript('../solicitar_cita.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await Promise.resolve();
    await Promise.resolve();

    document.querySelector('.custom-select').click();
    document.querySelector('.select-option')?.click();

    document.getElementById('next-month').click();
    document.getElementById('prev-month').click();

    expect(window.CitasStore.fetchAll).toHaveBeenCalled();
  });
});
