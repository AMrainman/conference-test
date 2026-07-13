---
description: "生成 Vue 3 + TypeScript + Vite 项目骨架，支持按需选择插件、UI 库与图标库"
user-invocable: true
allowed-tools: Bash, Read, Write, Edit
---

# create-vue

在当前目录生成一个 Vue 3 项目骨架。通过文本对话收集用户想要的插件组合，然后调用生成脚本。

## 用法

```bash
/create-vue
```

## 执行步骤

1. **检查目录状态**：用 Bash 执行 `ls -la` 查看当前目录。若目录非空（除 `README.md` 外），向用户说明情况并等待用户决定是否继续。
2. **列出可选插件**：向用户发送一段文本，列出全部可选插件（如下）。**不要**使用 AskUserQuestion 等多选工具。

   ```
   可选插件：
   - 基础插件（可多选）：Pinia、Vue Router、Storybook、MSW、ESLint、Prettier、Vitest
   - UI 库（单选，可不选）：Ant Design Vue、Element Plus、Vant、Headless UI、Quasar、Vuetify、PrimeVue、Naive UI
   - 图标库（可多选）：FontAwesome、Heroicons、Lucide
   - 开发体验插件（可多选）：unplugin-auto-import、unplugin-vue-components

   请直接回复你想要的插件，例如：
   "Pinia + Vue Router + Element Plus + Heroicons + unplugin-auto-import"
   或 "全部基础插件 + Headless UI"
   或 "最小化，不要任何可选插件"
   ```

3. **解析用户选择**：根据用户回复，从 `lib/choices.js` 中匹配插件 value，构造选项对象：
   - `basePlugins`: 字符串数组
   - `uiLibrary`: 字符串或 `null`
   - `iconLibraries`: 字符串数组
   - `dxPlugins`: 字符串数组
4. **向用户确认**：以文本形式列出解析后的配置，例如：
   "将生成以下配置：基础插件 [Pinia, Vue Router, ESLint, Prettier, Vitest]，UI 库 [Element Plus]，图标库 [Heroicons]，开发体验插件 [unplugin-auto-import]。确认请回复 y，修改请直接回复新的插件组合。"
5. **生成项目**：用户确认后，调用 Bash：
   ```bash
   node .claude/skills/create-vue/index.js --options '<json>'
   ```
   其中 `<json>` 是步骤 3 构造的 JSON 字符串。
6. **报告结果**：脚本会自动安装依赖、初始化 MSW（如选中）、运行验证。生成完成后告知用户结果。

## 选项 JSON 示例

```json
{
  "basePlugins": ["pinia", "vue-router", "eslint", "prettier", "vitest"],
  "uiLibrary": "element-plus",
  "iconLibraries": ["heroicons"],
  "dxPlugins": ["auto-import", "components-auto"]
}
```

## 插件 value 对照表

| 显示名称 | value |
|---|---|
| Pinia | `pinia` |
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
- **不要**使用 `AskUserQuestion` 等多选工具来收集插件组合。
