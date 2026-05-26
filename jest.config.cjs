module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/?(*.)+(test).[jt]s'],
  clearMocks: true,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'Backend/src/**/*.js',
    'frontend/js/**/*.js',
    '!Backend/src/**/__tests__/**',
    '!frontend/js/**/__tests__/**'
  ]
};
