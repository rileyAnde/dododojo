/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm',   // ESM support with ts-jest
  testEnvironment: 'node',

  // Allow TS imports with .js extension (ESM rule)
  extensionsToTreatAsEsm: ['.ts'],

  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: './tsconfig.json',
    },
  },

  // Allow running .ts test files
  moduleFileExtensions: ['ts', 'js', 'json'],

  // Where your tests live
  testMatch: ['**/?(*.)+(test).[tj]s'],
};