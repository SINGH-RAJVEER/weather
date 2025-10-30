import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    languageOptions: { globals: { ...globals.node, bun: true } },
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    ignores: ["**/*.js"],
  }
];