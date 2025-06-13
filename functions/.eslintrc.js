/** functions/.eslintrc.js */
module.exports = {
  root: true,                        // これで親 .eslintrc を無視
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    // プロジェクト固有ルールがあればここに
  },
};
