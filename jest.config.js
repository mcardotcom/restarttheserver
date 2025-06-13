const nextJest = require('next/jest')({
  dir: './',
});

const customJestConfig = {
  // A list of paths to directories that Jest should use to search for files in.
  // We are explicitly telling Jest to look for tests in the 'src' directory.
  roots: ['<rootDir>/src'],

  // The test environment that will be used for testing
  testEnvironment: 'jest-environment-jsdom',

  // A list of paths to modules that run some code to configure or set up the testing framework before each test.
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // The glob patterns Jest uses to detect test files
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}'
  ],

  // A map from regular expressions to module names that allow to stub out resources
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
  },

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
  ],

  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
};

module.exports = nextJest(customJestConfig); 