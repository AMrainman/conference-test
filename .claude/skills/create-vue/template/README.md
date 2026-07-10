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
