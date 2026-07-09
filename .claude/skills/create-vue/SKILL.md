---
description: "生成基于 Vue 3 + Pinia + TypeScript + Vite + Tailwind CSS + headlessui + Storybook + MSW 的项目骨架"
user-invocable: true
allowed-tools: Bash, Read, Write, Edit
---

# create-vue

在当前目录生成一个 Vue 3 项目骨架，包含容器自适应、日间/夜间模式、ESLint/Prettier、MSW Mock、Storybook 以及基础共享组件。不生成业务代码，仅保留 Home / About 两个示例页面用于验证路由。

## 用法

```bash
/create-vue
```

执行后会在**当前目录**生成文件。如果当前目录已存在文件，必须先向用户确认是否继续。

## 执行步骤

1. **确认目录状态**：检查当前目录是否为空。若非空，询问用户是否继续。
2. **生成文件**：使用 Write 工具写入本 SKILL.md 中列出的所有文件。
3. **安装依赖**：运行 `npm install`。
4. **初始化 MSW worker**：运行 `npx msw init public`。
5. **验证骨架**：依次运行 `npm run type-check`、`npm run lint`、`npm run test`、`npm run build`。
6. **报告结果**：告知用户验证结果，并说明如何启动开发服务器。

## 禁止行为

- 不要生成 Home / About 之外的任何业务页面或业务组件。
- 不要生成业务相关的 MSW handlers（只保留 `/api/health` 示例）。
- 不要在组件内部使用 `md:`、`lg:` 等视口断点。

---

## 文件模板

### package.json

```json
{
  "name": "vue-project",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",
    "type-check": "vue-tsc --noEmit",
    "test": "vitest run --passWithNoTests",
    "test:watch": "vitest",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write \"src/**/*.{ts,vue,css,json}\"",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },
  "dependencies": {
    "@headlessui/vue": "^1.7.22",
    "@heroicons/vue": "^2.1.5",
    "@tailwindcss/container-queries": "^0.1.1",
    "msw": "^2.3.5",
    "pinia": "^2.1.7",
    "vue": "^3.5.0",
    "vue-router": "^4.4.0"
  },
  "msw": {
    "workerDirectory": ["public"]
  },
  "devDependencies": {
    "@chromatic-com/storybook": "^1.6.1",
    "@storybook/addon-essentials": "^8.2.0",
    "@storybook/addon-interactions": "^8.2.0",
    "@storybook/blocks": "^8.2.0",
    "@storybook/test": "^8.2.0",
    "@storybook/vue3": "^8.2.0",
    "@storybook/vue3-vite": "^8.2.0",
    "@vitejs/plugin-vue": "^5.2.0",
    "@vue/eslint-config-prettier": "^10.2.0",
    "@vue/eslint-config-typescript": "^14.9.0",
    "@vue/test-utils": "^2.4.6",
    "autoprefixer": "^10.4.19",
    "eslint": "^10.6.0",
    "eslint-plugin-oxlint": "^1.73.0",
    "eslint-plugin-prettier": "^5.5.6",
    "eslint-plugin-vue": "^10.9.2",
    "jsdom": "^24.1.0",
    "postcss": "^8.4.39",
    "prettier": "^3.9.4",
    "storybook": "^8.2.0",
    "tailwindcss": "^3.4.6",
    "typescript": "^5.5.0",
    "vite": "^6.0.0",
    "vitest": "^2.0.0",
    "vue-tsc": "^2.0.0"
  }
}
```

### vite.config.ts

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["vite/client"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### tsconfig.node.json

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts", "vitest.config.ts", "eslint.config.js"]
}
```

### vitest.config.ts

```ts
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
})
```

### tailwind.config.ts

```ts
import type { Config } from 'tailwindcss'
import containerQueries from '@tailwindcss/container-queries'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          300: '#93c5fd',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [containerQueries],
} satisfies Config
```

### postcss.config.js

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### index.html

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vue Project</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/app/main.ts"></script>
  </body>
</html>
```

### .gitignore

```
node_modules
dist
dist-ssr
*.local
coverage
storybook-static
*storybook.log
```

### .npmrc

```
registry=https://registry.npmmirror.com/
@ynw:registry=https://maven.haidaifu.net/repository/npm-hosted/
```

### .gitattributes

```
# ==============================
# 基础设置
# ==============================

* text=auto eol=lf

# ==============================
# 文本文件（强制 LF）
# ==============================

*.js     text eol=lf
*.jsx    text eol=lf
*.ts     text eol=lf
*.tsx    text eol=lf
*.vue    text eol=lf

*.css    text eol=lf
*.scss   text eol=lf
*.sass   text eol=lf
*.less   text eol=lf

*.json   text eol=lf
*.yml    text eol=lf
*.yaml   text eol=lf
*.html   text eol=lf
*.xml    text eol=lf
*.md     text eol=lf
*.txt    text eol=lf
*.ini    text eol=lf
*.env    text eol=lf
*.gitignore     text eol=lf
*.gitattributes text eol=lf
*.editorconfig  text eol=lf
*.prettierrc    text eol=lf
*.npmrc         text eol=lf

*.sh   text eol=lf
*.bash text eol=lf
*.zsh  text eol=lf
*.bat  text eol=lf
*.cmd  text eol=lf

# ==============================
# 二进制文件（禁止 Git 改行）
# ==============================
*.png   binary
*.jpg   binary
*.jpeg  binary
*.gif   binary
*.ico   binary
*.svg   binary
*.webp  binary
*.avif  binary

*.zip   binary
*.gz    binary
*.tar   binary
*.7z    binary
*.pdf   binary

*.ttf   binary
*.otf   binary
*.woff  binary
*.woff2 binary
```

### .prettierrc

```json
{
  "printWidth": 120,
  "tabWidth": 2,
  "useTabs": false,
  "semi": false,
  "singleQuote": true,
  "jsxSingleQuote": false,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "vueIndentScriptAndStyle": false,
  "endOfLine": "lf",
  "singleAttributePerLine": false,
  "proseWrap": "never",
  "htmlWhitespaceSensitivity": "ignore"
}
```

### eslint.config.js

```js
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
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-unused-vars': ['off', { vars: 'all', args: 'after-used', ignoreRestSiblings: false }],
      'no-var': 'error',
      'spaced-comment': 'error',
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
      'vue/no-v-html': 'off',
      'vue/attribute-hyphenation': 'off',
      'vue/require-default-prop': 'off',
    },
  },
)
```

### vitest.setup.ts

```ts
import { setupServer } from 'msw/node'
import { beforeAll, afterAll, afterEach } from 'vitest'
import { handlers } from './src/mocks/handlers'

const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### .storybook/main.ts

```ts
import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
}

export default config
```

### .storybook/preview.ts

```ts
import type { Preview } from '@storybook/vue3'
import { setupWorker } from 'msw/browser'
import { handlers } from '../src/mocks/handlers'
import '../src/shared/styles/tailwind.css'

const worker = setupWorker(...handlers)
await worker.start()

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
```

### src/mocks/browser.ts

```ts
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
```

### src/mocks/server.ts

```ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

### src/mocks/handlers.ts

```ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/health', () => {
    return HttpResponse.json({ status: 'ok' })
  }),
]
```

### src/shared/styles/tailwind.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### src/shared/types/index.ts

```ts
export type Theme = 'system' | 'light' | 'dark'

export interface User {
  id: string
  displayName: string
  avatarUrl?: string
}
```

### src/shared/stores/themeStore.ts

```ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Theme } from '@/shared/types'

const STORAGE_KEY = 'app-theme'

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light'
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: 'light' | 'dark') {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // 在 Safari 隐私模式、沙箱 iframe 或 localStorage 被禁用时静默降级
  }
}

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>('system')
  const systemTheme = ref<'light' | 'dark'>(getSystemTheme())

  let mediaQueryList: MediaQueryList | undefined
  let mediaQueryListener: ((event: MediaQueryListEvent) => void) | undefined

  const resolvedTheme = computed(() => {
    return theme.value === 'system' ? systemTheme.value : theme.value
  })

  function cleanup() {
    if (mediaQueryList && mediaQueryListener) {
      mediaQueryList.removeEventListener('change', mediaQueryListener)
    }
    mediaQueryList = undefined
    mediaQueryListener = undefined
  }

  function setTheme(value: Theme) {
    theme.value = value
    if (value === 'system') {
      systemTheme.value = getSystemTheme()
    }
    safeSetItem(STORAGE_KEY, value)
    applyTheme(resolvedTheme.value)
  }

  function initTheme() {
    const saved = safeGetItem(STORAGE_KEY)
    theme.value = saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system'
    systemTheme.value = getSystemTheme()
    applyTheme(resolvedTheme.value)
    cleanup()

    mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQueryListener = e => {
      systemTheme.value = e.matches ? 'dark' : 'light'
      if (theme.value === 'system') {
        applyTheme(resolvedTheme.value)
      }
    }
    mediaQueryList.addEventListener('change', mediaQueryListener)
  }

  return { theme, resolvedTheme, setTheme, initTheme, cleanup }
})
```

### src/shared/composables/useTheme.ts

```ts
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/shared/stores/themeStore'

export function useTheme() {
  const store = useThemeStore()
  const { theme, resolvedTheme } = storeToRefs(store)

  return {
    theme,
    resolvedTheme,
    setTheme: store.setTheme,
    initTheme: store.initTheme,
    cleanup: store.cleanup,
  }
}
```

### src/app/main.ts

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import { useThemeStore } from '@/shared/stores/themeStore'
import '@/shared/styles/tailwind.css'

async function enableMocking() {
  if (!import.meta.env.DEV) {
    return
  }

  const { worker } = await import('@/mocks/browser')
  await worker.start()
}

async function bootstrap() {
  await enableMocking()

  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)

  const themeStore = useThemeStore()
  themeStore.initTheme()

  app.mount('#app')
}

bootstrap().catch(err => {
  const message = err instanceof Error ? err.message : String(err)
  const appEl = document.getElementById('app')
  if (appEl) {
    appEl.innerHTML = `
      <div style="padding:2rem;text-align:center;font-family:sans-serif">
        <h1 style="color:#dc2626;font-size:1.25rem;margin-bottom:0.5rem">应用启动失败</h1>
        <p style="color:#4b5563;margin-bottom:1rem">请刷新页面重试，如果问题持续存在请检查控制台日志</p>
        <pre style="text-align:left;background:#f3f4f6;padding:1rem;border-radius:0.5rem;overflow:auto;font-size:0.875rem">${message.replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c]!)}</pre>
      </div>
    `
  }
})
```

### src/app/App.vue

```vue
<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'
import { RouterView } from 'vue-router'
import AppShell from '@/shared/components/AppShell.vue'

const capturedError = ref<Error | null>(null)

onErrorCaptured(err => {
  capturedError.value = err instanceof Error ? err : new Error(String(err))
  return false
})

function reload() {
  window.location.reload()
}
</script>

<template>
  <AppShell>
    <div v-if="capturedError" class="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <div class="rounded-lg bg-red-100 px-6 py-4 text-red-700 dark:bg-red-900 dark:text-red-100">
        <p class="font-semibold">应用发生错误</p>
        <p class="mt-1 text-sm">{{ capturedError.message }}</p>
      </div>
      <button
        type="button"
        class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        @click="reload"
      >
        重新加载
      </button>
    </div>
    <RouterView v-else />
  </AppShell>
</template>
```

### src/app/router.ts

```ts
import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/features/home/views/HomeView.vue'),
    },
    {
      path: '/about',
      component: () => import('@/features/about/views/AboutView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/features/home/views/HomeView.vue'),
    },
  ],
})
```

### src/shared/components/AppShell.vue

```vue
<template>
  <div class="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <slot />
  </div>
</template>
```

### src/shared/components/Button.vue

```vue
<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
})

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    class="inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-slate-900"
    :class="[
      variant === 'primary'
        ? 'bg-primary-600 text-white hover:bg-primary-700'
        : 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700',
      size === 'sm' && 'px-3 py-1.5 text-sm',
      size === 'md' && 'px-4 py-2 text-sm',
      size === 'lg' && 'px-6 py-3 text-base',
    ]"
    @click="emit('click')"
  >
    <slot />
  </button>
</template>
```

### src/shared/components/Input.vue

```vue
<script setup lang="ts">
import { computed, useId } from 'vue'

interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'
  error?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const fallbackId = useId()
const inputId = computed(() => props.id ?? fallbackId)
const errorId = computed(() => `${inputId.value}-error`)
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" :for="inputId" class="text-sm font-medium text-slate-700 dark:text-slate-300">
      {{ label }}
    </label>
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :aria-invalid="!!error"
      :aria-describedby="error ? errorId : undefined"
      class="rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 dark:bg-slate-800 dark:text-slate-100"
      :class="[
        error
          ? 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500'
          : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500 dark:border-slate-700',
      ]"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="error" :id="errorId" class="text-xs text-red-600">{{ error }}</span>
  </div>
</template>
```

### src/shared/components/Modal.vue

```vue
<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

interface Props {
  open: boolean
  title?: string
}

withDefaults(defineProps<Props>(), {
  title: '',
})

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <TransitionRoot appear :show="open" as="template">
    <Dialog as="div" class="relative z-50" @close="emit('close')">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/50" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-slate-800">
              <DialogTitle v-if="title" class="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {{ title }}
              </DialogTitle>
              <div class="mt-2">
                <slot />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
```

### src/shared/components/ThemeToggle.vue

```vue
<script setup lang="ts">
import { MoonIcon, SunIcon } from '@heroicons/vue/24/outline'
import { useTheme } from '@/shared/composables/useTheme'

const { resolvedTheme, setTheme } = useTheme()

function toggle() {
  setTheme(resolvedTheme.value === 'dark' ? 'light' : 'dark')
}
</script>

<template>
  <button
    type="button"
    class="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
    @click="toggle"
  >
    <SunIcon v-if="resolvedTheme === 'dark'" class="h-5 w-5" />
    <MoonIcon v-else class="h-5 w-5" />
  </button>
</template>
```

### src/features/home/views/HomeView.vue

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'
import ThemeToggle from '@/shared/components/ThemeToggle.vue'
import Button from '@/shared/components/Button.vue'

const router = useRouter()

function goToAbout() {
  router.push('/about')
}
</script>

<template>
  <div class="mx-auto flex max-w-5xl flex-col px-4 py-6">
    <header class="mb-8 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">首页</h1>
      <ThemeToggle />
    </header>

    <main class="flex flex-col gap-8">
      <p class="text-slate-700 dark:text-slate-300">欢迎来到 Vue 项目骨架。</p>
      <Button @click="goToAbout">关于</Button>
    </main>
  </div>
</template>
```

### src/features/about/views/AboutView.vue

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from '@/shared/components/Button.vue'

const router = useRouter()

function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="mx-auto flex max-w-5xl flex-col px-4 py-6">
    <header class="mb-8 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">关于</h1>
    </header>

    <main class="flex flex-col gap-8">
      <p class="text-slate-700 dark:text-slate-300">这是基于 Vue 3 + TypeScript + Vite 的项目骨架。</p>
      <Button variant="secondary" @click="goBack">返回首页</Button>
    </main>
  </div>
</template>
```

### README.md

```markdown
# Vue Project

基于 Vue 3 + Pinia + TypeScript + Vite + Tailwind CSS + headlessui + Storybook + MSW 的项目骨架。

## 快速开始

```bash
npm install
npm run dev
```

访问 [http://localhost:5173](http://localhost:5173)

## 脚本说明

- `npm run dev`：启动开发服务器
- `npm run build`：类型检查 + 生产构建
- `npm run type-check`：TypeScript 类型检查
- `npm run test`：运行 Vitest 测试
- `npm run lint`：运行 ESLint
- `npm run lint:fix`：自动修复 ESLint 问题
- `npm run storybook`：启动 Storybook
- `npm run build-storybook`：构建 Storybook 静态站点

## 容器自适应方案注意事项

1. 组件内部禁止使用 `md:`、`lg:` 等视口断点，必须在外层容器声明 `@container`。
2. 页面级骨架布局可酌情使用媒体查询。
3. 开发复杂响应式组件时，优先在 Storybook 中通过调整容器宽度验证效果。
4. `tailwind.config.ts` 已配置 `@tailwindcss/container-queries` 插件。

## 日间/夜间模式注意事项

1. Tailwind 使用 `darkMode: 'class'`，主题类挂载在 `document.documentElement`。
2. 默认行为是跟随系统偏好，用户手动切换后优先读取 `localStorage` 记忆值。
3. 切换主题时不要直接操作 DOM，统一通过 `themeStore.setTheme()` 或 `useTheme()`。
```

### CLAUDE.md

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

基于 Vue 3 + Pinia + TypeScript + Vite + Tailwind CSS + headlessui + Storybook + MSW 的项目骨架。

## 常用命令

```bash
npm run dev
npm run type-check
npm run build
npm run test
npx vitest run src/shared/components/__tests__/Button.spec.ts
npm run lint
npm run lint:fix
npm run storybook
npm run build-storybook
```

## 目录结构

- `src/app/` — 应用入口与全局路由
- `src/features/` — 按业务功能组织，每个功能包含 `components/` 和 `views/`
- `src/shared/` — 跨功能复用的组件、组合式函数、store、类型、样式
- `src/mocks/` — MSW mock

## 关键约定

### 容器自适应

- 组件内部严禁使用 `md:`、`lg:` 等视口断点。
- 响应式组件必须由外层容器声明 `@container`，内部元素使用 `@md:`、`@sm:` 等容器断点。
- 页面级骨架布局可酌情使用媒体查询。

### 日间/夜间模式

- Tailwind 配置 `darkMode: 'class'`，主题类挂载在 `document.documentElement`。
- 默认跟随系统偏好；手动切换后读取 `localStorage`。
- 统一通过 `themeStore.setTheme()` 或 `useTheme()` 切换主题。

### MSW Mock

- 开发环境自动注册 MSW worker。
- REST handlers 放在 `src/mocks/handlers.ts`。
- Storybook 在 `.storybook/preview.ts` 中全局加载 MSW。
- 测试环境在 `vitest.setup.ts` 中启用 `msw/server`。
- `public/mockServiceWorker.js` 必须存在。

### 代码规范

- 生产代码中禁止使用 `console.log`。
- 优先使用命名导出。
- 异步操作必须有错误处理。
```

### .claude/rules/container-design.md

```markdown
---
description: 强制执行容器驱动的组件设计模式，禁止组件内部滥用视口断点。
globs: ["src/components/**/*.{vue,tsx,jsx,css,scss}", "src/layouts/**/*.{vue,tsx,jsx,css,scss}"]
---

# 容器优先开发规范

## 核心原则

本项目采用“容器查询 (Container Queries)”作为组件自适应的核心机制，视口查询 (Media Queries) 仅保留用于页面骨架布局。

## 规则指南

### 1. 组件与容器的解耦

- 在组件内部，严禁使用 `md:`、`lg:`、`xl:` 等视口断点修饰符。
- 任何需要响应式的 UI 组件，必须首先拥有容器上下文。
  - 父容器定义：添加 `@container` 工具类。
  - 组件逻辑：使用 `@<breakpoint>:` 修饰符。

### 2. 原子类组合范式

错误示例：

```html
<div class="grid grid-cols-1 md:grid-cols-3">...</div>
```

正确示例：

```html
<div class="@container">
  <div class="grid grid-cols-1 @md:grid-cols-3">...</div>
</div>
```

### 3. 断点命名约定

使用 Tailwind @container 插件默认的容器断点：@xs、@sm、@md、@lg、@xl、@2xl ... @7xl。

### 4. AI 编码辅助要求

- 生成新组件时，默认假设其需要自适应，主动为父容器添加 `@container` 类。
- 拒绝使用 `!important` 覆盖响应式样式。
- 组件在不同布局位置有显著形态变化时，优先选择容器查询而非额外 props。
```
