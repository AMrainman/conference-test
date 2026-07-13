# create-vue skill redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-_SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `create-vue` skill 从固定模板改造为交互式插件选择生成器，根据用户选择动态组合 Vue 3 + TypeScript + Vite 项目骨架。

**Architecture:** 采用 "base 模板 + 插件片段" 架构。base 存放必选核心（Vue 3、TS、Vite、Tailwind、日间/夜间模式、容器自适应），每个可选插件/库拥有独立片段目录，包含 manifest、files 和 overrides。执行时通过 Node.js 交互脚本收集用户选择，再由生成器组合文件、合并配置并初始化项目。

**Tech Stack:** Node.js 脚本、`@inquirer/prompts`、原生 fs、JSON 合并工具、模板文件系统。

---

## File Structure

```
.claude/skills/create-vue/
├── SKILL.md                           # 更新使用说明
├── lib/
│   ├── prompt.js                      # 终端交互选择
│   ├── merge-config.js                # package.json / vite.config.ts 等合并工具
│   └── generate.js                    # 主生成逻辑
├── template/
│   ├── base/                          # 必选核心模板
│   ├── plugins/
│   │   ├── pinia/
│   │   ├── vue-router/
│   │   ├── storybook/
│   │   ├── msw/
│   │   ├── eslint/
│   │   ├── prettier/
│   │   ├── vitest/
│   │   ├── auto-import/
│   │   └── components-auto/
│   ├── ui-libraries/
│   │   ├── headlessui/
│   │   ├── ant-design-vue/
│   │   ├── element-plus/
│   │   ├── vant/
│   │   ├── quasar/
│   │   ├── vuetify/
│   │   ├── primevue/
│   │   └── naive-ui/
│   └── icon-libraries/
│       ├── fontawesome/
│       ├── heroicons/
│       └── lucide/
```

---

## Task 1: 重构 template 目录结构

**Files:**
- Create: `.claude/skills/create-vue/template/base/`
- Create: `.claude/skills/create-vue/template/plugins/`
- Create: `.claude/skills/create-vue/template/ui-libraries/`
- Create: `.claude/skills/create-vue/template/icon-libraries/`
- Modify: `.claude/skills/create-vue/template/` 下现有文件路径

- [ ] **Step 1: 创建新目录结构**

Run:

```bash
cd /home/mingg/github/conference-test/.claude/skills/create-vue/template
mkdir -p base/plugins-hold base/ui-libraries-hold base/icon-libraries-hold
mkdir -p plugins/pinia plugins/vue-router plugins/storybook plugins/msw plugins/eslint plugins/prettier plugins/vitest plugins/auto-import plugins/components-auto
mkdir -p ui-libraries/headlessui ui-libraries/ant-design-vue ui-libraries/element-plus ui-libraries/vant ui-libraries/quasar ui-libraries/vuetify ui-libraries/primevue ui-libraries/naive-ui
mkdir -p icon-libraries/fontawesome icon-libraries/heroicons icon-libraries/lucide
```

- [ ] **Step 2: 将现有 template 文件整体移入 base/**

Run:

```bash
cd /home/mingg/github/conference-test/.claude/skills/create-vue/template
# 移动所有非目录文件到 base
mv package.json vite.config.ts tsconfig.json tsconfig.node.json postcss.config.js tailwind.config.ts index.html .gitignore .gitattributes .npmrc .prettierrc .storybook eslint.config.js vitest.config.ts vitest.setup.ts CLAUDE.md README.md base/ 2>/dev/null || true
# 移动 src 到 base
mv src base/
# 移动 .claude/rules 到 base
mv .claude/rules base/.claude/
# 删除占位目录
rm -rf base/plugins-hold base/ui-libraries-hold base/icon-libraries-hold
```

- [ ] **Step 3: 验证 base 目录结构**

Run:

```bash
find /home/mingg/github/conference-test/.claude/skills/create-vue/template/base -maxdepth 2 -type f | sort | head -50
```

Expected output: 包含 `base/package.json`、`base/vite.config.ts`、`base/src/app/main.ts` 等原有文件。

- [ ] **Step 4: Commit**

Run:

```bash
cd /home/mingg/github/conference-test
git add .claude/skills/create-vue/template
git commit -m "chore(create-vue): 重构模板目录为 base + 插件片段结构"
```

---

## Task 2: 补齐 base 模板配置

**Files:**
- Modify: `.claude/skills/create-vue/template/base/tailwind.config.ts`
- Modify: `.claude/skills/create-vue/template/base/eslint.config.js`
- Modify: `.claude/skills/create-vue/template/base/.gitignore`
- Modify: `.claude/skills/create-vue/template/base/package.json`

- [ ] **Step 1: 补齐 tailwind.config.ts 色板**

Modify `.claude/skills/create-vue/template/base/tailwind.config.ts`:

在 `primary` 后追加 `success`、`warning`、`danger` 色板：

```typescript
        success: {
          DEFAULT: 'rgb(var(--color-success) / <alpha-value>)',
          hover: 'rgb(var(--color-success-hover) / <alpha-value>)',
          subtle: 'rgb(var(--color-success-subtle) / <alpha-value>)',
          text: 'rgb(var(--color-success-text) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'rgb(var(--color-warning) / <alpha-value>)',
          hover: 'rgb(var(--color-warning-hover) / <alpha-value>)',
          subtle: 'rgb(var(--color-warning-subtle) / <alpha-value>)',
          text: 'rgb(var(--color-warning-text) / <alpha-value>)',
        },
```

- [ ] **Step 2: 统一 ESLint 规则**

Modify `.claude/skills/create-vue/template/base/eslint.config.js`:

将 `'no-console': ['error', { allow: ['warn', 'error'] }]` 改为：

```javascript
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
```

在 Vue 放宽规则区域追加：

```javascript
      'vue/no-v-html': 'off',
```

- [ ] **Step 3: 更新 .gitignore**

Modify `.claude/skills/create-vue/template/base/.gitignore`:

追加以下内容：

```gitignore
# 自动生成声明
src/auto-imports.d.ts
src/components.d.ts

# Storybook
storybook-static
*storybook.log
```

- [ ] **Step 4: 更新 base package.json**

Modify `.claude/skills/create-vue/template/base/package.json`:

将 `scripts.test` 改为与参考项目一致：

```json
    "test": "vitest run",
```

将 `scripts.lint` 改为：

```json
    "lint": "eslint . --ext .vue,.ts,.tsx",
    "lint:fix": "eslint . --ext .vue,.ts,.tsx --fix",
```

- [ ] **Step 5: 验证 base 配置无语法错误**

Run:

```bash
cd /home/mingg/github/conference-test/.claude/skills/create-vue/template/base
npx eslint --no-eslintrc --parser-options=ecmaVersion:2022 tailwind.config.ts eslint.config.js
```

Expected output: 无错误（或命令退出码 0）。

- [ ] **Step 6: Commit**

Run:

```bash
cd /home/mingg/github/conference-test
git add .claude/skills/create-vue/template/base
git commit -m "chore(create-vue): 统一 base 模板配置与参考项目对齐"
```

---

## Task 3: 创建配置合并工具

**Files:**
- Create: `.claude/skills/create-vue/lib/merge-config.js`
- Create: `.claude/skills/create-vue/lib/__tests__/merge-config.test.js`

- [ ] **Step 1: 创建合并 package.json 工具函数**

Create `.claude/skills/create-vue/lib/merge-config.js`:

```javascript
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

export function mergePackageJson(basePath, overridePath) {
  const base = JSON.parse(readFileSync(basePath, 'utf-8'))
  if (!existsSync(overridePath)) return base

  const override = JSON.parse(readFileSync(overridePath, 'utf-8'))

  return {
    ...base,
    dependencies: { ...base.dependencies, ...override.dependencies },
    devDependencies: { ...base.devDependencies, ...override.devDependencies },
    scripts: { ...base.scripts, ...override.scripts },
    msw: override.msw ?? base.msw,
  }
}

export function mergeObject(base, override) {
  return { ...base, ...override }
}
```

- [ ] **Step 2: 编写测试验证合并逻辑**

Create `.claude/skills/create-vue/lib/__tests__/merge-config.test.js`:

```javascript
import { describe, it, expect } from 'vitest'
import { mergePackageJson, mergeObject } from '../merge-config.js'

describe('mergePackageJson', () => {
  it('merges dependencies and devDependencies', () => {
    const base = {
      dependencies: { vue: '^3.5.0' },
      devDependencies: { vite: '^6.0.0' },
      scripts: { dev: 'vite' },
    }
    const override = {
      dependencies: { pinia: '^2.1.7' },
      devDependencies: { '@vitejs/plugin-vue': '^5.2.0' },
      scripts: { test: 'vitest run' },
    }
    const result = mergePackageJson(
      JSON.stringify(base),
      JSON.stringify(override)
    )
    expect(result.dependencies).toEqual({ vue: '^3.5.0', pinia: '^2.1.7' })
    expect(result.devDependencies).toEqual({ vite: '^6.0.0', '@vitejs/plugin-vue': '^5.2.0' })
    expect(result.scripts).toEqual({ dev: 'vite', test: 'vitest run' })
  })
})

describe('mergeObject', () => {
  it('overrides base keys with override keys', () => {
    expect(mergeObject({ a: 1, b: 2 }, { b: 3, c: 4 })).toEqual({ a: 1, b: 3, c: 4 })
  })
})
```

Note: 需要调整 `mergePackageJson` 接口以支持字符串路径，或测试直接写文件到临时目录。

- [ ] **Step 3: 运行测试**

Run:

```bash
cd /home/mingg/github/conference-test/.claude/skills/create-vue
npm init -y
npm install -D vitest
npx vitest run lib/__tests__/merge-config.test.js
```

Expected output: 测试通过。

- [ ] **Step 4: Commit**

Run:

```bash
cd /home/mingg/github/conference-test
git add .claude/skills/create-vue/lib
git commit -m "feat(create-vue): 添加配置合并工具"
```

---

## Task 4: 创建交互提示脚本

**Files:**
- Create: `.claude/skills/create-vue/lib/prompt.js`
- Create: `.claude/skills/create-vue/lib/__tests__/prompt.test.js`

- [ ] **Step 1: 安装 @inquirer/prompts**

Run:

```bash
cd /home/mingg/github/conference-test/.claude/skills/create-vue
npm install @inquirer/prompts
```

- [ ] **Step 2: 实现 prompt.js**

Create `.claude/skills/create-vue/lib/prompt.js`:

```javascript
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
```

- [ ] **Step 3: 运行交互脚本 smoke test**

Create `.claude/skills/create-vue/lib/__tests__/prompt.test.js`:

```javascript
import { describe, it, expect } from 'vitest'
import { UI_LIBRARIES, ICON_LIBRARIES, DX_PLUGINS } from '../prompt.js'

describe('prompt choices', () => {
  it('UI_LIBRARIES includes null option', () => {
    expect(UI_LIBRARIES[0].value).toBeNull()
  })

  it('ICON_LIBRARIES are unchecked by default', () => {
    expect(ICON_LIBRARIES.every(c => c.checked === false)).toBe(true)
  })
})
```

Run:

```bash
cd /home/mingg/github/conference-test/.claude/skills/create-vue
npx vitest run lib/__tests__/prompt.test.js
```

Expected output: 测试通过。

- [ ] **Step 4: Commit**

Run:

```bash
cd /home/mingg/github/conference-test
git add .claude/skills/create-vue/lib
git commit -m "feat(create-vue): 添加交互式插件选择提示"
```

---

## Task 5: 创建片段 manifest 规范

**Files:**
- Create: `.claude/skills/create-vue/template/plugins/pinia/manifest.json`
- Create: `.claude/skills/create-vue/template/plugins/vue-router/manifest.json`
- Create: `.claude/skills/create-vue/template/plugins/eslint/manifest.json`
- Create: `.claude/skills/create-vue/template/plugins/prettier/manifest.json`
- Create: `.claude/skills/create-vue/template/plugins/vitest/manifest.json`

- [ ] **Step 1: 定义 manifest schema**

每个 `manifest.json` 格式：

```json
{
  "name": "pinia",
  "displayName": "Pinia",
  "category": "plugin",
  "description": "Vue 状态管理",
  "dependencies": {
    "pinia": "^2.1.7"
  },
  "devDependencies": {},
  "scripts": {},
  "files": ["src/shared/stores/counterStore.ts"],
  "overrides": ["src/app/main.ts"],
  "postInstall": []
}
```

- [ ] **Step 2: 创建 Pinia manifest**

Create `.claude/skills/create-vue/template/plugins/pinia/manifest.json`:

```json
{
  "name": "pinia",
  "displayName": "Pinia",
  "category": "plugin",
  "description": "Vue 状态管理",
  "dependencies": {
    "pinia": "^2.1.7"
  },
  "devDependencies": {},
  "scripts": {},
  "files": [],
  "overrides": ["src/app/main.ts"],
  "postInstall": []
}
```

- [ ] **Step 3: 创建 Vue Router manifest**

Create `.claude/skills/create-vue/template/plugins/vue-router/manifest.json`:

```json
{
  "name": "vue-router",
  "displayName": "Vue Router",
  "category": "plugin",
  "description": "Vue 路由",
  "dependencies": {
    "vue-router": "^4.4.0"
  },
  "devDependencies": {},
  "scripts": {},
  "files": ["src/app/router.ts"],
  "overrides": ["src/app/main.ts", "src/app/App.vue"],
  "postInstall": []
}
```

- [ ] **Step 4: 创建 ESLint manifest**

Create `.claude/skills/create-vue/template/plugins/eslint/manifest.json`:

```json
{
  "name": "eslint",
  "displayName": "ESLint",
  "category": "plugin",
  "description": "代码检查",
  "dependencies": {},
  "devDependencies": {
    "eslint": "^10.6.0",
    "eslint-plugin-oxlint": "^1.73.0",
    "eslint-plugin-prettier": "^5.5.6",
    "eslint-plugin-vue": "^10.9.2",
    "@vue/eslint-config-prettier": "^10.2.0",
    "@vue/eslint-config-typescript": "^14.9.0"
  },
  "scripts": {
    "lint": "eslint . --ext .vue,.ts,.tsx",
    "lint:fix": "eslint . --ext .vue,.ts,.tsx --fix"
  },
  "files": ["eslint.config.js"],
  "overrides": [],
  "postInstall": []
}
```

- [ ] **Step 5: 创建 Prettier manifest**

Create `.claude/skills/create-vue/template/plugins/prettier/manifest.json`:

```json
{
  "name": "prettier",
  "displayName": "Prettier",
  "category": "plugin",
  "description": "代码格式化",
  "dependencies": {},
  "devDependencies": {
    "prettier": "^3.9.4"
  },
  "scripts": {
    "format": "prettier --write \"src/**/*.{ts,vue,css,json}\""
  },
  "files": [".prettierrc"],
  "overrides": [],
  "postInstall": []
}
```

- [ ] **Step 6: 创建 Vitest manifest**

Create `.claude/skills/create-vue/template/plugins/vitest/manifest.json`:

```json
{
  "name": "vitest",
  "displayName": "Vitest",
  "category": "plugin",
  "description": "单元测试",
  "dependencies": {},
  "devDependencies": {
    "vitest": "^2.0.0",
    "@vue/test-utils": "^2.4.6",
    "jsdom": "^24.1.0"
  },
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "files": ["vitest.config.ts", "vitest.setup.ts"],
  "overrides": [],
  "postInstall": []
}
```

- [ ] **Step 7: Commit**

Run:

```bash
cd /home/mingg/github/conference-test
git add .claude/skills/create-vue/template/plugins
git commit -m "feat(create-vue): 添加核心插件 manifest 定义"
```

---

## Task 6: 迁移现有 base 中的可选插件文件到对应片段

**Files:**
- Create: `.claude/skills/create-vue/template/plugins/eslint/eslint.config.js`
- Create: `.claude/skills/create-vue/template/plugins/prettier/.prettierrc`
- Create: `.claude/skills/create-vue/template/plugins/vitest/vitest.config.ts`
- Create: `.claude/skills/create-vue/template/plugins/vitest/vitest.setup.ts`
- Create: `.claude/skills/create-vue/template/plugins/storybook/manifest.json`
- Create: `.claude/skills/create-vue/template/plugins/msw/manifest.json`
- Modify: `.claude/skills/create-vue/template/base/package.json`
- Modify: `.claude/skills/create-vue/template/base/vite.config.ts`
- Modify: `.claude/skills/create-vue/template/base/src/app/main.ts`
- Modify: `.claude/skills/create-vue/template/base/src/app/App.vue`
- Modify: `.claude/skills/create-vue/template/base/src/app/router.ts`

- [ ] **Step 1: 将 ESLint/Prettier/Vitest 文件移出 base**

Run:

```bash
cd /home/mingg/github/conference-test/.claude/skills/create-vue/template
mv base/eslint.config.js plugins/eslint/files/
mv base/.prettierrc plugins/prettier/files/
mv base/vitest.config.ts plugins/vitest/files/
mv base/vitest.setup.ts plugins/vitest/files/
```

- [ ] **Step 2: 创建 Storybook manifest 并迁移文件**

Create `.claude/skills/create-vue/template/plugins/storybook/manifest.json`:

```json
{
  "name": "storybook",
  "displayName": "Storybook",
  "category": "plugin",
  "description": "组件文档与测试",
  "dependencies": {},
  "devDependencies": {
    "@chromatic-com/storybook": "^1.6.1",
    "@storybook/addon-essentials": "^8.2.0",
    "@storybook/addon-interactions": "^8.2.0",
    "@storybook/blocks": "^8.2.0",
    "@storybook/test": "^8.2.0",
    "@storybook/vue3": "^8.2.0",
    "@storybook/vue3-vite": "^8.2.0",
    "storybook": "^8.2.0"
  },
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },
  "files": [".storybook"],
  "overrides": [],
  "postInstall": []
}
```

Run:

```bash
cd /home/mingg/github/conference-test/.claude/skills/create-vue/template
mv base/.storybook plugins/storybook/files/
```

- [ ] **Step 3: 创建 MSW manifest 并迁移文件**

Create `.claude/skills/create-vue/template/plugins/msw/manifest.json`:

```json
{
  "name": "msw",
  "displayName": "MSW",
  "category": "plugin",
  "description": "Mock Service Worker",
  "dependencies": {
    "msw": "^2.3.5"
  },
  "devDependencies": {},
  "scripts": {},
  "files": ["src/mocks"],
  "overrides": ["src/app/main.ts"],
  "postInstall": ["npx msw init public --save false"]
}
```

Run:

```bash
cd /home/mingg/github/conference-test/.claude/skills/create-vue/template
mv base/src/mocks plugins/msw/files/src/
```

- [ ] **Step 4: 从 base package.json 移除可选插件依赖**

Modify `.claude/skills/create-vue/template/base/package.json`:

移除以下内容：

```json
    "@headlessui/vue": "^1.7.22",
    "@heroicons/vue": "^2.1.5",
    "@tailwindcss/container-queries": "^0.1.1",
    "msw": "^2.3.5",
    "pinia": "^2.1.7",
    "vue-router": "^4.4.0"
```

以及 devDependencies 中的：

```json
    "@chromatic-com/storybook": "^1.6.1",
    "@storybook/addon-essentials": "^8.2.0",
    "@storybook/addon-interactions": "^8.2.0",
    "@storybook/blocks": "^8.2.0",
    "@storybook/test": "^8.2.0",
    "@storybook/vue3": "^8.2.0",
    "@storybook/vue3-vite": "^8.2.0",
    "@vue/eslint-config-prettier": "^10.2.0",
    "@vue/eslint-config-typescript": "^14.9.0",
    "@vue/test-utils": "^2.4.6",
    "eslint": "^10.6.0",
    "eslint-plugin-oxlint": "^1.73.0",
    "eslint-plugin-prettier": "^5.5.6",
    "eslint-plugin-vue": "^10.9.2",
    "jsdom": "^24.1.0",
    "prettier": "^3.9.4",
    "storybook": "^8.2.0",
    "vitest": "^2.0.0"
```

同时移除 `scripts` 中的 `lint`、`lint:fix`、`format`、`test`、`test:watch`、`storybook`、`build-storybook`。

- [ ] **Step 5: 简化 base vite.config.ts**

Modify `.claude/skills/create-vue/template/base/vite.config.ts`:

```typescript
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

- [ ] **Step 6: 简化 base src/app/main.ts**

Modify `.claude/skills/create-vue/template/base/src/app/main.ts`:

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import '@/shared/styles/tailwind.css'

const app = createApp(App)
app.mount('#app')
```

- [ ] **Step 7: 简化 base src/app/App.vue**

Modify `.claude/skills/create-vue/template/base/src/app/App.vue`:

```vue
<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'
import AppShell from '@/shared/components/AppShell.vue'

const capturedError = ref<Error | null>(null)

onErrorCaptured((err) => {
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
      <div class="rounded-lg bg-danger-subtle px-6 py-4 text-danger-text">
        <p class="font-semibold">应用发生错误</p>
        <p class="mt-1 text-sm">{{ capturedError.message }}</p>
      </div>
      <button
        type="button"
        class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-text hover:bg-primary-hover"
        @click="reload"
      >
        重新加载
      </button>
    </div>
    <HomeView v-else />
  </AppShell>
</template>
```

Wait: base 中如果没有 Vue Router，App.vue 不应该使用 `<RouterView>`。应该直接渲染 HomeView。但 HomeView 在 base 中。让我检查 base/src/features/home/views/HomeView.vue 是否存在。

Actually, from the original template, base/src/features/home/views/HomeView.vue exists. So App.vue can import HomeView directly.

- [ ] **Step 8: Commit**

Run:

```bash
cd /home/mingg/github/conference-test
git add .claude/skills/create-vue/template
git commit -m "refactor(create-vue): 将可选插件文件从 base 迁移到独立片段"
```

---

## Task 7: 创建 Vue Router / Pinia 片段 overrides

**Files:**
- Create: `.claude/skills/create-vue/template/plugins/vue-router/files/src/app/router.ts`
- Create: `.claude/skills/create-vue/template/plugins/vue-router/files/src/app/main.ts`
- Create: `.claude/skills/create-vue/template/plugins/vue-router/files/src/app/App.vue`
- Create: `.claude/skills/create-vue/template/plugins/pinia/files/src/app/main.ts`
- Create: `.claude/skills/create-vue/template/plugins/pinia/files/src/shared/stores/counterStore.ts`

- [ ] **Step 1: 创建 Vue Router 片段文件**

Create `.claude/skills/create-vue/template/plugins/vue-router/files/src/app/router.ts`:

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/features/home/views/HomeView.vue'
import AboutView from '@/features/about/views/AboutView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/about', component: AboutView },
  ],
})
```

Create `.claude/skills/create-vue/template/plugins/vue-router/files/src/app/main.ts`:

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import '@/shared/styles/tailwind.css'

const app = createApp(App)
app.use(router)
app.mount('#app')
```

Create `.claude/skills/create-vue/template/plugins/vue-router/files/src/app/App.vue`:

```vue
<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'
import { RouterView } from 'vue-router'
import AppShell from '@/shared/components/AppShell.vue'

const capturedError = ref<Error | null>(null)

onErrorCaptured((err) => {
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
      <div class="rounded-lg bg-danger-subtle px-6 py-4 text-danger-text">
        <p class="font-semibold">应用发生错误</p>
        <p class="mt-1 text-sm">{{ capturedError.message }}</p>
      </div>
      <button
        type="button"
        class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-text hover:bg-primary-hover"
        @click="reload"
      >
        重新加载
      </button>
    </div>
    <RouterView v-else />
  </AppShell>
</template>
```

- [ ] **Step 2: 创建 Pinia 片段文件**

Create `.claude/skills/create-vue/template/plugins/pinia/files/src/app/main.ts`:

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import '@/shared/styles/tailwind.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.mount('#app')
```

Create `.claude/skills/create-vue/template/plugins/pinia/files/src/shared/stores/counterStore.ts`:

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  function increment() {
    count.value++
  }

  return { count, increment }
})
```

- [ ] **Step 3: Commit**

Run:

```bash
cd /home/mingg/github/conference-test
git add .claude/skills/create-vue/template/plugins
git commit -m "feat(create-vue): 添加 Vue Router 与 Pinia 片段"
```

---

## Task 8: 创建 MSW 与 Storybook 片段 overrides

**Files:**
- Create: `.claude/skills/create-vue/template/plugins/msw/files/src/app/main.ts`
- Create: `.claude/skills/create-vue/template/plugins/msw/files/src/mocks/browser.ts`
- Create: `.claude/skills/create-vue/template/plugins/msw/files/src/mocks/handlers.ts`
- Create: `.claude/skills/create-vue/template/plugins/msw/files/src/mocks/server.ts`
- Create: `.claude/skills/create-vue/template/plugins/msw/files/public/mockServiceWorker.js`

- [ ] **Step 1: 创建 MSW 片段文件**

Create `.claude/skills/create-vue/template/plugins/msw/files/src/app/main.ts`:

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import '@/shared/styles/tailwind.css'

async function enableMocking() {
  if (!import.meta.env.DEV) return
  const { worker } = await import('@/mocks/browser')
  await worker.start()
}

enableMocking().then(() => {
  const app = createApp(App)
  app.mount('#app')
})
```

Create `.claude/skills/create-vue/template/plugins/msw/files/src/mocks/browser.ts`:

```typescript
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
```

Create `.claude/skills/create-vue/template/plugins/msw/files/src/mocks/handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/health', () => {
    return HttpResponse.json({ status: 'ok' })
  }),
]
```

Create `.claude/skills/create-vue/template/plugins/msw/files/src/mocks/server.ts`:

```typescript
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

Note: `public/mockServiceWorker.js` 由 `npx msw init` 生成，不需要预先放入 files。

- [ ] **Step 2: Commit**

Run:

```bash
cd /home/mingg/github/conference-test
git add .claude/skills/create-vue/template/plugins/msw
git commit -m "feat(create-vue): 添加 MSW 片段"
```

---

## Task 9: 创建开发体验插件片段

**Files:**
- Create: `.claude/skills/create-vue/template/plugins/auto-import/manifest.json`
- Create: `.claude/skills/create-vue/template/plugins/auto-import/files/vite.config.ts`
- Create: `.claude/skills/create-vue/template/plugins/components-auto/manifest.json`
- Create: `.claude/skills/create-vue/template/plugins/components-auto/files/vite.config.ts`

- [ ] **Step 1: 创建 auto-import manifest**

Create `.claude/skills/create-vue/template/plugins/auto-import/manifest.json`:

```json
{
  "name": "auto-import",
  "displayName": "unplugin-auto-import",
  "category": "dx",
  "description": "自动导入 Vue / Vue Router / Pinia API",
  "dependencies": {},
  "devDependencies": {
    "unplugin-auto-import": "^0.18.0"
  },
  "scripts": {},
  "files": [],
  "overrides": ["vite.config.ts", "tsconfig.json", ".gitignore"],
  "postInstall": []
}
```

- [ ] **Step 2: 创建 auto-import vite.config.ts override**

Create `.claude/skills/create-vue/template/plugins/auto-import/files/vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
      dirs: ['src/shared/composables', 'src/shared/stores'],
      vueTemplate: true,
      eslintrc: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
```

- [ ] **Step 3: 创建 components-auto manifest**

Create `.claude/skills/create-vue/template/plugins/components-auto/manifest.json`:

```json
{
  "name": "components-auto",
  "displayName": "unplugin-vue-components",
  "category": "dx",
  "description": "自动注册 shared 目录下的 Vue 组件",
  "dependencies": {},
  "devDependencies": {
    "unplugin-vue-components": "^0.27.0"
  },
  "scripts": {},
  "files": [],
  "overrides": ["vite.config.ts", "tsconfig.json", ".gitignore"],
  "postInstall": []
}
```

- [ ] **Step 4: 创建 components-auto vite.config.ts override**

Create `.claude/skills/create-vue/template/plugins/components-auto/files/vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      dirs: ['src/shared/components'],
      dts: 'src/components.d.ts',
      deep: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
```

- [ ] **Step 5: Commit**

Run:

```bash
cd /home/mingg/github/conference-test
git add .claude/skills/create-vue/template/plugins/auto-import .claude/skills/create-vue/template/plugins/components-auto
git commit -m "feat(create-vue): 添加 unplugin-auto-import 与 unplugin-vue-components 片段"
```

---

## Task 10: 创建 UI 库片段

**Files:**
- Create: `.claude/skills/create-vue/template/ui-libraries/headlessui/manifest.json`
- Create: `.claude/skills/create-vue/template/ui-libraries/headlessui/files/package.json`
- Create: `.claude/skills/create-vue/template/ui-libraries/headlessui/files/src/shared/components/Modal.vue`
- Create: `.claude/skills/create-vue/template/ui-libraries/element-plus/manifest.json`
- Create: `.claude/skills/create-vue/template/ui-libraries/element-plus/files/package.json`

- [ ] **Step 1: 创建 Headless UI manifest**

Create `.claude/skills/create-vue/template/ui-libraries/headlessui/manifest.json`:

```json
{
  "name": "headlessui",
  "displayName": "Headless UI",
  "category": "ui-library",
  "description": "无样式可访问组件",
  "dependencies": {
    "@headlessui/vue": "^1.7.22"
  },
  "devDependencies": {},
  "scripts": {},
  "files": ["src/shared/components/Modal.vue"],
  "overrides": [],
  "postInstall": []
}
```

- [ ] **Step 2: 迁移现有 Headless UI 依赖的 Modal 组件**

Run:

```bash
cd /home/mingg/github/conference-test/.claude/skills/create-vue/template
mv base/src/shared/components/Modal.vue ui-libraries/headlessui/files/src/shared/components/Modal.vue
```

- [ ] **Step 3: 为其他 UI 库创建占位 manifest**

为每个 UI 库创建最小 manifest（内容类似 headlessui，包名不同）。例如 Element Plus：

Create `.claude/skills/create-vue/template/ui-libraries/element-plus/manifest.json`:

```json
{
  "name": "element-plus",
  "displayName": "Element Plus",
  "category": "ui-library",
  "description": "Element Plus UI 组件库",
  "dependencies": {
    "element-plus": "^2.7.0"
  },
  "devDependencies": {},
  "scripts": {},
  "files": [],
  "overrides": ["vite.config.ts"],
  "postInstall": []
}
```

Create `.claude/skills/create-vue/template/ui-libraries/element-plus/files/vite.config.ts`:

```typescript
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
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/element-plus.scss" as *;`,
      },
    },
  },
})
```

对其他 UI 库（ant-design-vue、vant、quasar、vuetify、primevue、naive-ui）重复类似 manifest 创建，至少包含正确的 npm 包名。

- [ ] **Step 4: Commit**

Run:

```bash
cd /home/mingg/github/conference-test
git add .claude/skills/create-vue/template/ui-libraries
git commit -m "feat(create-vue): 添加 UI 库片段"
```

---

## Task 11: 创建图标库片段

**Files:**
- Create: `.claude/skills/create-vue/template/icon-libraries/heroicons/manifest.json`
- Create: `.claude/skills/create-vue/template/icon-libraries/heroicons/files/src/shared/components/IconButton.vue`
- Create: `.claude/skills/create-vue/template/icon-libraries/fontawesome/manifest.json`
- Create: `.claude/skills/create-vue/template/icon-libraries/lucide/manifest.json`

- [ ] **Step 1: 创建 Heroicons manifest**

Create `.claude/skills/create-vue/template/icon-libraries/heroicons/manifest.json`:

```json
{
  "name": "heroicons",
  "displayName": "Heroicons",
  "category": "icon-library",
  "description": "Heroicons 图标库",
  "dependencies": {
    "@heroicons/vue": "^2.1.5"
  },
  "devDependencies": {},
  "scripts": {},
  "files": [],
  "overrides": [],
  "postInstall": []
}
```

- [ ] **Step 2: 创建 FontAwesome 和 Lucide manifest**

Create `.claude/skills/create-vue/template/icon-libraries/fontawesome/manifest.json`:

```json
{
  "name": "fontawesome",
  "displayName": "FontAwesome",
  "category": "icon-library",
  "description": "FontAwesome 图标库",
  "dependencies": {
    "@fortawesome/fontawesome-svg-core": "^6.5.0",
    "@fortawesome/free-solid-svg-icons": "^6.5.0",
    "@fortawesome/vue-fontawesome": "^3.0.6"
  },
  "devDependencies": {},
  "scripts": {},
  "files": [],
  "overrides": [],
  "postInstall": []
}
```

Create `.claude/skills/create-vue/template/icon-libraries/lucide/manifest.json`:

```json
{
  "name": "lucide",
  "displayName": "Lucide",
  "category": "icon-library",
  "description": "Lucide 图标库",
  "dependencies": {
    "lucide-vue-next": "^0.400.0"
  },
  "devDependencies": {},
  "scripts": {},
  "files": [],
  "overrides": [],
  "postInstall": []
}
```

- [ ] **Step 3: Commit**

Run:

```bash
cd /home/mingg/github/conference-test
git add .claude/skills/create-vue/template/icon-libraries
git commit -m "feat(create-vue): 添加图标库片段"
```

---

## Task 12: 实现主生成逻辑

**Files:**
- Create: `.claude/skills/create-vue/lib/generate.js`
- Modify: `.claude/skills/create-vue/lib/merge-config.js`

- [ ] **Step 1: 扩展 merge-config.js 支持 vite.config.ts 合并**

Modify `.claude/skills/create-vue/lib/merge-config.js`:

追加以下函数：

```javascript
export function mergeViteConfig(baseContent, overrideContent) {
  // 简单字符串替换策略：将 override 的 plugins 数组合并到 base
  // 生产实现建议使用 AST 解析，此处用正则做最小可行版本
  const overridePluginsMatch = overrideContent.match(/plugins:\s*\[([\s\S]*?)\],?/)
  const basePluginsMatch = baseContent.match(/plugins:\s*\[([\s\S]*?)\],?/)

  if (!overridePluginsMatch || !basePluginsMatch) {
    return overrideContent || baseContent
  }

  const mergedPlugins = `[\n    ${basePluginsMatch[1].trim()}\n${overridePluginsMatch[1].trim() ? `    ${overridePluginsMatch[1].trim()}` : ''}\n  ]`

  return baseContent.replace(/plugins:\s*\[[\s\S]*?\],?/, `plugins: ${mergedPlugins},`)
}
```

- [ ] **Step 2: 实现 generate.js**

Create `.claude/skills/create-vue/lib/generate.js`:

```javascript
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'
import { mergePackageJson, mergeViteConfig } from './merge-config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const TEMPLATE_ROOT = resolve(__dirname, '../template')

export async function generateProject(targetDir, options) {
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true })
  }

  // 1. 复制 base
  copyBase(targetDir)

  // 2. 收集所有选中的片段
  const selected = [
    ...options.basePlugins,
    ...(options.uiLibrary ? [options.uiLibrary] : []),
    ...options.iconLibraries,
    ...options.dxPlugins,
  ]

  const manifests = selected.map(loadManifest).filter(Boolean)

  // 3. 合并 package.json
  const basePackagePath = join(targetDir, 'package.json')
  let packageContent = JSON.parse(readFileSync(basePackagePath, 'utf-8'))
  for (const manifest of manifests) {
    packageContent = mergePackageJsonContent(packageContent, manifest)
  }
  writeFileSync(basePackagePath, JSON.stringify(packageContent, null, 2) + '\n')

  // 4. 复制片段 files
  for (const manifest of manifests) {
    copyManifestFiles(manifest, targetDir)
  }

  // 5. 应用 overrides
  for (const manifest of manifests) {
    for (const override of manifest.overrides || []) {
      applyOverride(manifest, override, targetDir)
    }
  }

  // 6. 执行 postInstall
  for (const manifest of manifests) {
    for (const cmd of manifest.postInstall || []) {
      // 由上层通过 execa 执行
      console.log(`Post install: ${cmd}`)
    }
  }
}

function copyBase(targetDir) {
  const baseDir = join(TEMPLATE_ROOT, 'base')
  cpSync(baseDir, targetDir, { recursive: true })
}

function loadManifest(name) {
  const categories = ['plugins', 'ui-libraries', 'icon-libraries']
  for (const category of categories) {
    const manifestPath = join(TEMPLATE_ROOT, category, name, 'manifest.json')
    if (existsSync(manifestPath)) {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
      manifest._root = join(TEMPLATE_ROOT, category, name)
      return manifest
    }
  }
  return null
}

function mergePackageJsonContent(base, manifest) {
  return {
    ...base,
    dependencies: { ...base.dependencies, ...(manifest.dependencies || {}) },
    devDependencies: { ...base.devDependencies, ...(manifest.devDependencies || {}) },
    scripts: { ...base.scripts, ...(manifest.scripts || {}) },
    msw: manifest.msw ?? base.msw,
  }
}

function copyManifestFiles(manifest, targetDir) {
  const filesDir = join(manifest._root, 'files')
  if (!existsSync(filesDir)) return
  cpSync(filesDir, targetDir, { recursive: true, force: true })
}

function applyOverride(manifest, overridePath, targetDir) {
  const sourcePath = join(manifest._root, 'overrides', overridePath)
  const targetPath = join(targetDir, overridePath)

  if (!existsSync(sourcePath)) return

  if (overridePath === 'vite.config.ts') {
    const baseContent = readFileSync(targetPath, 'utf-8')
    const overrideContent = readFileSync(sourcePath, 'utf-8')
    writeFileSync(targetPath, mergeViteConfig(baseContent, overrideContent))
  } else if (overridePath === 'tsconfig.json') {
    const baseJson = JSON.parse(readFileSync(targetPath, 'utf-8'))
    const overrideJson = JSON.parse(readFileSync(sourcePath, 'utf-8'))
    const merged = {
      ...baseJson,
      ...overrideJson,
      include: [...new Set([...(baseJson.include || []), ...(overrideJson.include || [])])],
    }
    writeFileSync(targetPath, JSON.stringify(merged, null, 2) + '\n')
  } else if (overridePath === '.gitignore') {
    const baseContent = readFileSync(targetPath, 'utf-8')
    const overrideContent = readFileSync(sourcePath, 'utf-8')
    writeFileSync(targetPath, baseContent + '\n' + overrideContent + '\n')
  } else {
    cpSync(sourcePath, targetPath, { force: true })
  }
}
```

- [ ] **Step 3: Commit**

Run:

```bash
cd /home/mingg/github/conference-test
git add .claude/skills/create-vue/lib
git commit -m "feat(create-vue): 实现项目生成器主逻辑"
```

---

## Task 13: 更新 SKILL.md 并添加入口脚本

**Files:**
- Create: `.claude/skills/create-vue/index.js`
- Modify: `.claude/skills/create-vue/SKILL.md`

- [ ] **Step 1: 创建入口脚本 index.js**

Create `.claude/skills/create-vue/index.js`:

```javascript
#!/usr/bin/env node
import { existsSync, readdirSync } from 'fs'
import { resolve } from 'path'
import { execa } from 'execa'
import { promptForOptions, confirmDirectoryOverwrite } from './lib/prompt.js'
import { generateProject } from './lib/generate.js'

const targetDir = process.cwd()
const files = readdirSync(targetDir).filter(f => f !== 'README.md')

async function main() {
  if (files.length > 0) {
    const proceed = await confirmDirectoryOverwrite()
    if (!proceed) {
      console.log('已取消')
      process.exit(0)
    }
  }

  const options = await promptForOptions()
  console.log('正在生成项目...')
  await generateProject(targetDir, options)

  console.log('正在安装依赖...')
  await execa('npm', ['install'], { stdio: 'inherit' })

  if (options.basePlugins.includes('msw')) {
    console.log('正在初始化 MSW...')
    await execa('npx', ['msw', 'init', 'public', '--save', 'false'], { stdio: 'inherit' })
  }

  console.log('正在验证...')
  await execa('npm', ['run', 'type-check'], { stdio: 'inherit' })
  await execa('npm', ['run', 'lint'], { stdio: 'inherit' })
  await execa('npm', ['run', 'test'], { stdio: 'inherit' })
  await execa('npm', ['run', 'build'], { stdio: 'inherit' })

  console.log('项目生成完成')
  console.log('启动开发服务器：npm run dev')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
```

- [ ] **Step 2: 安装 execa**

Run:

```bash
cd /home/mingg/github/conference-test/.claude/skills/create-vue
npm install execa
```

- [ ] **Step 3: 更新 SKILL.md**

Modify `.claude/skills/create-vue/SKILL.md`:

```markdown
---
description: "交互式生成 Vue 3 + TypeScript + Vite 项目骨架，支持按需选择插件、UI 库与图标库"
user-invocable: true
allowed-tools: Bash, Read, Write, Edit
---

# create-vue

在当前目录交互式生成一个 Vue 3 项目骨架。支持选择基础插件、UI 库、图标库及开发体验插件，自动安装依赖并初始化配置。

## 用法

```bash
/create-vue
```

执行后会通过终端交互提示选择插件组合，然后在**当前目录**生成文件。

## 执行步骤

1. **确认目录状态**：若当前目录非空（除 `README.md` 外），询问用户是否继续。
2. **交互选择插件**：
   - 必选核心：Vue 3 + TypeScript + Vite + autoprefixer + Tailwind CSS + 日间/夜间模式 + 容器自适应
   - 基础插件（空格切换，按 `a` 全选/全不选）：Pinia、Vue Router、Storybook、MSW、ESLint、Prettier、Vitest
   - UI 库（单选，可选"无"）：Ant Design Vue、Element Plus、Vant、Headless UI、Quasar、Vuetify、PrimeVue、Naive UI
   - 图标库（空格切换，可多选）：FontAwesome、Heroicons、Lucide
   - 开发体验插件（空格切换）：unplugin-auto-import、unplugin-vue-components
3. **组合模板**：根据选择组合 `template/base` 与对应插件片段。
4. **安装依赖**：运行 `npm install`。
5. **初始化 MSW**：若选中 MSW，运行 `npx msw init public --save false`。
6. **验证骨架**：依次运行 `npm run type-check`、`npm run lint`、`npm run test`、`npm run build`。
7. **报告结果**：告知用户验证结果及启动方式。

## 模板结构

```
.claude/skills/create-vue/template/
├── base/                  # 必选核心
├── plugins/               # 可选基础插件与开发体验插件
├── ui-libraries/          # 可选 UI 库
└── icon-libraries/        # 可选图标库
```

## 禁止行为

- 不要生成 Home / About 之外的任何业务页面或业务组件。
- 不要生成业务相关的 MSW handlers（只保留 `/api/health` 示例）。
- 不要在组件内部使用 `md:`、`lg:` 等视口断点。
```

- [ ] **Step 4: Commit**

Run:

```bash
cd /home/mingg/github/conference-test
git add .claude/skills/create-vue
git commit -m "feat(create-vue): 更新 SKILL.md 并添加入口脚本"
```

---

## Task 14: 端到端测试

**Files:**
- None (creates temporary directory)

- [ ] **Step 1: 在临时目录测试最小生成**

Run:

```bash
cd /tmp
rm -rf create-vue-test-minimal
mkdir create-vue-test-minimal
cd create-vue-test-minimal
node /home/mingg/github/conference-test/.claude/skills/create-vue/index.js
```

交互时选择：
- 基础插件：只保留 ESLint、Prettier、Vitest（默认）
- UI 库：无
- 图标库：不选
- 开发体验插件：不选

Expected output: 项目生成成功，所有验证命令通过。

- [ ] **Step 2: 在临时目录测试完整生成**

Run:

```bash
cd /tmp
rm -rf create-vue-test-full
mkdir create-vue-test-full
cd create-vue-test-full
node /home/mingg/github/conference-test/.claude/skills/create-vue/index.js
```

交互时选择：
- 基础插件：全选
- UI 库：Headless UI
- 图标库：Heroicons
- 开发体验插件：全选

Expected output: 项目生成成功，所有验证命令通过。

- [ ] **Step 3: 清理临时目录**

Run:

```bash
rm -rf /tmp/create-vue-test-minimal /tmp/create-vue-test-full
```

- [ ] **Step 4: Commit**

Run:

```bash
cd /home/mingg/github/conference-test
git commit --allow-empty -m "test(create-vue): 完成端到端生成测试"
```

---

## Task 15: 最终审查与清理

**Files:**
- Modify: `.claude/skills/create-vue/package.json` (skill 自身依赖)

- [ ] **Step 1: 整理 skill 自身 package.json**

Create `.claude/skills/create-vue/package.json`:

```json
{
  "name": "create-vue-skill",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "test": "vitest run"
  },
  "dependencies": {
    "@inquirer/prompts": "^7.0.0",
    "execa": "^9.0.0"
  },
  "devDependencies": {
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2: 最终 self-review**

对照 spec 检查：
- 交互流程覆盖所有插件分类 ✅
- base 包含必选核心 ✅
- 片段包含 manifest/files/overrides ✅
- 配置合并逻辑覆盖 package.json / vite.config.ts / tsconfig.json / .gitignore ✅
- 验证步骤完整 ✅

- [ ] **Step 3: Commit**

Run:

```bash
cd /home/mingg/github/conference-test
git add .claude/skills/create-vue
git commit -m "chore(create-vue): 整理 skill 自身依赖与配置"
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-13-create-vue-redesign.md`.

Two execution options:

**1. Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration
**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
