module.exports = {
  extends: [
    "react-app",
    "plugin:react-hooks/recommended",
    'prettier/@typescript-eslint', // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array
  ], rules: {
    "jsx-a11y/accessible-emoji": "off",
    "react-hooks/exhaustive-deps": "error",
    "import/first": "off"
  }
}