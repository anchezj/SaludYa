const { loadScript, flushPromises } = require('./testHelpers');

describe('pacientes_programados.js', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <table>
        <tbody id="citas-body"></tbody>
      </table>
      <button class="filter-btn active" data-status="todas">Todas</button>
      <button class="filter-btn" data-status="cancelada">Canceladas</button>
      <div id="estado-modal" style="display:none;">
        <button id="modal-cerrar">Cerrar</button>
        <button class="modal-btn" data-estado="cancelada">Cancelada</button>
      </div>
    `;

    localStorage.clear();
    localStorage.setItem('token', 'token-123');

    window.AlertSystem = {
      success: jest.fn(),
      error: jest.fn()
    };

    window.CitasStore = {
      getToken: jest.fn(() => 'token-123'),
      fetchAll: jest.fn(() => Promise.resolve([
        {
          id_cita: 1,
          fecha_hora: '2026-05-23T09:30:00.000Z',
          especialidad: 'Medicina General',
          paciente: 'Ana Perez',
          motivo: 'Control',
          estado: 'programada'
        },
        {
          id_cita: 2,
          fecha_hora: '2026-05-23T10:30:00.000Z',
          especialidad: 'Pediatría',
          paciente: 'Luis Gomez',
          motivo: 'Consulta',
          estado: 'cancelada'
        }
      ])),
      refresh: jest.fn(() => Promise.resolve()),
      subscribe: jest.fn(() => () => {})
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: jest.fn().mockResolvedValue({})
      })
    );
  });

  test('renderiza las citas y filtra por estado', async () => {
    loadScript('../pacientes_programados.js');

    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    const rows = document.querySelectorAll('#citas-body tr.cita');
    expect(rows).toHaveLength(2);
    expect(rows[0].textContent).toContain('Ana Perez');
    expect(rows[1].textContent).toContain('Luis Gomez');

    document.querySelector('.filter-btn[data-status="cancelada"]').click();

    expect(rows[0].style.display).toBe('none');
    expect(rows[1].style.display).toBe('');
  });

  test('abre el modal y cambia el estado de una cita', async () => {
    loadScript('../pacientes_programados.js');

    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    document.querySelector('.cambiar-estado').click();

    const modal = document.getElementById('estado-modal');
    expect(modal.style.display).toBe('flex');
    expect(modal.dataset.estadoActual).toBe('programada');

    document.querySelector('.modal-btn[data-estado="cancelada"]').click();
    await flushPromises();

    expect(fetch).toHaveBeenCalledWith(
      '/api/citas/estado/1',
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          Authorization: 'Bearer token-123'
        }),
        body: JSON.stringify({ nuevoEstado: 'cancelada' })
      })
    );
    expect(window.AlertSystem.success).toHaveBeenCalledWith(
      'Actualizado',
      'Cita cancelada'
    );
    expect(window.CitasStore.refresh).toHaveBeenCalled();
  });
});
