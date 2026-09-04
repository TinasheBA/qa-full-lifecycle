import tseslint from "typescript-eslint";

/**
 * The rule that earns this config is `no-floating-promises`. A forgotten `await`
 * on a click or an `expect` is the most common Playwright bug: the promise floats,
 * the test races the app, and it often passes for the wrong reason. That is a type
 * error no `tsc --noEmit` run reports, so lint is the only mechanical guard.
 */
export default tseslint.config(
  { ignores: ["node_modules/", "playwright-report/", "test-results/", "eslint.config.mjs"] },
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
  }
);
