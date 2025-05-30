// eslint.config.js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
  },
  react.configs.recommended,
  reactHooks.configs.recommended,
  {
    ignores: ['dist', 'node_modules'],
    rules: {
      // Puedes agregar reglas personalizadas aquí
    },
  },
] 