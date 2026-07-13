export const BASE_PLUGINS = [
  { name: 'Pinia', value: 'pinia' },
  { name: 'Vue Router', value: 'vue-router' },
  { name: 'Storybook', value: 'storybook' },
  { name: 'MSW', value: 'msw' },
  { name: 'ESLint', value: 'eslint' },
  { name: 'Prettier', value: 'prettier' },
  { name: 'Vitest', value: 'vitest' },
]

export const UI_LIBRARIES = [
  { name: 'Ant Design Vue', value: 'ant-design-vue' },
  { name: 'Element Plus', value: 'element-plus' },
  { name: 'Vant', value: 'vant' },
  { name: 'Headless UI', value: 'headlessui' },
  { name: 'Quasar', value: 'quasar' },
  { name: 'Vuetify', value: 'vuetify' },
  { name: 'PrimeVue', value: 'primevue' },
  { name: 'Naive UI', value: 'naive-ui' },
]

export const ICON_LIBRARIES = [
  { name: 'FontAwesome', value: 'fontawesome' },
  { name: 'Heroicons', value: 'heroicons' },
  { name: 'Lucide', value: 'lucide' },
]

export const DX_PLUGINS = [
  { name: 'unplugin-auto-import', value: 'auto-import' },
  { name: 'unplugin-vue-components', value: 'components-auto' },
]

// 用于 AskUserQuestion 分组（每组不超过 4 个选项）
export const BASE_PLUGIN_GROUPS = [
  BASE_PLUGINS.slice(0, 4),
  BASE_PLUGINS.slice(4),
]

export const UI_LIBRARY_GROUPS = [
  UI_LIBRARIES.slice(0, 4),
  UI_LIBRARIES.slice(4),
]
