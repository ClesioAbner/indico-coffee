import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["assets/js/vendor/**", "dist/**", "node_modules/**"] },
  js.configs.recommended,
  {
    files: ["assets/js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "script",
      globals: { ...globals.browser },
    },
    rules: {
      "no-unused-vars": ["error", { args: "after-used" }],
      eqeqeq: ["error", "smart"],
      "no-var": "off",
    },
  },
  {
    files: ["scripts/**/*.mjs", "eslint.config.mjs"],
    languageOptions: { ecmaVersion: 2022, sourceType: "module", globals: { ...globals.node } },
  },
];
