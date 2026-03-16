module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/api/v1/tests/unit'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.test.json'
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@config$': '<rootDir>/src/config',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@helpers/(.*)$': '<rootDir>/src/api/v1/helpers/$1',
    '^@utils/(.*)$': '<rootDir>/src/api/v1/utils/$1',
    '^@services/(.*)$': '<rootDir>/src/api/v1/services/$1',
    '^@repositories/(.*)$': '<rootDir>/src/api/v1/repositories/$1',
    '^@interfaces/(.*)$': '<rootDir>/src/api/v1/interfaces/$1',
    '^@models/(.*)$': '<rootDir>/src/api/v1/models/$1',
    '^@controllers/(.*)$': '<rootDir>/src/api/v1/controllers/$1',
    '^@dtos/(.*)$': '<rootDir>/src/api/v1/dtos/$1',
    '^@routes/(.*)$': '<rootDir>/src/api/v1/routes/$1',
    '^@middlewares/(.*)$': '<rootDir>/src/api/v1/middlewares/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/api/v1/tests/setup.ts'],
  testTimeout: 30000,
};
