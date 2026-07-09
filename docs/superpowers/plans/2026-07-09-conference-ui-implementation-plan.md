# 会议系统前端 UI 骨架实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 基于 Vue 3 + TypeScript + Vite + Tailwind CSS + Storybook + MSW 搭建会议系统纯前端 UI 骨架，支持容器自适应响应式和日间/夜间模式切换。

**Architecture:** 采用 Feature-based 目录结构，按业务域（home/join/pre-meeting/waiting-room/meeting-room/meeting-ended）组织页面与组件；共享组件与状态放在 `src/shared/`；MSW 统一拦截 REST/WebSocket，为开发、Storybook、测试提供 mock 数据；Tailwind 容器查询负责组件级响应式，页面级骨架保留少量媒体查询。

**Tech Stack:** Vue 3.5, TypeScript 5, Vite 6, Vue Router 4, Pinia, Tailwind CSS 3.4 + `@tailwindcss/container-queries`, Headless UI (Vue), MSW 2.x, Storybook 8, Vitest, `@vue/test-utils`.

---

## 文件结构映射

```
conference-test/
├── .storybook/
│   ├── main.ts
│   ├── preview.ts
│   └── preview-body.html
├── docs/superpowers/specs/2026-07-09-conference-ui-design.md
├── public/
├── src/
│   ├── app/
│   │   ├── App.vue
│   │   ├── main.ts
│   │   └── router.ts
│   ├── features/
│   │   ├── home/
│   │   │   ├── views/HomeView.vue
│   │   │   ├── components/MeetingList.vue
│   │   │   ├── components/MeetingListItem.vue
│   │   │   ├── components/QuickStartCard.vue
│   │   │   └── index.ts
│   │   ├── join/
│   │   │   ├── views/JoinView.vue
│   │   │   ├── components/JoinMeetingForm.vue
│   │   │   ├── components/NewMeetingForm.vue
│   │   │   └── index.ts
│   │   ├── pre-meeting/
│   │   │   ├── views/PreMeetingView.vue
│   │   │   ├── components/DevicePreview.vue
│   │   │   ├── components/DeviceSelector.vue
│   │   │   └── index.ts
│   │   ├── waiting-room/
│   │   │   ├── views/WaitingRoomView.vue
│   │   │   ├── components/WaitingRoomCard.vue
│   │   │   └── index.ts
│   │   ├── meeting-room/
│   │   │   ├── views/MeetingRoomView.vue
│   │   │   ├── components/VideoGrid.vue
│   │   │   ├── components/MeetingToolbar.vue
│   │   │   ├── components/ParticipantPanel.vue
│   │   │   ├── components/ChatPanel.vue
│   │   │   └── index.ts
│   │   └── meeting-ended/
│   │       ├── views/MeetingEndedView.vue
│   │       ├── components/MeetingSummary.vue
│   │       └── index.ts
│   ├── mocks/
│   │   ├── browser.ts
│   │   ├── server.ts
│   │   ├── handlers.ts
│   │   ├── socket.ts
│   │   └── data/
│   │       ├── meetings.ts
│   │       └── participants.ts
│   ├── shared/
│   │   ├── components/
│   │   │   ├── AppShell.vue
│   │   │   ├── ThemeToggle.vue
│   │   │   ├── Button.vue
│   │   │   ├── IconButton.vue
│   │   │   ├── Modal.vue
│   │   │   ├── Input.vue
│   │   │   ├── Avatar.vue
│   │   │   ├── VideoTile.vue
│   │   │   ├── Toolbar.vue
│   │   │   ├── Sidebar.vue
│   │   │   └── MeetingHeader.vue
│   │   ├── composables/
│   │   │   └── useTheme.ts
│   │   ├── stores/
│   │   │   ├── themeStore.ts
│   │   │   ├── meetingStore.ts
│   │   │   └── uiStore.ts
│   │   ├── styles/
│   │   │   └── tailwind.css
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── utils/
│   │       └── index.ts
│   └── vite-env.d.ts
├── .eslintrc.cjs
├── .prettierrc
├── container-design.md
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.node.json
└── vitest.config.ts
```

---

## Task 1: 初始化 Vite + Vue + TypeScript 项目

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `index.html`
- Create: `src/vite-env.d.ts`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "conference-test",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",
    "type-check": "vue-tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
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
  "devDependencies": {
    "@chromatic-com/storybook": "^1.6.1",
    "@storybook/addon-essentials": "^8.2.0",
    "@storybook/addon-interactions": "^8.2.0",
    "@storybook/blocks": "^8.2.0",
    "@storybook/test": "^8.2.0",
    "@storybook/vue3": "^8.2.0",
    "@storybook/vue3-vite": "^8.2.0",
    "@vitejs/plugin-vue": "^5.1.0",
    "@vue/test-utils": "^2.4.6",
    "autoprefixer": "^10.4.19",
    "jsdom": "^24.1.0",
    "postcss": "^8.4.39",
    "storybook": "^8.2.0",
    "tailwindcss": "^3.4.6",
    "typescript": "^5.5.0",
    "vite": "^5.3.0",
    "vitest": "^2.0.0",
    "vue-tsc": "^2.0.0"
  }
}
```

- [ ] **Step 2: 创建 tsconfig.json**

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
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: 创建 tsconfig.node.json**

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
  "include": ["vite.config.ts", "tailwind.config.ts"]
}
```

- [ ] **Step 4: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Conference</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/app/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 5: 创建 src/vite-env.d.ts**

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 6: 安装依赖并验证 Vite 启动**

Run:
```bash
npm install
```

Expected: `node_modules/` created with no errors.

- [ ] **Step 7: Commit**

```bash
git add package.json tsconfig.json tsconfig.node.json index.html src/vite-env.d.ts package-lock.json
git commit -m "chore: 初始化 Vite + Vue + TypeScript 工程配置"
```

---

## Task 2: 配置 Tailwind CSS、容器查询与日间/夜间模式

**Files:**
- Create: `tailwind.config.ts`
- Create: `src/shared/styles/tailwind.css`
- Create: `vite.config.ts`
- Create: `postcss.config.js`

- [ ] **Step 1: 创建 tailwind.config.ts**

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
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [containerQueries],
} satisfies Config
```

- [ ] **Step 2: 创建 postcss.config.js**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 3: 创建 src/shared/styles/tailwind.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    @apply antialiased;
  }
  body {
    @apply bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100;
  }
}
```

- [ ] **Step 4: 创建 vite.config.ts**

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

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts postcss.config.js src/shared/styles/tailwind.css vite.config.ts
git commit -m "chore: 配置 Tailwind CSS、容器查询与 Vite 路径别名"
```

---

## Task 3: 定义全局类型

**Files:**
- Create: `src/shared/types/index.ts`

- [ ] **Step 1: 创建类型文件**

```ts
export type Theme = 'system' | 'light' | 'dark'

export interface User {
  id: string
  displayName: string
  avatarUrl?: string
}

export interface Participant extends User {
  isHost: boolean
  isMuted: boolean
  isVideoOff: boolean
}

export interface Meeting {
  id: string
  title: string
  hostId: string
  startTime: string
  status: 'scheduled' | 'live' | 'ended'
}

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
}

export interface JoinMeetingPayload {
  meetingId: string
  displayName: string
}
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/types/index.ts
git commit -m "chore: 定义会议系统核心 TypeScript 类型"
```

---

## Task 4: 实现 themeStore 与 ThemeToggle

**Files:**
- Create: `src/shared/stores/themeStore.ts`
- Create: `src/shared/composables/useTheme.ts`
- Create: `src/shared/components/ThemeToggle.vue`
- Create: `src/shared/stores/__tests__/themeStore.spec.ts`

- [ ] **Step 1: 编写 themeStore 测试（先写失败测试）**

```ts
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useThemeStore } from '../themeStore'

describe('themeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('默认主题为 system', () => {
    const store = useThemeStore()
    expect(store.theme).toBe('system')
  })

  it('setTheme light 会添加 dark 类', () => {
    const store = useThemeStore()
    store.setTheme('dark')
    expect(store.theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('app-theme')).toBe('dark')
  })

  it('resolvedTheme 根据系统偏好解析 system', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    const store = useThemeStore()
    expect(store.resolvedTheme).toBe('dark')
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run:
```bash
npx vitest run src/shared/stores/__tests__/themeStore.spec.ts
```

Expected: FAIL with "useThemeStore is not defined" 或类似错误。

- [ ] **Step 3: 实现 themeStore**

```ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Theme } from '@/shared/types'

const STORAGE_KEY = 'app-theme'

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: 'light' | 'dark') {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>('system')

  const resolvedTheme = computed(() => {
    return theme.value === 'system' ? getSystemTheme() : theme.value
  })

  function setTheme(value: Theme) {
    theme.value = value
    localStorage.setItem(STORAGE_KEY, value)
    applyTheme(resolvedTheme.value)
  }

  function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    theme.value = saved ?? 'system'
    applyTheme(resolvedTheme.value)

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (theme.value === 'system') {
        applyTheme(e.matches ? 'dark' : 'light')
      }
    })
  }

  return { theme, resolvedTheme, setTheme, initTheme }
})
```

- [ ] **Step 4: 实现 useTheme composable**

```ts
import { useThemeStore } from '@/shared/stores/themeStore'

export function useTheme() {
  const store = useThemeStore()
  return {
    theme: store.theme,
    resolvedTheme: store.resolvedTheme,
    setTheme: store.setTheme,
    initTheme: store.initTheme,
  }
}
```

- [ ] **Step 5: 实现 ThemeToggle.vue**

```vue
<script setup lang="ts">
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/vue/24/outline'
import { useTheme } from '@/shared/composables/useTheme'
import type { Theme } from '@/shared/types'

const { theme, setTheme } = useTheme()

const options: { value: Theme; label: string; icon: typeof SunIcon }[] = [
  { value: 'light', label: '浅色', icon: SunIcon },
  { value: 'dark', label: '深色', icon: MoonIcon },
  { value: 'system', label: '跟随系统', icon: ComputerDesktopIcon },
]
</script>

<template>
  <div class="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
    <button
      v-for="opt in options"
      :key="opt.value"
      :aria-label="opt.label"
      :aria-pressed="theme === opt.value"
      class="flex items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors"
      :class="theme === opt.value ? 'bg-white text-primary-600 shadow dark:bg-slate-700' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'"
      @click="setTheme(opt.value)"
    >
      <component :is="opt.icon" class="h-4 w-4" />
      <span class="hidden @md:inline">{{ opt.label }}</span>
    </button>
  </div>
</template>
```

- [ ] **Step 6: 运行测试确认通过**

Run:
```bash
npx vitest run src/shared/stores/__tests__/themeStore.spec.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/shared/stores src/shared/composables src/shared/components/ThemeToggle.vue
git commit -m "feat(theme): 实现 themeStore、useTheme 与 ThemeToggle 组件"
```

---

## Task 5: 配置 MSW Mock 层

**Files:**
- Create: `src/mocks/data/meetings.ts`
- Create: `src/mocks/data/participants.ts`
- Create: `src/mocks/handlers.ts`
- Create: `src/mocks/socket.ts`
- Create: `src/mocks/browser.ts`
- Create: `src/mocks/server.ts`

- [ ] **Step 1: 创建 mock 数据**

`src/mocks/data/meetings.ts`:
```ts
import type { Meeting } from '@/shared/types'

export const mockMeetings: Meeting[] = [
  { id: '123-456-789', title: '产品周会', hostId: 'u1', startTime: new Date().toISOString(), status: 'scheduled' },
  { id: '987-654-321', title: '技术分享', hostId: 'u2', startTime: new Date().toISOString(), status: 'live' },
]
```

`src/mocks/data/participants.ts`:
```ts
import type { Participant } from '@/shared/types'

export const mockParticipants: Participant[] = [
  { id: 'u1', displayName: '张三', isHost: true, isMuted: false, isVideoOff: false },
  { id: 'u2', displayName: '李四', isHost: false, isMuted: true, isVideoOff: false },
  { id: 'u3', displayName: '王五', isHost: false, isMuted: false, isVideoOff: true },
]
```

- [ ] **Step 2: 实现 REST handlers**

```ts
import { http, HttpResponse } from 'msw'
import { mockMeetings } from './data/meetings'
import { mockParticipants } from './data/participants'

export const handlers = [
  http.get('/api/meetings', () => {
    return HttpResponse.json({ data: mockMeetings })
  }),

  http.get('/api/meetings/:id', ({ params }) => {
    const meeting = mockMeetings.find((m) => m.id === params.id)
    if (!meeting) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({ data: meeting })
  }),

  http.post('/api/meetings/:id/join', async ({ params, request }) => {
    const body = (await request.json()) as { displayName: string }
    return HttpResponse.json({
      data: {
        meetingId: params.id,
        participantId: 'local-user',
        displayName: body.displayName,
      },
    })
  }),

  http.post('/api/meetings/:id/messages', async ({ request }) => {
    const body = (await request.json()) as { content: string }
    return HttpResponse.json({
      data: {
        id: `msg-${Date.now()}`,
        senderId: 'local-user',
        senderName: '我',
        content: body.content,
        timestamp: new Date().toISOString(),
      },
    })
  }),
]
```

- [ ] **Step 3: 实现模拟 WebSocket**

```ts
import { mockParticipants } from './data/participants'

type SocketEventHandler = (data: unknown) => void

export class MockWebSocket {
  private listeners: Record<string, SocketEventHandler[]> = {}
  readyState = 1

  constructor(public url: string) {
    setTimeout(() => {
      this.emit('open', {})
    }, 100)
  }

  on(event: string, handler: SocketEventHandler) {
    if (!this.listeners[event]) this.listeners[event] = []
    this.listeners[event].push(handler)
  }

  emit(event: string, data: unknown) {
    this.listeners[event]?.forEach((h) => h(data))
  }

  send(message: string) {
    const parsed = JSON.parse(message)
    if (parsed.type === 'join') {
      setTimeout(() => {
        this.emit('message', {
          type: 'participant-joined',
          participant: mockParticipants[1],
        })
      }, 300)
    }
  }

  close() {
    this.readyState = 3
  }
}

export function createSocket(url: string) {
  return new MockWebSocket(url)
}
```

- [ ] **Step 4: 创建 browser/server 入口**

`src/mocks/browser.ts`:
```ts
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
```

`src/mocks/server.ts`:
```ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

- [ ] **Step 5: Commit**

```bash
git add src/mocks
git commit -m "feat(mock): 配置 MSW 统一 mock 层，覆盖 REST 与 WebSocket"
```

---

## Task 6: 实现基础共享组件（Button、IconButton、Input）

**Files:**
- Create: `src/shared/components/Button.vue`
- Create: `src/shared/components/IconButton.vue`
- Create: `src/shared/components/Input.vue`
- Create: `src/shared/components/__tests__/Button.spec.ts`

- [ ] **Step 1: 实现 Button.vue**

```vue
<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    :class="[
      variant === 'primary' && 'bg-primary-600 text-white hover:bg-primary-700',
      variant === 'secondary' && 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200',
      variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
      size === 'sm' && 'px-3 py-1.5 text-sm',
      size === 'md' && 'px-4 py-2 text-sm',
      size === 'lg' && 'px-6 py-3 text-base',
    ]"
    @click="emit('click', $event)"
  >
    <slot />
  </button>
</template>
```

- [ ] **Step 2: 实现 IconButton.vue**

```vue
<script setup lang="ts">
interface Props {
  label: string
  active?: boolean
  danger?: boolean
}

withDefaults(defineProps<Props>(), { active: false, danger: false })

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    type="button"
    :aria-label="label"
    class="flex flex-col items-center gap-1 rounded-lg p-2 transition-colors"
    :class="[
      active
        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
      danger && 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900',
    ]"
    @click="emit('click', $event)"
  >
    <slot />
    <span class="text-xs">{{ label }}</span>
  </button>
</template>
```

- [ ] **Step 3: 实现 Input.vue**

```vue
<script setup lang="ts">
interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  type?: string
  error?: string
}

withDefaults(defineProps<Props>(), { type: 'text' })

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ label }}</label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="error" class="text-xs text-red-600">{{ error }}</span>
  </div>
</template>
```

- [ ] **Step 4: 编写 Button 测试**

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Button from '../Button.vue'

describe('Button', () => {
  it('渲染默认 primary 按钮', () => {
    const wrapper = mount(Button, { slots: { default: 'Click me' } })
    expect(wrapper.text()).toBe('Click me')
    expect(wrapper.classes()).toContain('bg-primary-600')
  })

  it('点击触发 click 事件', async () => {
    const wrapper = mount(Button, { slots: { default: 'Click me' } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('disabled 时不可点击', () => {
    const wrapper = mount(Button, { props: { disabled: true } })
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })
})
```

- [ ] **Step 5: 运行测试确认通过**

Run:
```bash
npx vitest run src/shared/components/__tests__/Button.spec.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/shared/components/Button.vue src/shared/components/IconButton.vue src/shared/components/Input.vue src/shared/components/__tests__/Button.spec.ts
git commit -m "feat(shared): 实现 Button、IconButton、Input 基础组件及测试"
```

---

## Task 7: 实现弹窗与头像组件

**Files:**
- Create: `src/shared/components/Modal.vue`
- Create: `src/shared/components/Avatar.vue`
- Create: `src/shared/components/__tests__/Avatar.spec.ts`

- [ ] **Step 1: 实现 Modal.vue（基于 Headless UI Dialog）**

```vue
<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'

interface Props {
  open: boolean
  title?: string
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <Dialog :open="open" class="relative z-50" @close="emit('close')">
    <div class="fixed inset-0 bg-black/50" aria-hidden="true" />
    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800">
        <DialogTitle v-if="title" class="mb-4 text-lg font-semibold text-slate-900 dark:text-white">{{ title }}</DialogTitle>
        <div class="text-slate-700 dark:text-slate-200">
          <slot />
        </div>
        <div v-if="$slots.footer" class="mt-6 flex justify-end gap-2">
          <slot name="footer" />
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>
```

- [ ] **Step 2: 实现 Avatar.vue**

```vue
<script setup lang="ts">
interface Props {
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), { size: 'md' })

function initials(name: string) {
  return name.slice(0, 2).toUpperCase()
}
</script>

<template>
  <div
    class="flex items-center justify-center overflow-hidden rounded-full bg-primary-100 font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300"
    :class="[size === 'sm' && 'h-8 w-8 text-xs', size === 'md' && 'h-10 w-10 text-sm', size === 'lg' && 'h-14 w-14 text-lg']"
  >
    <img v-if="src" :src="src" :alt="name" class="h-full w-full object-cover" />
    <span v-else>{{ initials(name) }}</span>
  </div>
</template>
```

- [ ] **Step 3: 编写 Avatar 测试**

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Avatar from '../Avatar.vue'

describe('Avatar', () => {
  it('无头像时显示姓名首字母', () => {
    const wrapper = mount(Avatar, { props: { name: '张三' } })
    expect(wrapper.text()).toBe('张三')
  })

  it('有头像时渲染 img', () => {
    const wrapper = mount(Avatar, { props: { name: '张三', src: 'https://example.com/a.jpg' } })
    expect(wrapper.find('img').exists()).toBe(true)
    expect(wrapper.find('img').attributes('alt')).toBe('张三')
  })
})
```

- [ ] **Step 4: 运行测试确认通过**

Run:
```bash
npx vitest run src/shared/components/__tests__/Avatar.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shared/components/Modal.vue src/shared/components/Avatar.vue src/shared/components/__tests__/Avatar.spec.ts
git commit -m "feat(shared): 实现 Modal 与 Avatar 组件及测试"
```

---

## Task 8: 实现会议专用共享组件（VideoTile、Toolbar、Sidebar、MeetingHeader、AppShell）

**Files:**
- Create: `src/shared/components/VideoTile.vue`
- Create: `src/shared/components/Toolbar.vue`
- Create: `src/shared/components/Sidebar.vue`
- Create: `src/shared/components/MeetingHeader.vue`
- Create: `src/shared/components/AppShell.vue`

- [ ] **Step 1: 实现 VideoTile.vue**

```vue
<script setup lang="ts">
import { MicrophoneIcon, MicrophoneSlashIcon, VideoCameraIcon, VideoCameraSlashIcon } from '@heroicons/vue/24/solid'
import Avatar from './Avatar.vue'

interface Props {
  name: string
  avatarUrl?: string
  isMuted?: boolean
  isVideoOff?: boolean
  isSpeaking?: boolean
}

withDefaults(defineProps<Props>(), {
  isMuted: false,
  isVideoOff: false,
  isSpeaking: false,
})
</script>

<template>
  <div
    class="@container relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-slate-800"
    :class="isSpeaking && 'ring-2 ring-primary-500'"
  >
    <video v-if="!isVideoOff" class="h-full w-full object-cover" autoplay muted playsinline />
    <Avatar v-else :name="name" :src="avatarUrl" size="lg" />
    
    <div class="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/50 px-2 py-1 text-xs text-white">
      <span>{{ name }}</span>
      <MicrophoneSlashIcon v-if="isMuted" class="h-3 w-3" />
    </div>
  </div>
</template>
```

- [ ] **Step 2: 实现 Toolbar.vue**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  MicrophoneIcon,
  MicrophoneSlashIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  UsersIcon,
  PhoneXMarkIcon,
} from '@heroicons/vue/24/outline'
import IconButton from './IconButton.vue'

const emit = defineEmits<{
  toggleMic: []
  toggleVideo: []
  toggleSidebar: []
  leave: []
}>()

const micOn = ref(true)
const videoOn = ref(true)

function toggleMic() {
  micOn.value = !micOn.value
  emit('toggleMic')
}

function toggleVideo() {
  videoOn.value = !videoOn.value
  emit('toggleVideo')
}
</script>

<template>
  <div class="@container flex items-center justify-center gap-2 bg-white p-3 shadow-lg dark:bg-slate-900">
    <IconButton
      :label="micOn ? '静音' : '解除静音'"
      :active="!micOn"
      @click="toggleMic"
    >
      <component :is="micOn ? MicrophoneIcon : MicrophoneSlashIcon" class="h-5 w-5" />
    </IconButton>
    <IconButton
      :label="videoOn ? '停止视频' : '开启视频'"
      :active="!videoOn"
      @click="toggleVideo"
    >
      <component :is="videoOn ? VideoCameraIcon : VideoCameraSlashIcon" class="h-5 w-5" />
    </IconButton>
    <IconButton label="参会者" @click="emit('toggleSidebar')">
      <UsersIcon class="h-5 w-5" />
    </IconButton>
    <IconButton label="离开会议" danger @click="emit('leave')">
      <PhoneXMarkIcon class="h-5 w-5" />
    </IconButton>
  </div>
</template>
```

- [ ] **Step 3: 实现 Sidebar.vue**

```vue
<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'

interface Props {
  open: boolean
  title: string
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <aside
    class="fixed inset-y-0 right-0 z-40 w-80 transform bg-white shadow-xl transition-transform dark:bg-slate-800"
    :class="open ? 'translate-x-0' : 'translate-x-full'"
  >
    <div class="flex h-full flex-col">
      <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <h2 class="font-semibold">{{ title }}</h2>
        <button aria-label="关闭" class="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-700" @click="emit('close')">
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
      <div class="@container flex-1 overflow-y-auto p-4">
        <slot />
      </div>
    </div>
  </aside>
</template>
```

- [ ] **Step 4: 实现 MeetingHeader.vue**

```vue
<script setup lang="ts">
interface Props {
  title: string
  meetingId: string
}

defineProps<Props>()
</script>

<template>
  <header class="flex items-center justify-between bg-white px-4 py-2 shadow-sm dark:bg-slate-900">
    <div class="@container flex items-center gap-3">
      <h1 class="text-sm font-semibold @md:text-base">{{ title }}</h1>
      <span class="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800">{{ meetingId }}</span>
    </div>
    <div class="flex items-center gap-2">
      <slot />
    </div>
  </header>
</template>
```

- [ ] **Step 5: 实现 AppShell.vue**

```vue
<template>
  <div class="flex min-h-screen flex-col">
    <slot />
  </div>
</template>
```

- [ ] **Step 6: Commit**

```bash
git add src/shared/components/VideoTile.vue src/shared/components/Toolbar.vue src/shared/components/Sidebar.vue src/shared/components/MeetingHeader.vue src/shared/components/AppShell.vue
git commit -m "feat(shared): 实现会议专用布局组件"
```

---

## Task 9: 实现 meetingStore 与 uiStore

**Files:**
- Create: `src/shared/stores/meetingStore.ts`
- Create: `src/shared/stores/uiStore.ts`
- Create: `src/shared/stores/__tests__/meetingStore.spec.ts`

- [ ] **Step 1: 实现 meetingStore**

```ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { ChatMessage, Meeting, Participant } from '@/shared/types'

export const useMeetingStore = defineStore('meeting', () => {
  const currentMeeting = ref<Meeting | null>(null)
  const participants = ref<Participant[]>([])
  const localUser = ref<Participant | null>(null)
  const messages = ref<ChatMessage[]>([])
  const isMuted = ref(false)
  const isVideoOff = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isHost = computed(() => localUser.value?.isHost ?? false)

  async function join(meetingId: string, displayName: string) {
    isLoading.value = true
    error.value = null
    try {
      const res = await fetch(`/api/meetings/${meetingId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName }),
      })
      const { data } = await res.json()
      localUser.value = {
        id: data.participantId,
        displayName: data.displayName,
        isHost: false,
        isMuted: false,
        isVideoOff: false,
      }
      const meetingRes = await fetch(`/api/meetings/${meetingId}`)
      const meetingJson = await meetingRes.json()
      currentMeeting.value = meetingJson.data
    } catch (e) {
      error.value = e instanceof Error ? e.message : '加入会议失败'
    } finally {
      isLoading.value = false
    }
  }

  function leave() {
    currentMeeting.value = null
    participants.value = []
    localUser.value = null
    messages.value = []
  }

  function toggleMute() {
    isMuted.value = !isMuted.value
  }

  function toggleVideo() {
    isVideoOff.value = !isVideoOff.value
  }

  async function sendMessage(content: string) {
    if (!currentMeeting.value || !localUser.value || !content.trim()) return
    const res = await fetch(`/api/meetings/${currentMeeting.value.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    const { data } = await res.json()
    messages.value.push(data)
  }

  return {
    currentMeeting,
    participants,
    localUser,
    messages,
    isMuted,
    isVideoOff,
    isLoading,
    error,
    isHost,
    join,
    leave,
    toggleMute,
    toggleVideo,
    sendMessage,
  }
})
```

- [ ] **Step 2: 实现 uiStore**

```ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const sidebarOpen = ref(false)
  const activeSidebarTab = ref<'participants' | 'chat'>('participants')

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function closeSidebar() {
    sidebarOpen.value = false
  }

  function setActiveTab(tab: 'participants' | 'chat') {
    activeSidebarTab.value = tab
  }

  return { sidebarOpen, activeSidebarTab, toggleSidebar, closeSidebar, setActiveTab }
})
```

- [ ] **Step 3: 编写 meetingStore 测试**

```ts
import { createPinia, setActivePinia } from 'pinia'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { server } from '@/mocks/server'
import { http, HttpResponse } from 'msw'
import { useMeetingStore } from '../meetingStore'

describe('meetingStore', () => {
  beforeAll(() => server.listen())
  beforeEach(() => {
    setActivePinia(createPinia())
    server.resetHandlers()
  })

  it('join 成功后设置当前会议', async () => {
    server.use(
      http.get('/api/meetings/:id', () => HttpResponse.json({ data: { id: '111', title: '测试会议', hostId: 'u1', startTime: '', status: 'live' } }))
    )
    const store = useMeetingStore()
    await store.join('111', '访客')
    expect(store.currentMeeting?.title).toBe('测试会议')
    expect(store.localUser?.displayName).toBe('访客')
  })

  it('toggleMute 切换静音状态', () => {
    const store = useMeetingStore()
    expect(store.isMuted).toBe(false)
    store.toggleMute()
    expect(store.isMuted).toBe(true)
  })
})
```

- [ ] **Step 4: 创建 vitest.setup.ts 并配置 MSW**

```ts
import { config } from '@vue/test-utils'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './src/mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

config.global.stubs = {
  transition: false,
}
```

- [ ] **Step 5: 更新 vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
})
```

- [ ] **Step 6: 运行测试确认通过**

Run:
```bash
npx vitest run src/shared/stores/__tests__/meetingStore.spec.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/shared/stores/meetingStore.ts src/shared/stores/uiStore.ts src/shared/stores/__tests__/meetingStore.spec.ts vitest.config.ts vitest.setup.ts
git commit -m "feat(store): 实现 meetingStore、uiStore 及 MSW 测试集成"
```

---

## Task 10: 实现 Vue Router 与入口文件

**Files:**
- Create: `src/app/router.ts`
- Create: `src/app/App.vue`
- Create: `src/app/main.ts`
- Modify: `src/main.ts` (if exists) otherwise create

- [ ] **Step 1: 实现 router.ts**

```ts
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('@/features/home/views/HomeView.vue') },
  { path: '/join', component: () => import('@/features/join/views/JoinView.vue') },
  { path: '/pre-meeting/:meetingId', component: () => import('@/features/pre-meeting/views/PreMeetingView.vue') },
  { path: '/waiting/:meetingId', component: () => import('@/features/waiting-room/views/WaitingRoomView.vue') },
  { path: '/meeting/:meetingId', component: () => import('@/features/meeting-room/views/MeetingRoomView.vue') },
  { path: '/ended/:meetingId', component: () => import('@/features/meeting-ended/views/MeetingEndedView.vue') },
  { path: '/:pathMatch(.*)*', component: () => import('@/features/home/views/NotFoundView.vue') },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
```

- [ ] **Step 2: 实现 App.vue**

```vue
<script setup lang="ts">
import { onErrorCaptured } from 'vue'
import { RouterView } from 'vue-router'
import AppShell from '@/shared/components/AppShell.vue'

onErrorCaptured((err) => {
  console.error('App error:', err)
  return false
})
</script>

<template>
  <AppShell>
    <RouterView />
  </AppShell>
</template>
```

- [ ] **Step 3: 实现 main.ts**

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import { useThemeStore } from '@/shared/stores/themeStore'
import '@/shared/styles/tailwind.css'

async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') return
  const { worker } = await import('@/mocks/browser')
  return worker.start()
}

enableMocking().then(() => {
  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)
  app.use(router)

  const themeStore = useThemeStore()
  themeStore.initTheme()

  app.mount('#app')
})
```

- [ ] **Step 4: Commit**

```bash
git add src/app/router.ts src/app/App.vue src/app/main.ts
git commit -m "feat(app): 配置 Vue Router、Pinia、MSW 开发拦截与主题初始化"
```

---

## Task 11: 实现 Home / 会议列表页面

**Files:**
- Create: `src/features/home/views/HomeView.vue`
- Create: `src/features/home/components/MeetingList.vue`
- Create: `src/features/home/components/MeetingListItem.vue`
- Create: `src/features/home/components/QuickStartCard.vue`
- Create: `src/features/home/views/NotFoundView.vue`
- Create: `src/features/home/index.ts`

- [ ] **Step 1: 实现 MeetingListItem.vue**

```vue
<script setup lang="ts">
import type { Meeting } from '@/shared/types'

interface Props {
  meeting: Meeting
}

defineProps<Props>()

const emit = defineEmits<{
  join: [id: string]
}>()
</script>

<template>
  <div class="@container flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700">
    <div class="min-w-0">
      <h3 class="font-medium">{{ meeting.title }}</h3>
      <p class="text-sm text-slate-500">会议号：{{ meeting.id }}</p>
    </div>
    <button
      class="shrink-0 rounded-lg bg-primary-600 px-3 py-1.5 text-sm text-white hover:bg-primary-700"
      @click="emit('join', meeting.id)"
    >
      加入
    </button>
  </div>
</template>
```

- [ ] **Step 2: 实现 MeetingList.vue**

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Meeting } from '@/shared/types'
import MeetingListItem from './MeetingListItem.vue'

const meetings = ref<Meeting[]>([])
const loading = ref(false)

const emit = defineEmits<{
  join: [id: string]
}>()

onMounted(async () => {
  loading.value = true
  const res = await fetch('/api/meetings')
  const { data } = await res.json()
  meetings.value = data
  loading.value = false
})
</script>

<template>
  <div class="@container flex flex-col gap-3">
    <p v-if="loading" class="text-slate-500">加载中…</p>
    <MeetingListItem
      v-for="m in meetings"
      :key="m.id"
      :meeting="m"
      @join="emit('join', $event)"
    />
  </div>
</template>
```

- [ ] **Step 3: 实现 QuickStartCard.vue**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import Input from '@/shared/components/Input.vue'
import Button from '@/shared/components/Button.vue'

const meetingId = ref('')

const emit = defineEmits<{
  join: [id: string]
  create: []
}>()

function onJoin() {
  if (meetingId.value.trim()) emit('join', meetingId.value.trim())
}
</script>

<template>
  <div class="@container rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
    <h2 class="mb-4 text-lg font-semibold">快速开始</h2>
    <div class="flex flex-col gap-3 @md:flex-row">
      <Input v-model="meetingId" placeholder="输入会议号" class="flex-1" />
      <Button @click="onJoin">加入会议</Button>
      <Button variant="secondary" @click="emit('create')">新建会议</Button>
    </div>
  </div>
</template>
```

- [ ] **Step 4: 实现 HomeView.vue**

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'
import ThemeToggle from '@/shared/components/ThemeToggle.vue'
import MeetingList from '../components/MeetingList.vue'
import QuickStartCard from '../components/QuickStartCard.vue'

const router = useRouter()

function goJoin(id?: string) {
  router.push(id ? `/pre-meeting/${id}` : '/join')
}

function createMeeting() {
  router.push('/join?new=1')
}
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold">会议系统</h1>
      <ThemeToggle />
    </div>
    
    <div class="mb-8 flex flex-col gap-6">
      <QuickStartCard @join="goJoin" @create="createMeeting" />
      <section class="@container">
        <h2 class="mb-3 text-base font-semibold">最近会议</h2>
        <MeetingList @join="goJoin" />
      </section>
    </div>
  </div>
</template>
```

- [ ] **Step 5: 实现 NotFoundView.vue**

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from '@/shared/components/Button.vue'

const router = useRouter()
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 py-20">
    <h1 class="text-4xl font-bold">404</h1>
    <p class="text-slate-500">页面不存在</p>
    <Button @click="router.push('/')">返回首页</Button>
  </div>
</template>
```

- [ ] **Step 6: 创建 index.ts**

```ts
export { default as HomeView } from './views/HomeView.vue'
export { default as NotFoundView } from './views/NotFoundView.vue'
```

- [ ] **Step 7: Commit**

```bash
git add src/features/home
git commit -m "feat(home): 实现首页、会议列表、快速开始与 404 页面"
```

---

## Task 12: 实现 Join / 新建会议页面

**Files:**
- Create: `src/features/join/views/JoinView.vue`
- Create: `src/features/join/components/JoinMeetingForm.vue`
- Create: `src/features/join/components/NewMeetingForm.vue`
- Create: `src/features/join/index.ts`

- [ ] **Step 1: 实现 JoinMeetingForm.vue**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import Input from '@/shared/components/Input.vue'
import Button from '@/shared/components/Button.vue'

const meetingId = ref('')
const displayName = ref('')

const emit = defineEmits<{
  submit: [payload: { meetingId: string; displayName: string }]
}>()

function onSubmit() {
  if (!meetingId.value.trim() || !displayName.value.trim()) return
  emit('submit', { meetingId: meetingId.value.trim(), displayName: displayName.value.trim() })
}
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
    <Input v-model="meetingId" label="会议号" placeholder="请输入会议号" />
    <Input v-model="displayName" label="您的姓名" placeholder="请输入姓名" />
    <Button type="submit">加入会议</Button>
  </form>
</template>
```

- [ ] **Step 2: 实现 NewMeetingForm.vue**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import Input from '@/shared/components/Input.vue'
import Button from '@/shared/components/Button.vue'

const displayName = ref('')

const emit = defineEmits<{
  submit: [payload: { displayName: string }]
}>()

function onSubmit() {
  if (!displayName.value.trim()) return
  emit('submit', { displayName: displayName.value.trim() })
}
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
    <Input v-model="displayName" label="您的姓名" placeholder="请输入姓名" />
    <Button type="submit">新建会议</Button>
  </form>
</template>
```

- [ ] **Step 3: 实现 JoinView.vue**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import JoinMeetingForm from '../components/JoinMeetingForm.vue'
import NewMeetingForm from '../components/NewMeetingForm.vue'

const route = useRoute()
const router = useRouter()
const isNew = computed(() => route.query.new === '1')

function joinMeeting(payload: { meetingId: string; displayName: string }) {
  router.push(`/pre-meeting/${payload.meetingId}?displayName=${encodeURIComponent(payload.displayName)}`)
}

function createMeeting(payload: { displayName: string }) {
  const meetingId = Math.random().toString().slice(2, 11)
  router.push(`/pre-meeting/${meetingId}?displayName=${encodeURIComponent(payload.displayName)}`)
}
</script>

<template>
  <div class="mx-auto max-w-md px-4 py-12">
    <div class="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <h1 class="mb-6 text-xl font-bold">{{ isNew ? '新建会议' : '加入会议' }}</h1>
      <JoinMeetingForm v-if="!isNew" @submit="joinMeeting" />
      <NewMeetingForm v-else @submit="createMeeting" />
    </div>
  </div>
</template>
```

- [ ] **Step 4: 创建 index.ts**

```ts
export { default as JoinView } from './views/JoinView.vue'
```

- [ ] **Step 5: Commit**

```bash
git add src/features/join
git commit -m "feat(join): 实现加入/新建会议页面"
```

---

## Task 13: 实现 Pre-meeting / 会前设置页面

**Files:**
- Create: `src/features/pre-meeting/views/PreMeetingView.vue`
- Create: `src/features/pre-meeting/components/DevicePreview.vue`
- Create: `src/features/pre-meeting/components/DeviceSelector.vue`
- Create: `src/features/pre-meeting/index.ts`

- [ ] **Step 1: 实现 DevicePreview.vue**

```vue
<script setup lang="ts">
import Avatar from '@/shared/components/Avatar.vue'

interface Props {
  displayName: string
}

defineProps<Props>()
</script>

<template>
  <div class="@container relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-slate-900">
    <Avatar :name="displayName" size="lg" />
    <div class="absolute bottom-3 left-3 text-sm text-white">{{ displayName }}</div>
  </div>
</template>
```

- [ ] **Step 2: 实现 DeviceSelector.vue**

```vue
<script setup lang="ts">
import { ref } from 'vue'

const cameras = ref([
  { id: 'default', label: '默认摄像头' },
  { id: 'none', label: '无摄像头' },
])

const selected = ref('default')
</script>

<template>
  <div class="flex flex-col gap-2">
    <label class="text-sm font-medium">摄像头</label>
    <select v-model="selected" class="rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
      <option v-for="c in cameras" :key="c.id" :value="c.id">{{ c.label }}</option>
    </select>
  </div>
</template>
```

- [ ] **Step 3: 实现 PreMeetingView.vue**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '@/shared/components/Button.vue'
import DevicePreview from '../components/DevicePreview.vue'
import DeviceSelector from '../components/DeviceSelector.vue'

const route = useRoute()
const router = useRouter()
const meetingId = computed(() => route.params.meetingId as string)
const displayName = computed(() => (route.query.displayName as string) || '访客')

function enter() {
  router.push(`/meeting/${meetingId.value}`)
}
</script>

<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
    <h1 class="text-xl font-bold">会前设置</h1>
    
    <div class="@container grid gap-6 @lg:grid-cols-2">
      <DevicePreview :display-name="displayName" />
      <div class="flex flex-col gap-4">
        <DeviceSelector />
        <Button size="lg" @click="enter">加入会议</Button>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 4: 创建 index.ts**

```ts
export { default as PreMeetingView } from './views/PreMeetingView.vue'
```

- [ ] **Step 5: Commit**

```bash
git add src/features/pre-meeting
git commit -m "feat(pre-meeting): 实现会前设置页面"
```

---

## Task 14: 实现 Waiting-room / 等候室页面

**Files:**
- Create: `src/features/waiting-room/views/WaitingRoomView.vue`
- Create: `src/features/waiting-room/components/WaitingRoomCard.vue`
- Create: `src/features/waiting-room/index.ts`

- [ ] **Step 1: 实现 WaitingRoomCard.vue**

```vue
<script setup lang="ts">
interface Props {
  meetingTitle: string
  displayName: string
}

defineProps<Props>()
</script>

<template>
  <div class="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
    <h2 class="mb-2 text-xl font-semibold">{{ meetingTitle }}</h2>
    <p class="mb-6 text-slate-500">{{ displayName }}，请稍候，主持人即将准许你入会。</p>
    <div class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
  </div>
</template>
```

- [ ] **Step 2: 实现 WaitingRoomView.vue**

```vue
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WaitingRoomCard from '../components/WaitingRoomCard.vue'

const route = useRoute()
const router = useRouter()
const meetingId = computed(() => route.params.meetingId as string)
const displayName = computed(() => (route.query.displayName as string) || '访客')

onMounted(() => {
  setTimeout(() => {
    router.replace(`/meeting/${meetingId.value}`)
  }, 2500)
})
</script>

<template>
  <div class="flex min-h-[60vh] items-center justify-center px-4">
    <div class="w-full max-w-md">
      <WaitingRoomCard meeting-title="等待入会" :display-name="displayName" />
    </div>
  </div>
</template>
```

- [ ] **Step 3: 创建 index.ts**

```ts
export { default as WaitingRoomView } from './views/WaitingRoomView.vue'
```

- [ ] **Step 4: Commit**

```bash
git add src/features/waiting-room
git commit -m "feat(waiting-room): 实现等候室页面"
```

---

## Task 15: 实现 Meeting-room / 会议中页面

**Files:**
- Create: `src/features/meeting-room/views/MeetingRoomView.vue`
- Create: `src/features/meeting-room/components/VideoGrid.vue`
- Create: `src/features/meeting-room/components/MeetingToolbar.vue`
- Create: `src/features/meeting-room/components/ParticipantPanel.vue`
- Create: `src/features/meeting-room/components/ChatPanel.vue`
- Create: `src/features/meeting-room/index.ts`

- [ ] **Step 1: 实现 VideoGrid.vue**

```vue
<script setup lang="ts">
import VideoTile from '@/shared/components/VideoTile.vue'
import type { Participant } from '@/shared/types'

interface Props {
  participants: Participant[]
}

defineProps<Props>()
</script>

<template>
  <div class="@container grid h-full w-full gap-3 p-4 @xs:grid-cols-1 @sm:grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4">
    <VideoTile
      v-for="p in participants"
      :key="p.id"
      :name="p.displayName"
      :is-muted="p.isMuted"
      :is-video-off="p.isVideoOff"
    />
  </div>
</template>
```

- [ ] **Step 2: 实现 MeetingToolbar.vue**

```vue
<script setup lang="ts">
import Toolbar from '@/shared/components/Toolbar.vue'

const emit = defineEmits<{
  toggleMic: []
  toggleVideo: []
  toggleSidebar: []
  leave: []
}>()
</script>

<template>
  <Toolbar
    @toggle-mic="emit('toggleMic')"
    @toggle-video="emit('toggleVideo')"
    @toggle-sidebar="emit('toggleSidebar')"
    @leave="emit('leave')"
  />
</template>
```

- [ ] **Step 3: 实现 ParticipantPanel.vue**

```vue
<script setup lang="ts">
import Avatar from '@/shared/components/Avatar.vue'
import type { Participant } from '@/shared/types'

interface Props {
  participants: Participant[]
}

defineProps<Props>()
</script>

<template>
  <div class="@container flex flex-col gap-3">
    <div v-for="p in participants" :key="p.id" class="flex items-center gap-3">
      <Avatar :name="p.displayName" size="sm" />
      <div class="flex-1 truncate text-sm">
        {{ p.displayName }}
        <span v-if="p.isHost" class="ml-1 text-xs text-primary-600">主持人</span>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 4: 实现 ChatPanel.vue**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import Input from '@/shared/components/Input.vue'
import Button from '@/shared/components/Button.vue'
import type { ChatMessage } from '@/shared/types'

interface Props {
  messages: ChatMessage[]
}

defineProps<Props>()

const emit = defineEmits<{
  send: [content: string]
}>()

const content = ref('')

function onSend() {
  if (!content.value.trim()) return
  emit('send', content.value.trim())
  content.value = ''
}
</script>

<template>
  <div class="flex h-full flex-col gap-3">
    <div class="flex-1 space-y-3 overflow-y-auto">
      <div v-for="msg in messages" :key="msg.id" class="rounded bg-slate-100 p-2 text-sm dark:bg-slate-700">
        <div class="mb-1 text-xs text-slate-500">{{ msg.senderName }}</div>
        <div>{{ msg.content }}</div>
      </div>
    </div>
    
    <form class="flex gap-2" @submit.prevent="onSend">
      <Input v-model="content" placeholder="发送消息" class="flex-1" />
      <Button type="submit">发送</Button>
    </form>
  </div>
</template>
```

- [ ] **Step 5: 实现 MeetingRoomView.vue**

```vue
<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MeetingHeader from '@/shared/components/MeetingHeader.vue'
import Sidebar from '@/shared/components/Sidebar.vue'
import { useMeetingStore } from '@/shared/stores/meetingStore'
import { useUIStore } from '@/shared/stores/uiStore'
import VideoGrid from '../components/VideoGrid.vue'
import MeetingToolbar from '../components/MeetingToolbar.vue'
import ParticipantPanel from '../components/ParticipantPanel.vue'
import ChatPanel from '../components/ChatPanel.vue'

const route = useRoute()
const router = useRouter()
const meetingStore = useMeetingStore()
const uiStore = useUIStore()

const meetingId = computed(() => route.params.meetingId as string)

onMounted(() => {
  meetingStore.join(meetingId.value, '我')
})

watch(() => meetingStore.localUser, (user) => {
  if (!user) router.push('/')
})

function leave() {
  meetingStore.leave()
  router.push(`/ended/${meetingId.value}`)
}
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden">
    <MeetingHeader title="会议中" :meeting-id="meetingId">
      <button
        class="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400"
        @click="uiStore.toggleSidebar"
      >
        {{ uiStore.sidebarOpen ? '关闭' : '打开' }}侧边栏
      </button>
    </MeetingHeader>
    
    <main class="@container relative flex flex-1 overflow-hidden">
      <VideoGrid :participants="meetingStore.participants" />
      
      <Sidebar title="参会者" :open="uiStore.sidebarOpen" @close="uiStore.closeSidebar">
        <ParticipantPanel :participants="meetingStore.participants" />
        <div class="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
          <ChatPanel :messages="meetingStore.messages" @send="meetingStore.sendMessage" />
        </div>
      </Sidebar>
    </main>
    
    <MeetingToolbar
      @toggle-mic="meetingStore.toggleMute"
      @toggle-video="meetingStore.toggleVideo"
      @toggle-sidebar="uiStore.toggleSidebar"
      @leave="leave"
    />
  </div>
</template>
```

- [ ] **Step 6: 创建 index.ts**

```ts
export { default as MeetingRoomView } from './views/MeetingRoomView.vue'
```

- [ ] **Step 7: Commit**

```bash
git add src/features/meeting-room
git commit -m "feat(meeting-room): 实现会议中主界面与相关组件"
```

---

## Task 16: 实现 Meeting-ended / 结束页

**Files:**
- Create: `src/features/meeting-ended/views/MeetingEndedView.vue`
- Create: `src/features/meeting-ended/components/MeetingSummary.vue`
- Create: `src/features/meeting-ended/index.ts`

- [ ] **Step 1: 实现 MeetingSummary.vue**

```vue
<script setup lang="ts">
interface Props {
  meetingId: string
  durationText?: string
}

withDefaults(defineProps<Props>(), { durationText: '00:30:00' })

const emit = defineEmits<{
  back: []
}>()
</script>

<template>
  <div class="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
    <h2 class="mb-2 text-xl font-semibold">会议已结束</h2>
    <p class="mb-2 text-slate-500">会议号：{{ meetingId }}</p>
    <p class="mb-6 text-slate-500">时长：{{ durationText }}</p>
    <button class="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700" @click="emit('back')">
      返回首页
    </button>
  </div>
</template>
```

- [ ] **Step 2: 实现 MeetingEndedView.vue**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MeetingSummary from '../components/MeetingSummary.vue'

const route = useRoute()
const router = useRouter()
const meetingId = computed(() => route.params.meetingId as string)

function backHome() {
  router.push('/')
}
</script>

<template>
  <div class="flex min-h-[60vh] items-center justify-center px-4">
    <div class="w-full max-w-md">
      <MeetingSummary :meeting-id="meetingId" @back="backHome" />
    </div>
  </div>
</template>
```

- [ ] **Step 3: 创建 index.ts**

```ts
export { default as MeetingEndedView } from './views/MeetingEndedView.vue'
```

- [ ] **Step 4: Commit**

```bash
git add src/features/meeting-ended
git commit -m "feat(meeting-ended): 实现会议结束页"
```

---

## Task 17: 配置 Storybook 与全局 Decorators

**Files:**
- Create: `.storybook/main.ts`
- Create: `.storybook/preview.ts`
- Create: `.storybook/preview-body.html`
- Create: sample stories

- [ ] **Step 1: 初始化 Storybook 配置**

Run:
```bash
npx storybook@latest init --yes --package-manager npm
```

Expected: `.storybook/` created with default config.

- [ ] **Step 2: 修改 .storybook/main.ts**

```ts
import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
}

export default config
```

- [ ] **Step 3: 修改 .storybook/preview.ts**

```ts
import type { Preview } from '@storybook/vue3'
import { setupWorker } from 'msw/browser'
import { handlers } from '../src/mocks/handlers'
import '../src/shared/styles/tailwind.css'

const worker = setupWorker(...handlers)
worker.start({ onUnhandledRequest: 'bypass' })

const preview: Preview = {
  parameters: {
    backgrounds: { disable: true },
    actions: { argTypesRegex: '^on[A-Z].*' },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
      },
    },
  },
  decorators: [
    (story, context) => {
      const theme = context.globals.theme
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return story()
    },
  ],
}

export default preview
```

- [ ] **Step 4: 创建 Button.stories.ts 示例**

```ts
import type { Meta, StoryObj } from '@storybook/vue3'
import Button from '../src/shared/components/Button.vue'

const meta: Meta<typeof Button> = {
  component: Button,
  title: 'Shared/Button',
  args: { default: 'Button' },
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = { args: { variant: 'primary' } }
export const Secondary: Story = { args: { variant: 'secondary' } }
export const Danger: Story = { args: { variant: 'danger' } }
```

- [ ] **Step 5: Commit**

```bash
git add .storybook src/shared/components/Button.stories.ts package.json package-lock.json
git commit -m "chore(storybook): 配置 Storybook、MSW 与主题切换 decorator"
```

---

## Task 18: 编写组件 Stories

**Files:**
- Create: `src/shared/components/ThemeToggle.stories.ts`
- Create: `src/shared/components/VideoTile.stories.ts`
- Create: `src/features/home/components/MeetingList.stories.ts`
- Create: `src/features/meeting-room/components/VideoGrid.stories.ts`

- [ ] **Step 1: 编写 ThemeToggle.stories.ts**

```ts
import type { Meta, StoryObj } from '@storybook/vue3'
import { createPinia } from 'pinia'
import ThemeToggle from './ThemeToggle.vue'

const meta: Meta<typeof ThemeToggle> = {
  component: ThemeToggle,
  title: 'Shared/ThemeToggle',
  decorators: [
    () => ({
      setup() {
        createPinia()
      },
      template: '<story />',
    }),
  ],
}

export default meta
type Story = StoryObj<typeof ThemeToggle>

export const Default: Story = {}
```

- [ ] **Step 2: 编写 VideoTile.stories.ts**

```ts
import type { Meta, StoryObj } from '@storybook/vue3'
import VideoTile from './VideoTile.vue'

const meta: Meta<typeof VideoTile> = {
  component: VideoTile,
  title: 'Shared/VideoTile',
}

export default meta
type Story = StoryObj<typeof VideoTile>

export const CameraOn: Story = {
  args: { name: '张三', isMuted: false, isVideoOff: false },
}

export const CameraOff: Story = {
  args: { name: '李四', isMuted: true, isVideoOff: true },
}

export const Speaking: Story = {
  args: { name: '王五', isSpeaking: true },
}
```

- [ ] **Step 3: 编写 MeetingList.stories.ts**

```ts
import type { Meta, StoryObj } from '@storybook/vue3'
import MeetingList from './MeetingList.vue'

const meta: Meta<typeof MeetingList> = {
  component: MeetingList,
  title: 'Features/Home/MeetingList',
}

export default meta
type Story = StoryObj<typeof MeetingList>

export const Default: Story = {}
```

- [ ] **Step 4: 编写 VideoGrid.stories.ts**

```ts
import type { Meta, StoryObj } from '@storybook/vue3'
import VideoGrid from './VideoGrid.vue'

const meta: Meta<typeof VideoGrid> = {
  component: VideoGrid,
  title: 'Features/MeetingRoom/VideoGrid',
}

export default meta
type Story = StoryObj<typeof VideoGrid>

export const TwoParticipants: Story = {
  args: {
    participants: [
      { id: '1', displayName: '张三', isHost: true, isMuted: false, isVideoOff: false },
      { id: '2', displayName: '李四', isHost: false, isMuted: true, isVideoOff: true },
    ],
  },
}

export const FourParticipants: Story = {
  args: {
    participants: [
      { id: '1', displayName: '张三', isHost: true, isMuted: false, isVideoOff: false },
      { id: '2', displayName: '李四', isHost: false, isMuted: false, isVideoOff: false },
      { id: '3', displayName: '王五', isHost: false, isMuted: true, isVideoOff: false },
      { id: '4', displayName: '赵六', isHost: false, isMuted: false, isVideoOff: true },
    ],
  },
}
```

- [ ] **Step 5: Commit**

```bash
git add src/shared/components/*.stories.ts src/features/**/components/*.stories.ts
git commit -m "docs(storybook): 为核心组件添加 stories"
```

---

## Task 19: 编写 README 文档

**Files:**
- Create: `README.md`

- [ ] **Step 1: 创建 README.md**

```markdown
# Conference UI Skeleton

基于 Vue 3 + TypeScript + Vite + Tailwind CSS + Storybook + MSW 的会议系统前端 UI 骨架。

## 快速开始

```bash
npm install
npm run dev
```

访问 http://localhost:5173

## 脚本说明

- `npm run dev`：启动开发服务器
- `npm run build`：类型检查 + 生产构建
- `npm run type-check`：TypeScript 类型检查
- `npm run test`：运行 Vitest 测试
- `npm run storybook`：启动 Storybook

## 容器自适应方案注意事项

1. 组件内部禁止使用 `md:`、`lg:` 等视口断点，必须在外层容器声明 `@container`。
2. 页面级骨架布局（如全局导航、侧边栏折叠）可酌情使用媒体查询。
3. 开发复杂响应式组件时，优先在 Storybook 中通过调整容器宽度验证效果，而非缩放浏览器窗口。
4. `tailwind.config.ts` 必须正确安装并配置 `@tailwindcss/container-queries` 插件。
5. 容器断点默认值参见 `container-design.md`，不要随意覆盖。

## 日间/夜间模式注意事项

1. Tailwind 使用 `darkMode: 'class'`，主题类挂载在 `document.documentElement`。
2. 默认行为是跟随系统偏好，用户手动切换后优先读取 `localStorage` 记忆值。
3. 所有颜色 token 必须通过 `dark:` 修饰符或扩展主题配置提供暗色版本。
4. Storybook 预览区已配置主题切换，开发组件时务必在两种主题下检查。
5. 切换主题时不要直接操作 DOM，统一通过 `themeStore.setTheme()`。

## MSW Mock 注意事项

1. 开发环境通过 `src/mocks/browser.ts` 自动注册 MSW worker，无需手动启动 mock 服务。
2. REST API handlers 统一放在 `src/mocks/handlers.ts`，按业务域分文件管理。
3. WebSocket 模拟通过 `src/mocks/socket.ts` 提供，真实信令接入时只需替换 adapter。
4. Storybook 在 `preview.ts` 中全局加载 MSW，单个 story 可通过 `parameters.msw.handlers` 局部覆盖。
5. 测试环境在 `vitest.setup.ts` 中启用 `msw/server`，每个用例结束后清理 handlers，避免测试间污染。
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: 编写 README 与容器/主题/MSW 注意事项"
```

---

## Task 20: 最终验证

**Files:**
- All existing files

- [ ] **Step 1: 运行类型检查**

Run:
```bash
npm run type-check
```

Expected: No errors.

- [ ] **Step 2: 运行全部测试**

Run:
```bash
npm run test
```

Expected: All tests pass.

- [ ] **Step 3: 运行 Storybook 构建**

Run:
```bash
npm run build-storybook
```

Expected: `storybook-static/` created with no errors.

- [ ] **Step 4: 运行生产构建**

Run:
```bash
npm run build
```

Expected: `dist/` created with no errors.

- [ ] **Step 5: 检查 console.log**

Run:
```bash
grep -r "console.log" src/ --include="*.vue" --include="*.ts" || echo "No console.log found"
```

Expected: No `console.log` in production code (except in `onErrorCaptured`).

- [ ] **Step 6: 最终 Commit（如仅有格式化或修复）**

```bash
git add -A
git commit -m "chore: 最终验证与清理"
```

---

## Self-Review

### 1. Spec coverage

| Spec 章节 | 对应 Task |
|---|---|
| 技术栈（Vue3/TS/Vite/Router/Pinia/Tailwind/Headless/Storybook/MSW/Vitest） | Task 1, 2, 5, 17 |
| Feature-based 目录结构 | Task 1, 11-16 |
| 页面清单（7 个路由） | Task 10, 11-16 |
| Shared 组件 | Task 6, 7, 8 |
| Feature 组件 | Task 11-16 |
| 容器查询优先 | Task 2, 6-9, 11-15 |
| 日间/夜间模式 | Task 4, 17 |
| Store 设计 | Task 4, 9 |
| MSW Mock 策略 | Task 5, 9, 17 |
| 错误处理 | Task 10 |
| 测试策略 | Task 4, 6, 7, 9, 17, 20 |
| README | Task 19 |

### 2. Placeholder scan

- 无 TBD/TODO。
- 所有步骤均包含具体文件路径、代码或命令。
- 测试步骤包含预期输出。

### 3. Type consistency

- `Theme` 类型在 `src/shared/types/index.ts` 中定义，被 `themeStore`、`ThemeToggle` 使用。
- `Participant` / `Meeting` / `ChatMessage` 类型被 store、components、stories 共享。
- MSW handler URL 与 store 中 fetch URL 一致。

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-09-conference-ui-implementation-plan.md`.

Two execution options:

1. **Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration
2. **Inline Execution** - Execute tasks in this session using `superpowers:executing-plans`, batch execution with checkpoints

Which approach?
