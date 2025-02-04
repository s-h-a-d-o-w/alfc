export default {
  "**/*.{js,jsx,ts,tsx}": "eslint --cache",
  "**/*.{ts,tsx}": () => "pnpm type-check",
};
