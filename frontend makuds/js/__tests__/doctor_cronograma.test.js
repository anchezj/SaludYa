const { loadScript, flushPromises } = require('./testHelpers');

describe('doctor_cronograma.js', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="calendar"></div>
      <button class="schedule-report-btn"></button>
    `;
    window.CitasStore = {
      fetchAll: jest.fn(() => Promise.resolve([
        {
          id_cita: 'c-1',
          especialidad: 'General',
          paciente: 'Ana',
          estado: 'cancelada',
          fecha_hora: '2026-05-23T08:00:00.000Z'
        }
      ])),
      subscribe: jest.fn(() => () => {})
    };
    const calendarApi = {
      render: jest.fn(),
      removeAllEvents: jest.fn(),
      addEventSource: jest.fn()
    };
    window.FullCalendar = {
      Calendar: jest.fn(() => calendarApi)
    };
  });

  test('carga las citas en el calendario con colores por estado', async () => {
    loadScript('../doctor_cronograma.js');

    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    expect(window.FullCalendar.Calendar).toHaveBeenCalled();
    const calendarApi = window.FullCalendar.Calendar.mock.results[0].value;
    expect(calendarApi.render).toHaveBeenCalled();
    expect(calendarApi.removeAllEvents).toHaveBeenCalled();
    expect(calendarApi.addEventSource).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'c-1',
        title: 'General - Ana - CANCELADA',
        backgroundColor: '#dc3545',
        borderColor: '#dc3545',
        textColor: '#000'
      })
    ]);
  });

  test('sale temprano si no hay calendario o FullCalendar', async () => {
    document.body.innerHTML = '';
    window.FullCalendar = undefined;

    loadScript('../doctor_cronograma.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    expect(window.CitasStore.fetchAll).not.toHaveBeenCalled();
  });

  test('soporta errores al cargar citas', async () => {
    window.CitasStore.fetchAll.mockRejectedValueOnce(new Error('db down'));

    loadScript('../doctor_cronograma.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    expect(window.CitasStore.fetchAll).toHaveBeenCalled();
  });

  test('renderiza el contenido personalizado de los eventos', async () => {
    loadScript('../doctor_cronograma.js');

    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushPromises();

    const calendarOptions = window.FullCalendar.Calendar.mock.calls[0][1];
    const rendered = calendarOptions.eventContent({
      event: {
        title: 'General - Ana - CANCELADA'
      }
    });

    expect(rendered.domNodes).toHaveLength(1);
    expect(rendered.domNodes[0].querySelector('.fc-event-title').textContent).toBe(
      'General - Ana - CANCELADA'
    );
  });
});
