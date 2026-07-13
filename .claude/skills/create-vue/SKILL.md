---
description: "交互式生成 Vue 3 + TypeScript + Vite 项目骨架，支持按需选择插件、UI 库与图标库"
user-invocable: true
allowed-tools: Bash, Read, Write, Edit, AskUserQuestion
---

# create-vue

在当前目录生成一个 Vue 3 项目骨架。Claude 先列出全部可选插件，由用户用自然语言或列表一次性指定，确认后调用生成脚本。

## 用法

```bash
/create-vue
```

## 执行步骤

1. **确认目录状态**：若当前目录非空（除 `README.md` 外），使用 `AskUserQuestion` 询问是否继续。
2. **展示全部可选插件**（一次性文本列出，不分页）：
   - 基础插件（多选）：Pinia、Vue Router、Storybook、MSW、ESLint、Prettier、Vitest
   - UI 库（单选，可选"无"）：无、Ant Design Vue、Element Plus、Vant、Headless UI、Quasar、Vuetify、PrimeVue、Naive UI
   - 图标库（多选）：FontAwesome、Heroicons、Lucide
   - 开发体验插件（多选）：unplugin-auto-import、unplugin-vue-components
3. **收集用户选择**：请用户以自然语言或列表形式回复想要的插件，例如 "Pinia + Vue Router + Element Plus" 或 "全选"。
4. **映射到选项**：根据用户回复，从 `lib/choices.js` 中解析出对应的 `basePlugins`、`uiLibrary`、`iconLibraries`、`dxPlugins`。
5. **确认配置**：用 `AskUserQuestion` 展示解析结果，用户选择"确认生成"或"取消"。
6. **生成项目**：调用 `node .claude/skills/create-vue/index.js --options '<json>'`。
7. **安装依赖**：运行 `npm install`。
8. **初始化 MSW**：若选中 MSW，运行 `npx msw init public --save false`。
9. **验证骨架**：依次运行 `npm run type-check`、`npm run lint`、`npm run test`、`npm run build`。
10. **报告结果**：告知用户验证结果及启动方式。

## 选项 JSON 格式

```json
{
  "basePlugins": ["pinia", "vue-router", "eslint", "prettier", "vitest"],
  "uiLibrary": "element-plus",
  "iconLibraries": ["heroicons"],
  "dxPlugins": ["auto-import", "components-auto"]
}
```

- `basePlugins` 为数组，可包含：`pinia`、`vue-router`、`storybook`、`msw`、`eslint`、`prettier`、`vitest`
- `uiLibrary` 为字符串或 `null`，可选值：`null`、`ant-design-vue`、`element-plus`、`vant`、`headlessui`、`quasar`、`vuetify`、`primevue`、`naive-ui`
- `iconLibraries` 为数组，可包含：`fontawesome`、`heroicons`、`lucide`
- `dxPlugins` 为数组，可包含：`auto-import`、`components-auto`

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
