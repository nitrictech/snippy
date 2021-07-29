module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.[jt]s?(x)'],
  roots: ['snippets'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
