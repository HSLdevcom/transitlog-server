module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(spec|test).ts',
    '<rootDir>/src/**/?(*.)(spec|test).ts',
  ],
  collectCoverageFrom: ['src/**/*.{js,ts,tsx}', '!src/**/*.d.ts'],
}
