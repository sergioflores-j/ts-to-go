module.exports = {
  env: {
    es2020: true,
    jest: true,
    node: true,
  },
  settings: {
    'import/resolver': {
      node: true,
      typescript: true,
    },
  },
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',

    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',

    'plugin:promise/recommended',
    'plugin:jest/recommended',

    'prettier',
    'plugin:prettier/recommended',
  ],
  plugins: ['@typescript-eslint', 'jest', 'promise', 'prettier'],
  ignorePatterns: [
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
    '**/node_modules/**',
    '**/*.js',
    '**/.turbo/**',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
    project: true,
  },
  rules: {
    // TYPESCRIPT
    '@typescript-eslint/no-floating-promises': ['error'],
    "@typescript-eslint/ban-ts-comment": ["error", {'ts-ignore': 'allow-with-description', 'ts-expect-error': 'allow-with-description'}],

    // CODE STYLE
    camelcase: 'off',
    'prettier/prettier': [
      'error',
      {
        trailingComma: 'all',
        singleQuote: true,
      },
    ],
    'max-len': [
      'error',
      { code: 120, ignoreStrings: true, ignoreTemplateLiterals: true },
    ],
    'import/order': ['error', { 'newlines-between': 'always' }],
    'import/no-extraneous-dependencies': [
      'error',
      {
        // allow imports from devDependencies for test files
        devDependencies: ['**/*.test.ts'],
        packageDir: __dirname
      },
    ],
  },
};
