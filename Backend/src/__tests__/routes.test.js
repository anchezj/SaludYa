const { TextDecoder, TextEncoder } = require('util');

global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;

jest.mock('../controllers/authController', () => ({
  register: jest.fn(),
  login: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  getProfile: jest.fn(),
  updateProfile: jest.fn()
}));

jest.mock('../controllers/citasController', () => ({
  crearCita: jest.fn(),
  obtenerMisCitas: jest.fn(),
  obtenerTodasCitas: jest.fn(),
  actualizarEstado: jest.fn()
}));

jest.mock('../middlewares/authMiddleware', () => jest.fn());

describe('routes', () => {
  test('authRoutes expone las rutas esperadas', () => {
    const router = require('../routes/authRoutes');
    const routes = router.stack
      .filter((layer) => layer.route)
      .map((layer) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods)
      }));

    expect(routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '/register', methods: ['post'] }),
        expect.objectContaining({ path: '/login', methods: ['post'] }),
        expect.objectContaining({ path: '/forgot-password', methods: ['post'] }),
        expect.objectContaining({ path: '/reset-password', methods: ['post'] })
      ])
    );
  });

  test('citasRoutes expone las rutas esperadas', () => {
    const router = require('../routes/citasRoutes');
    const routes = router.stack
      .filter((layer) => layer.route)
      .map((layer) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods)
      }));

    expect(routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '/crear', methods: ['post'] }),
        expect.objectContaining({ path: '/mis-citas', methods: ['get'] }),
        expect.objectContaining({ path: '/todas', methods: ['get'] }),
        expect.objectContaining({ path: '/estado/:id_cita', methods: ['put'] })
      ])
    );
  });
});
