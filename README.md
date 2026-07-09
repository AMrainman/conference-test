# Conference UI Skeleton

基于 Vue 3 + TypeScript + Vite + Tailwind CSS + Storybook + MSW 的会议系统前端 UI 骨架。

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
- `npm run storybook`：启动 Storybook
- `npm run build-storybook`：构建 Storybook 静态站点

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
