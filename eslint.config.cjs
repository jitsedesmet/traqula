const config = require('@rubensworks/eslint-config');

module.exports = config([
  {
    files: [ '**/*.ts' ],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [ './tsconfig.eslint.json' ],
      },
    },
  },
  {
    rules: {
      // Default
      'unicorn/consistent-destructuring': 'off',
      'unicorn/no-array-callback-reference': 'off',

      // TODO: check if these can be enabled
      'ts/naming-convention': 'off',
      'ts/no-unsafe-return': 'off',
      'ts/no-unsafe-argument': 'off',
      'ts/no-unsafe-assignment': 'off',

      'ts/no-require-imports': ['error', {
        allow: [
          'process/',
          'is-stream',
          'readable-stream-node-to-web',
        ]
      }],
      'ts/no-var-requires': ['error', {
        allow: [
          'process/',
          'is-stream',
          'readable-stream-node-to-web',
        ]
      }],
    },
  },
]);
