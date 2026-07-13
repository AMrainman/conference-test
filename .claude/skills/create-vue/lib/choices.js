export const BASE_PLUGINS = [
  { name: 'Pinia', value: 'pinia', checked: false },
  { name: 'Vue Router', value: 'vue-router', checked: false },
  { name: 'Storybook', value: 'storybook', checked: false },
  { name: 'MSW', value: 'msw', checked: false },
  { name: 'ESLint', value: 'eslint', checked: true },
  { name: 'Prettier', value: 'prettier', checked: true },
  { name: 'Vitest', value: 'vitest', checked: true },
]

export const UI_LIBRARIES = [
  { name: '无', value: null },
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
  { name: 'FontAwesome', value: 'fontawesome', checked: false },
  { name: 'Heroicons', value: 'heroicons', checked: false },
  { name: 'Lucide', value: 'lucide', checked: false },
]

export const DX_PLUGINS = [
  { name: 'unplugin-auto-import', value: 'auto-import', checked: false },
  { name: 'unplugin-vue-components', value: 'components-auto', checked: false },
]
