const { loadScript } = require('./testHelpers');

function makeToken(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `header.${encoded}.signature`;
}

describe('CitasStore', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
    global.fetch = jest.fn();
  });

  test('obtiene el id del usuario desde el token', () => {
    localStorage.setItem('token', makeToken({ usuario: { id: 42 } }));

    loadScript('../citas_store.js');

    expect(window.CitasStore.getToken()).toBe(localStorage.getItem('token'));
    expect(window.CitasStore.getCurrentUserId()).toBe(42);
  });

  test('devuelve null si el token no se puede decodificar', () => {
    localStorage.setItem('token', 'bad.token');

    loadScript('../citas_store.js');

    expect(window.CitasStore.getCurrentUserId()).toBeNull();
  });

  test('getCached devuelve una lista vacÃ­a si la cache es invÃ¡lida', () => {
    localStorage.setItem('saludya:citas-cache', 'invalid-json');

    loadScript('../citas_store.js');

    expect(window.CitasStore.getCached()).toEqual([]);
  });

  test('getCached devuelve una lista vacÃ­a si la cache no trae un arreglo', () => {
    localStorage.setItem('saludya:citas-cache', JSON.stringify({ citas: { id: 1 } }));

    loadScript('../citas_store.js');

    expect(window.CitasStore.getCached()).toEqual([]);
  });

  test('fetchAll devuelve un arreglo vacÃ­o sin token', async () => {
    loadScript('../citas_store.js');

    await expect(window.CitasStore.fetchAll()).resolves.toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  test('refresh guarda la cache y notifica la actualizaciÃ³n', async () => {
    localStorage.setItem('token', makeToken({ usuario: { id: 7 } }));
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([{ id_cita: 1, estado: 'programada' }])
    });

    loadScript('../citas_store.js');

    const listener = jest.fn();
    window.CitasStore.subscribe(listener);

    const citas = await window.CitasStore.refresh();

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/citas/todas',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: `Bearer ${localStorage.getItem('token')}`
        })
      })
    );
    expect(citas).toEqual([{ id_cita: 1, estado: 'programada' }]);
    expect(JSON.parse(localStorage.getItem('saludya:citas-cache'))).toEqual(
      expect.objectContaining({
        citas: [{ id_cita: 1, estado: 'programada' }]
      })
    );
    expect(localStorage.getItem('saludya:citas-updated')).toEqual(expect.any(String));
    expect(listener).toHaveBeenCalled();
  });

  test('notify usa listeners de storage cuando no hay BroadcastChannel', () => {
    const originalBroadcastChannel = global.BroadcastChannel;
    global.BroadcastChannel = undefined;
    window.BroadcastChannel = undefined;

    loadScript('../citas_store.js');

    const listener = jest.fn();
    window.CitasStore.subscribe(listener);

    const event = new Event('storage');
    Object.defineProperty(event, 'key', {
      value: 'saludya:citas-updated'
    });

    window.dispatchEvent(event);

    expect(listener).toHaveBeenCalled();

    global.BroadcastChannel = originalBroadcastChannel;
    window.BroadcastChannel = originalBroadcastChannel;
  });

  test('fetchAll lanza error cuando la API responde mal', async () => {
    localStorage.setItem('token', makeToken({ usuario: { id: 7 } }));
    global.fetch.mockResolvedValue({
      ok: false,
      json: jest.fn()
    });

    loadScript('../citas_store.js');

    await expect(window.CitasStore.fetchAll()).rejects.toThrow(
      'No se pudieron cargar las citas.'
    );
  });
});
