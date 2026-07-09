# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

会议系统前端 UI 骨架，基于 Vue 3 + Pinia + TypeScript + Vite + Tailwind CSS + headlessui + Storybook + MSW。

## 目录结构

- `src/app/` — 应用入口与全局路由
  - `main.ts` 负责启动 MSW worker、挂载 Pinia/Vue Router、初始化主题
  - `router.ts` 定义页面路由，所有视图按功能域懒加载
  - `App.vue` 应用级 Error Boundary
- `src/features/` — 按业务功能组织，每个功能包含 `components/` 和 `views/`
  - `home`、`join`、`pre-meeting`、`waiting-room`、`meeting-room`、`meeting-ended`
- `src/shared/` — 跨功能复用
  - `components/` 通用 UI 组件
  - `stores/` Pinia store（themeStore、meetingStore、uiStore）
  - `composables/` 通用组合式函数
  - `types/` 全局 TypeScript 类型
  - `styles/` 全局样式
- `src/mocks/` — MSW mock
  - `browser.ts` 开发环境 worker
  - `handlers.ts` REST API handlers
  - `socket.ts` WebSocket mock
  - `data/` mock 数据与辅助函数

## 关键约定

### 容器自适应

- 组件内部**严禁**使用 `md:`、`lg:` 等视口断点。
- 响应式组件必须由外层容器声明 `@container`，内部元素使用 `@md:`、`@sm:` 等容器断点。
- 页面级骨架布局可酌情使用媒体查询。
- 容器断点定义见 `.claude/rules/container-design.md`。

### 日间/夜间模式

- Tailwind 配置 `darkMode: 'class'`，主题类挂载在 `document.documentElement`。
- 默认跟随系统偏好；用户手动切换后读取 `localStorage` 记忆值。
- 所有颜色 token 必须通过 `dark:` 修饰符或扩展主题配置提供暗色版本。
- 不要直接操作 DOM 切换主题，统一通过 `themeStore.setTheme()`。

### MSW Mock

- 开发环境自动注册 MSW worker，无需手动启动 mock 服务。
- REST handlers 放在 `src/mocks/handlers.ts`。
- Storybook 在 `.storybook/preview.ts` 中全局加载 MSW，单个 story 可通过 `parameters.msw.handlers` 覆盖。
- 测试环境在 `vitest.setup.ts` 中启用 `msw/server`。
- `public/mockServiceWorker.js` 由 MSW 生成，必须提交到仓库。

### 状态管理

- `themeStore`：主题状态与系统主题监听，提供 `initTheme()` / `setTheme()` / `cleanup()`。
- `meetingStore`：当前会议、参会者、本地媒体状态、聊天消息；REST API 响应已做运行时形状校验。
- `uiStore`：侧边栏开关与当前标签。

### 路由

```text
/                    -> 首页 / 会议列表
/join                -> 加入或新建会议
/pre-meeting/:id     -> 会前设备检测
/waiting/:id         -> 等候室
/meeting/:id         -> 会议中
/ended/:id           -> 会议结束页
*                    -> 404
```

### 代码规范

- 生产代码中**禁止**使用 `console.log`。
- 优先使用命名导出。
- 组件文件使用 PascalCase，工具函数使用 camelCase。
- 错误处理：异步操作必须有 catch；关键业务提供降级 UI。
