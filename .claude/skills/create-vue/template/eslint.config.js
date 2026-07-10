import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import pluginPrettier from 'eslint-plugin-prettier'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
    languageOptions: {
      globals: {
        node: true,
        browser: true,
        es2021: true,
      },
    },
  },

  globalIgnores([
    '**/dist/**',
    '**/dist-ssr/**',
    '**/coverage/**',
    '**/node_modules/**',
    '**/storybook-static/**',
    '**/public/**',
    '**/.git/**',
    '**/.claude/**',
    '**/.superpowers/**',
    '**/vite.config.ts',
    '**/eslint.config.js',
  ]),

  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  ...pluginOxlint.configs['flat/recommended'],
  skipFormatting,

  {
    name: 'app/custom-rules',
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-unused-vars': ['off', { vars: 'all', args: 'after-used', ignoreRestSiblings: false }],
      'no-var': 'error',
      'spaced-comment': ['error', 'always', { line: { markers: ['/'] } }],
      camelcase: ['error', { properties: 'always' }],
      'arrow-body-style': ['off', 'as-needed'],
      'comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'always-multiline',
          functions: 'never',
        },
      ],
      'prefer-const': [
        'error',
        {
          destructuring: 'all',
          ignoreReadBeforeAssign: true,
        },
      ],
      'key-spacing': ['error', { beforeColon: false, afterColon: true }],
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/order-in-components': 'error',
      'vue/attributes-order': 'error',
      'vue/multi-word-component-names': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/attribute-hyphenation': 'off',
      'vue/require-default-prop': 'off',
    },
  },
)
