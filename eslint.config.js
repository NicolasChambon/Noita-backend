import js from '@eslint/js';
import pluginPrettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    ignores: ['node_modules/**'],
    languageOptions: {
      ecmaVersion: 'latest', // Support des dernières fonctionnalités ECMAScript
      sourceType: 'module', // Utilisation des modules (import/export)
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'warn',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Ignore les variables non utilisées commençant par "_"
    },
  },
  {
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      'prettier/prettier': 'error', // Lever une erreur en cas de non-respect des règles Prettier
    },
  },
  {
    // Prettier rules to avoid conflicts
    rules: prettierConfig.rules,
  },
];
