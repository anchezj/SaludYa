const path = require('path');

function loadScript(relativePath) {
  const scriptPath = path.resolve(__dirname, relativePath);
  delete require.cache[scriptPath];
  return require(scriptPath);
}

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function mockLocation({ pathname = '/login.html', search = '' } = {}) {
  try {
    delete window.location;
  } catch {
    // Ignore if jsdom refuses deletion; defineProperty below still works in practice.
  }

  Object.defineProperty(window, 'location', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: {
      href: `http://localhost${pathname}${search}`,
      pathname,
      search,
      assign: jest.fn(),
      replace: jest.fn()
    }
  });
}

module.exports = {
  loadScript,
  flushPromises,
  mockLocation
};
