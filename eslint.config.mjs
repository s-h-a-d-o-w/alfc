import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
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
        projectService: true,
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

  {
    plugins: {
      "react-hooks": hooksPlugin,
    },
    rules: hooksPlugin.configs.recommended.rules,
  },

  // React team can't write proper types
  reactPlugin.configs.flat["recommended"],
  reactPlugin.configs.flat["jsx-runtime"],

  {
    rules: {
      "no-unreachable": "off",
      "require-await": "error",
    },
  },

  // Always last
  eslintPluginPrettierRecommended,
);
