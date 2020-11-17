module.exports = {
  preset: 'ts-jest',
  tsConfig: './tsconfig.test.json',
  testEnvironment: 'node',
  collectCoverage: false,
  coveragePathIgnorePatterns: ['/node_modules/'],
  testPathIgnorePatterns: ['/node_modules/', '/lib/'],
};
