import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const pluginJsRecommended = {
  rules: {
    ...pluginJs.configs.recommended.rules,
  },
};

const tseslintRecommended = {
  rules: {
    ...tseslint.configs.recommended.rules,
  },
};

export default [
  {
    files: ["src/**/*.{js,ts}"],
    languageOptions: {
      globals: globals.node,
      parser: tsParser,
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      "semi": ["error", "always"],
      "indent": ["error", 2],
      ...pluginJsRecommended.rules,
      ...tseslintRecommended.rules,
    },
    ignores: ["**/eslint.config.mjs"],
  },
  {
    files: ["src/entities/**/*.ts"],
    rules: {
      "indent": "off",
    },
  },
];

