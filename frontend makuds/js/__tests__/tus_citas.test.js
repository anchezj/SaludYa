const { loadScript, flushPromises } = require('./testHelpers');

describe('tus_citas.js', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'token-123');
    document.body.innerHTML = `
      <table><tbody id="citas-tbody"></tbody></table>
    `;
    window.AlertSystem = {
      error: jest.fn()
    };
    window.CitasStore = {
      getToken: jest.fn(() => 'token-123'),
      getCurrentUserId: jest.fn(() => 'user-1'),
      fetchAll: jest.fn(() => Promise.resolve([
        {
          id_usuario: 'user-1',
          fecha_hora: '2026-05-23T08:00:00.000Z',
          especialidad: 'General',
          motivo: 'Control',
          estado: 'programada'
        },
        {
          id_usuario: 'user-2',
          fecha_hora: '2026-05-23T09:00:00.000Z',
          especialidad: 'Pediatría',
          motivo: 'Consulta',
          estado: 'cancelada'
        }
      ])),
      subscribe: jest.fn(() => () => {})
    };
  });

  test('muestra solo las citas del usuario actual', async () => {
    loadScript('../tus_citas.js');

    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    const rows = document.querySelectorAll('#citas-tbody tr');
    expect(rows).toHaveLength(1);
    expect(rows[0].textContent).toContain('General');
    expect(rows[0].textContent).toContain('Control');
  });

  test('redirige al login cuando no hay token', async () => {
    localStorage.removeItem('token');
    window.CitasStore.getToken.mockReturnValue(null);
    loadScript('../tus_citas.js');

    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    expect(window.CitasStore.fetchAll).not.toHaveBeenCalled();
  });

  test('muestra mensaje cuando no hay citas del usuario', async () => {
    window.CitasStore.getCurrentUserId.mockReturnValue('user-3');
    loadScript('../tus_citas.js');

    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    expect(document.querySelector('#citas-tbody').textContent).toContain('No tienes citas agendadas aún.');
  });

  test('muestra error si falla la consulta', async () => {
    window.CitasStore.fetchAll.mockRejectedValueOnce(new Error('db down'));
    loadScript('../tus_citas.js');

    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    expect(window.AlertSystem.error).toHaveBeenCalledWith(
      'Error',
      'Hubo un problema de conexión con el servidor.'
    );
  });
});
