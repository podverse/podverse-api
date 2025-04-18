module.exports = {
  preset: "ts-jest",
  testMatch: ["<rootDir>/tests/e2e/**/*.e2e.test.ts"],
  globalSetup: "<rootDir>/tests/e2e/globalSetup.ts",
  globalTeardown: "<rootDir>/tests/e2e/globalTeardown.ts",
  setupFilesAfterEnv: ["<rootDir>/tests/e2e/setup.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig-test.json",
    },
  },
  moduleNameMapper: {
    "^@api/(.*)$": "<rootDir>/src/$1",
    "^@external-services/(.*)$": "<rootDir>/node_modules/podverse-external-services/dist/$1",
    "^@helpers/(.*)$": "<rootDir>/node_modules/podverse-helpers/dist/$1",
    "^@orm/(.*)$": "<rootDir>/node_modules/podverse-orm/dist/$1",
    "^@parser/(.*)$": "<rootDir>/node_modules/podverse-parser/dist/$1",
  }
};