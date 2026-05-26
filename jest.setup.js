// Jest Setup File
// Establecemos NODE_ENV como 'test' para que los módulos sepan que están en ambiente de pruebas
process.env.NODE_ENV = 'test';

// Polyfill para setImmediate en jsdom si es necesario
if (typeof setImmediate === 'undefined') {
    global.setImmediate = setTimeout;
}
