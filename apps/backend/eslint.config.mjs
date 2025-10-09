// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      // Set unused variables to warning instead of error
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-unused-vars': 'warn', // Turn off base rule as it conflicts with @typescript-eslint version
      // Set Prettier formatting issues to warning
      'prettier/prettier': 'warn',
      // Additional formatting-related rules set to warning
      'indent': 'off',
      'quotes': 'off',
      'semi': 'off',
      'comma-dangle': 'off'
    },
  },
);