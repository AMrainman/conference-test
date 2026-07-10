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
