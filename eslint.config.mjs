import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import { includeIgnoreFile } from "@eslint/compat";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, ".gitignore");
const gitignorePathFrontend = path.resolve(__dirname, "frontend", ".gitignore");
const gitignorePathServer = path.resolve(__dirname, "server", ".gitignore");

export default tseslint.config(
  {
    ignores: ["mockData.ts"],
  },
  includeIgnoreFile(gitignorePath),
  includeIgnoreFile(gitignorePathFrontend),
  includeIgnoreFile(gitignorePathServer),
  {
    plugins: {
      reactPlugin,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            "*.mjs",
            "*.js",
            "bootstrap/index.js",
            "frontend/config-overrides.js",
          ],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  eslint.configs.recommended,
  tseslint.configs.recommended,

  {
    plugins: {
      "react-hooks": hooksPlugin,
      "react-refresh": reactRefresh,
    },
    rules: hooksPlugin.configs.recommended.rules,
  },

  // React team can't write proper types
  reactPlugin.configs.flat["recommended"],
  reactPlugin.configs.flat["jsx-runtime"],

  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],

      "no-unreachable": "off",
      "require-await": "error",
    },
  },

  // Always last
  eslintPluginPrettierRecommended,
);
