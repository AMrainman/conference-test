---
description: "交互式生成 Vue 3 + TypeScript + Vite 项目骨架，支持按需选择插件、UI 库与图标库"
user-invocable: true
allowed-tools: Bash, Read, Write, Edit, AskUserQuestion
---

# create-vue

在当前目录生成一个 Vue 3 项目骨架。先由 Claude 通过 `AskUserQuestion` 一次性确认插件组合，再调用生成脚本创建文件、安装依赖并验证。

## 用法

```bash
/create-vue
```

## 执行步骤

1. **确认目录状态**：若当前目录非空（除 `README.md` 外），询问用户是否继续。
2. **询问插件组合**（每类一个问题，全部选项一次展示）：
   - 基础插件（多选）：Pinia、Vue Router、Storybook、MSW、ESLint、Prettier、Vitest
   - UI 库（单选，含"无"）：Ant Design Vue、Element Plus、Vant、Headless UI、Quasar、Vuetify、PrimeVue、Naive UI
   - 图标库（多选）：FontAwesome、Heroicons、Lucide
   - 开发体验插件（多选）：unplugin-auto-import、unplugin-vue-components
3. **生成项目**：将选项写入临时 JSON，调用 `node .claude/skills/create-vue/index.js --options <json>`。
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
