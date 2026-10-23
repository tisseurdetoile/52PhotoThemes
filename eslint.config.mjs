import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import globals from 'globals'

export default [
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**', '*.min.js']
  },

  js.configs.recommended,

  ...pluginVue.configs['flat/recommended'],

  // Désactive les règles de formatage d'ESLint/eslint-plugin-vue qui entrent en conflit
  // avec Prettier : la mise en forme est le travail de Prettier (npm run format).
  // À garder après les configs ci-dessus.
  skipFormatting,

  {
    files: ['**/*.{js,mjs,cjs,vue}'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },

    rules: {
      // JavaScript
      // console.error / console.warn restent autorisés : ce sont des signalements d'erreur voulus
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],

      // Vue
      'vue/multi-word-component-names': 'off'
    }
  },

  {
    // Les scripts en ligne de commande affichent volontairement des messages
    files: ['scripts/**/*.{js,mjs}'],
    rules: {
      'no-console': 'off'
    }
  }
]
