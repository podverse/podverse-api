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
  testPathIgnorePatterns: ['node_modules', 'setupTests.ts', '.*.*/.*.itest.ts']
}
