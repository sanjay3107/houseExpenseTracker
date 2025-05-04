import js from '@eslint/js';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import reactJsxRuntime from 'eslint-plugin-react/configs/jsx-runtime.js';
import reactHooks from 'eslint-plugin-react-hooks/recommended.js';
import jsxA11y from 'eslint-plugin-jsx-a11y/recommended.js';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  reactRecommended,
  reactJsxRuntime,
  reactHooks,
  jsxA11y,
  prettier,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      'react/prop-types': 'warn',
      'no-unused-vars': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }]
    }
  }
];
