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
    files: ["**/*.{js,mjs,cjs,ts}"],
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
  },
  {
    files: ["src/entities/**/*.ts"],
    rules: {
      "indent": "off",
    },
  },
];

