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
