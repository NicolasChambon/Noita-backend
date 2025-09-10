export default {
  // Use TypeScript preset
  preset: 'ts-jest/presets/default-esm',

  // Use Node.js environment
  testEnvironment: 'node',

  // Enable ES modules
  extensionsToTreatAsEsm: ['.ts'],

  // Transform files
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: './tsconfig.json',
      },
    ],
  },

  // Test file patterns
  testMatch: ['**/tests/**/*.test.ts'],

  // Coverage configuration
  collectCoverage: false,

  // Setup files
  //setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],

  // Global setup and teardown for integration tests
  globalSetup: '<rootDir>/tests/globalSetup.ts',
  globalTeardown: '<rootDir>/tests/globalTeardown.ts',

  // Clear mocks between tests
  clearMocks: true,

  // Timeout
  testTimeout: 30000,

  // Run tests sequentially to avoid database conflicts
  maxWorkers: 1,

  // Module name mapping
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // Verbose output
  verbose: true,

  // Transform ignore patterns
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$))'],
};
