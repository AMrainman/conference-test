---
description: "生成 Vue 3 + TypeScript + Vite 项目骨架，支持按需选择插件、UI 库与图标库"
user-invocable: true
allowed-tools: Bash, Read, Write, Edit, AskUserQuestion
---

# create-vue

在当前目录生成一个 Vue 3 项目骨架。使用 `AskUserQuestion` 分组合收集用户选择的插件，然后调用生成脚本。

## 用法

```bash
/create-vue
```

## 执行步骤

1. **检查目录状态**：用 Bash 执行 `ls -la` 查看当前目录。若目录非空（除 `README.md` 外），向用户说明情况并等待用户决定是否继续。
2. **收集插件组合**：使用 `AskUserQuestion` 工具分组合收集用户选择。

   **调用格式要求**：
   - 每次只能调用 `AskUserQuestion` 一次；若问题多可拆成多次调用。
   - 顶层参数只能是 `questions` 数组，**不能**传顶层 `question`。
   - 数组内每个对象必须包含四个字段：`question`（问题文本）、`header`（短标签）、`multiSelect`（是否多选）、`options`（选项数组）。
   - 每个 `options` 元素为 `{ label: '显示名称', description: '简短说明' }`。

   **示例（基础插件 1/2）**：

   ```json
   {
     "questions": [
       {
         "question": "请选择要安装的基础插件（1/2）",
         "header": "基础插件",
         "multiSelect": true,
         "options": [
           { "label": "Vue Router", "description": "vue-router" },
           { "label": "Storybook", "description": "storybook" },
           { "label": "MSW", "description": "msw" }
         ]
       }
     ]
   }
   ```

   **需要询问的分组**（每组一个问题，可多选，不选表示该组不安装任何插件）：

   - 基础插件（1/2）：Vue Router、Storybook、MSW
   - 基础插件（2/2）：ESLint、Prettier、Vitest
   - UI 库（1/2）：Ant Design Vue、Element Plus、Vant、Headless UI
   - UI 库（2/2）：Quasar、Vuetify、PrimeVue、Naive UI
   - 图标库：FontAwesome、Heroicons、Lucide
   - 开发体验插件：unplugin-auto-import、unplugin-vue-components

3. **解析选项**：将用户选择映射为：
   - `basePlugins`: 字符串数组
   - `uiLibraries`: 字符串数组（可多选）
   - `iconLibraries`: 字符串数组
   - `dxPlugins`: 字符串数组
4. **向用户确认**：以文本形式列出解析后的配置，例如：
   "将生成以下配置：基础插件 [Vue Router, ESLint, Prettier, Vitest]，UI 库 [Element Plus]，图标库 [Heroicons]，开发体验插件 [unplugin-auto-import]。确认请回复 y，修改请直接说明。"
5. **生成项目**：用户确认后，调用 Bash：
   ```bash
   node .claude/skills/create-vue/index.js --options '<json>'
   ```
   其中 `<json>` 是步骤 3 构造的 JSON 字符串。
6. **报告结果**：生成完成后告知用户项目骨架已生成，并提示手动执行 `npm install` 与 `npm run dev`。

## 选项 JSON 示例

```json
{
  "basePlugins": ["vue-router", "eslint", "prettier", "vitest"],
  "uiLibraries": ["element-plus"],
  "iconLibraries": ["heroicons"],
  "dxPlugins": ["auto-import", "components-auto"]
}
```

## 插件 value 对照表

| 显示名称 | value |
|---|---|
| Vue Router | `vue-router` |
| Storybook | `storybook` |
| MSW | `msw` |
| ESLint | `eslint` |
| Prettier | `prettier` |
| Vitest | `vitest` |
| Ant Design Vue | `ant-design-vue` |
| Element Plus | `element-plus` |
| Vant | `vant` |
| Headless UI | `headlessui` |
| Quasar | `quasar` |
| Vuetify | `vuetify` |
| PrimeVue | `primevue` |
| Naive UI | `naive-ui` |
| FontAwesome | `fontawesome` |
| Heroicons | `heroicons` |
| Lucide | `lucide` |
| unplugin-auto-import | `auto-import` |
| unplugin-vue-components | `components-auto` |

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
