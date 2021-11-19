const basicRulesets = ['eslint:recommended'];
const finalRulesets = [
  'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array
];

module.exports = {
  parserOptions: {
    ecmaVersion: 2019, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  extends: [...basicRulesets, ...finalRulesets],
  overrides: [
    {
      parser: '@typescript-eslint/parser',
      files: ['*.ts', '*.tsx'],
      extends: [
        ...basicRulesets,
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint',
        ...finalRulesets,
      ],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};
