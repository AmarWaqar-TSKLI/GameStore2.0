// eslint.config.js
import { defineFlatConfig } from '@eslint/eslintrc'
import nextPlugin from '@next/eslint-plugin-next'

export default defineFlatConfig([
  {
    plugins: {
      '@next/next': nextPlugin
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      // Add your custom rules here
    }
  },
  {
    ignores: [
      'node_modules/',
      '.next/',
      'out/',
      'public/'
    ]
  }
])