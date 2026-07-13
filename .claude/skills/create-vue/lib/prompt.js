import { checkbox, select, confirm } from '@inquirer/prompts'

const BASE_PLUGINS = [
  { name: 'Pinia', value: 'pinia', checked: false },
  { name: 'Vue Router', value: 'vue-router', checked: false },
  { name: 'Storybook', value: 'storybook', checked: false },
  { name: 'MSW', value: 'msw', checked: false },
  { name: 'ESLint', value: 'eslint', checked: true },
  { name: 'Prettier', value: 'prettier', checked: true },
  { name: 'Vitest', value: 'vitest', checked: true },
]

const UI_LIBRARIES = [
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

const ICON_LIBRARIES = [
  { name: 'FontAwesome', value: 'fontawesome', checked: false },
  { name: 'Heroicons', value: 'heroicons', checked: false },
  { name: 'Lucide', value: 'lucide', checked: false },
]

const DX_PLUGINS = [
  { name: 'unplugin-auto-import', value: 'auto-import', checked: false },
  { name: 'unplugin-vue-components', value: 'components-auto', checked: false },
]

export async function promptForOptions() {
  const basePlugins = await checkbox({
    message: '选择基础插件（空格切换，a 全选/全不选）',
    choices: BASE_PLUGINS,
    pageSize: 10,
  })

  const uiLibrary = await select({
    message: '选择 UI 库（单选）',
    choices: UI_LIBRARIES,
  })

  const iconLibraries = await checkbox({
    message: '选择图标库（空格切换，可多选）',
    choices: ICON_LIBRARIES,
    pageSize: 10,
  })

  const dxPlugins = await checkbox({
    message: '选择开发体验插件（空格切换）',
    choices: DX_PLUGINS,
    pageSize: 10,
  })

  return {
    basePlugins,
    uiLibrary,
    iconLibraries,
    dxPlugins,
  }
}

export async function confirmDirectoryOverwrite() {
  return confirm({
    message: '当前目录非空，是否继续生成？',
    default: false,
  })
}

export { BASE_PLUGINS, UI_LIBRARIES, ICON_LIBRARIES, DX_PLUGINS }
