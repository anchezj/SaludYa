const { loadScript } = require('./testHelpers');

describe('AlertSystem', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('muestra una alerta y ejecuta el callback de confirmación', () => {
    loadScript('../alerts.js');

    const confirm = jest.fn();
    window.AlertSystem.success('Éxito', 'Guardado', confirm);

    const overlay = document.querySelector('.alert-overlay');
    expect(overlay).not.toBeNull();
    expect(overlay.textContent).toContain('Éxito');
    expect(overlay.textContent).toContain('Guardado');

    overlay.querySelector('.btn-confirm').click();
    jest.runAllTimers();

    expect(confirm).toHaveBeenCalled();
    expect(document.querySelector('.alert-overlay')).toBeNull();
  });

  test('alerta de error usa el ícono correcto', () => {
    loadScript('../alerts.js');

    window.AlertSystem.error('Error', 'Algo salió mal');

    expect(document.querySelector('.alert-error')).not.toBeNull();
  });

  test('confirm llama al callback correcto', () => {
    loadScript('../alerts.js');

    const confirm = jest.fn();
    window.AlertSystem.confirm('¿Seguro?', 'Confirma la acción', confirm);

    document.querySelector('.btn-confirm').click();
    jest.runAllTimers();

    expect(confirm).toHaveBeenCalled();
  });

  test('info y loading renderizan sus estados', () => {
    loadScript('../alerts.js');

    window.AlertSystem.info('Info', 'Detalle');
    expect(document.querySelector('.alert-info')).not.toBeNull();

    window.AlertSystem.loading('Cargando', 'Espere');
    expect(document.querySelectorAll('.alert-overlay')).toHaveLength(2);
    expect(document.querySelector('.alert-loading')).not.toBeNull();
  });
});
