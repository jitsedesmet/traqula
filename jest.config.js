export default {
  transform: {},
  testRegex: 'test/.*-test\\.ts$',
  moduleFileExtensions: [
    'ts',
    'js',
  ],
  extensionsToTreatAsEsm: [ '.ts' ],
  testEnvironment: 'node',
  collectCoverage: true,
  coverageReporters: [ 'text', 'lcov' ],
  coveragePathIgnorePatterns: [
    '/bin/',
    '/node_modules/',
    '/test/',
  ],
};
