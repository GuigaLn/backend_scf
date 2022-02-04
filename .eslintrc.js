module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    'class-methods-use-this': 'off',
    'linebreak-style': 0,
    'import/prefer-default-export': 'off',
    'import/extensions': 'off',
    'no-unused-vars': 'off',
    'max-len': 'off',
    'import/no-unresolved': 'off',
    'no-param-reassign': 'off',
    'no-loop-func': 'off',
    'block-scoped-var': 'off',
    'no-use-before-define': 'off',
    'vars-on-top': 'off',
    'no-var': 'off',
    'no-else-return': 'off',
    'no-shadow': 'off',
    'lines-between-class-members': [
      'error',
      'always',
      { exceptAfterSingleLine: true },
    ],
  },
};
