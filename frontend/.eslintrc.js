const baseConfig = require('../.eslintrc.js');

module.exports = {
  ...baseConfig,
  extends: [
    'react-app',
    'plugin:react-hooks/recommended',
    ...baseConfig.extends,
  ],
  rules: {
    ...baseConfig.rules,
    'jsx-a11y/accessible-emoji': 'off',
    'react-hooks/exhaustive-deps': 'error',
    'import/first': 'off',
  },
};
