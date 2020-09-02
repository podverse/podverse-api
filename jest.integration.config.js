module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.json"
    }
  },
  "moduleNameMapper": {
    "^~/(.*)$": "<rootDir>/src/$1"
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/integration/setupTests.ts'],
  testRegex: ['itest\\.ts$'],
  testSequencer: './__tests__/integration/customSequencer.ts'
}
