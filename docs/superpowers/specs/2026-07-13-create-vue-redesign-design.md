# create-vue skill 交互式插件选择 redesign 设计文档

## 1. 目标

将现有 `create-vue` skill 从固定模板改造为**交互式插件选择**生成器：

- 用户执行 `/create-vue` 后，通过终端交互选择插件组合。
- skill 根据选择动态组合项目骨架，安装依赖并初始化配置。
- 保留当前项目的核心约定：容器自适应、日间/夜间模式、Vue 3 + TypeScript + Vite。

## 2. 交互流程

执行 `/create-vue` 后：

1. **目录检查**：若当前目录非空（除 `README.md` 外），询问用户是否继续。
2. **插件选择面板**：分类展示选项，终端交互选择。
3. **生成项目**：组合 `base` 模板与所选插件片段。
4. **安装依赖**：运行 `npm install`。
5. **初始化 MSW**：若选中 MSW，运行 `npx msw init public --save false`。
6. **验证骨架**：依次运行 `npm run type-check`、`npm run lint`、`npm run test`、`npm run build`。
7. **报告结果**：告知用户验证结果及启动方式。

## 3. 插件分类与默认状态

### 3.1 必选核心（不可取消）

| 项目 | 说明 |
| --- | --- |
| Vue 3 | 核心框架 |
| TypeScript | 类型系统 |
| Vite | 构建工具 |
| autoprefixer | CSS 后处理 |
| Tailwind CSS | 原子 CSS，含 `@tailwindcss/container-queries` 插件 |
| 日间/夜间模式 | themeStore + theme.css + ThemeToggle |
| 容器自适应 | `.claude/rules/container-design.md` + 容器查询使用约定 |

### 3.2 基础插件（空格切换，按 `a` 全选/全不选）

| 插件 | 默认选中 | 说明 |
| --- | --- | --- |
| Pinia | 否 | 状态管理 |
| Vue Router | 否 | 路由 |
| Storybook | 否 | 组件文档与测试 |
| MSW | 否 | Mock Service Worker，需初始化 worker |
| ESLint | 是 | 代码检查 |
| Prettier | 是 | 代码格式化 |
| Vitest | 是 | 单元测试 |

### 3.3 UI 库（单选，可选"无"）

| UI 库 | 默认 |
| --- | --- |
| 无 | 是 |
| Ant Design Vue | 否 |
| Element Plus | 否 |
| Vant | 否 |
| Headless UI | 否 |
| Quasar | 否 |
| Vuetify | 否 |
| PrimeVue | 否 |
| Naive UI | 否 |

选择 UI 库后，基础共享组件保持纯 Tailwind 实现，UI 库片段提供额外示例组件或覆盖说明。

### 3.4 图标库（空格切换，可多选，按 `a` 全选/全不选）

| 图标库 | 默认 |
| --- | --- |
| FontAwesome | 否 |
| Heroicons | 否 |
| Lucide | 否 |

### 3.5 开发体验插件（空格切换）

| 插件 | 默认 |
| --- | --- |
| unplugin-auto-import | 否 |
| unplugin-vue-components | 否 |

## 4. 模板组织结构

```
.claude/skills/create-vue/template/
├── base/                              # 必选核心
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── postcss.config.js
│   ├── tailwind.config.ts
│   ├── index.html
│   ├── .gitignore
│   ├── .gitattributes
│   ├── .npmrc
│   ├── CLAUDE.md
│   ├── README.md
│   ├── .claude/rules/container-design.md
│   ├── src/app/App.vue
│   ├── src/app/main.ts
│   ├── src/app/router.ts
│   ├── src/features/home/views/HomeView.vue
│   ├── src/features/about/views/AboutView.vue
│   ├── src/shared/components/AppShell.vue
│   ├── src/shared/components/Button.vue
│   ├── src/shared/components/IconButton.vue
│   ├── src/shared/components/Input.vue
│   ├── src/shared/components/Modal.vue
│   ├── src/shared/components/ThemeToggle.vue
│   ├── src/shared/composables/useTheme.ts
│   ├── src/shared/stores/themeStore.ts
│   ├── src/shared/styles/tailwind.css
│   ├── src/shared/styles/theme.css
│   ├── src/shared/types/index.ts
│   └── src/vite-env.d.ts
├── plugins/
│   ├── pinia/
│   ├── vue-router/
│   ├── storybook/
│   ├── msw/
│   ├── eslint/
│   ├── prettier/
│   ├── vitest/
│   ├── auto-import/
│   └── components-auto/
├── ui-libraries/
│   ├── headlessui/
│   ├── ant-design-vue/
│   ├── element-plus/
│   ├── vant/
│   ├── quasar/
│   ├── vuetify/
│   ├── primevue/
│   └── naive-ui/
└── icon-libraries/
    ├── fontawesome/
    ├── heroicons/
    └── lucide/
```

每个片段目录结构：

```
plugins/<name>/
├── manifest.json          # 依赖、scripts、合并规则、前置条件
├── files/                 # 需要复制到目标项目的完整文件
└── overrides/             # 需要覆盖或合并到 base 配置的文件
```

## 5. 配置动态合并规则

### 5.1 package.json

合并策略：

- `dependencies`：追加片段声明的依赖。
- `devDependencies`：追加片段声明的 devDependencies。
- `scripts`：追加片段声明的 scripts；同名脚本以片段为准或报错。
- `msw.workerDirectory`：选中 MSW 时添加。

### 5.2 vite.config.ts

- 追加插件导入。
- 根据选择追加 `AutoImport`、`Components`、UI 库 Vite 插件等。
- 保留 `@ -> src` 别名。

### 5.3 tsconfig.json

- 追加 `include` 中的自动生成声明文件（如 `src/**/*.d.ts`）。
- 根据 UI 库需要调整 `compilerOptions.jsx` 或 `types`。

### 5.4 tailwind.config.ts

- 保留当前项目的色板 token（background、surface、border、text、primary、success、warning、danger、overlay 等）。
- 保留 `@tailwindcss/container-queries` 插件。
- 根据 UI 库需要扩展 `content` 或 `plugins`。

### 5.5 eslint.config.js / .prettierrc

- 仅当用户选中 ESLint / Prettier 时生成。
- 规则对齐参考项目：关闭 `vue/no-v-html`，`no-console` 在生产环境 warn。

### 5.6 .gitignore

根据选择追加：

```
# MSW
public/mockServiceWorker.js   # 若选中 MSW，提交到仓库，不忽略

# Storybook
storybook-static
*storybook.log

# auto-import / components 自动生成声明
src/auto-imports.d.ts
src/components.d.ts

# 通用
dist/
node_modules/
.env
.env.*
```

### 5.7 src 结构

- `base` 提供纯 Tailwind 共享组件。
- UI 库片段提供示例组件或覆盖说明，不破坏 base 组件。
- 图标库片段提供示例用法和依赖。

## 6. 交互实现方式

使用 Node.js 脚本实现终端交互：

- 工具：`@inquirer/prompts` 或自研简单选择器。
- 支持：
  - 空格切换单个选项。
  - `a` 键切换当前列表全选/全不选。
  - 方向键上下移动。
  - Enter 确认。
- 基础插件区显示分组标题和提示信息。

交互脚本路径：`.claude/skills/create-vue/lib/prompt.js`

## 7. 依赖版本策略

所有插件默认安装**当前较新稳定版本**。具体版本号集中维护在片段 `manifest.json` 中，便于统一升级。

## 8. 验证步骤

生成项目后执行：

```bash
npm run type-check
npm run lint
npm run test
npm run build
```

任一失败时向用户报告具体错误，不自动重试。

## 9. 边界情况

| 场景 | 处理 |
| --- | --- |
| 目录非空 | 询问是否覆盖/继续，用户确认后再生成。 |
| 未选任何 UI 库 | 使用 base 纯 Tailwind 组件。 |
| 未选任何图标库 | 组件中不使用图标。 |
| 选择冲突 | 如 UI 库与 Tailwind 插件冲突，在 manifest 中声明冲突规则。 |
| WSL 环境 | 不限制 install/build 命令，由 skill 自行判断环境。 |

## 10. 与参考项目的差异统一

| 项目 | 当前 template | 参考项目 | 处理方式 |
| --- | --- | --- | --- |
| unplugin-auto-import | 无 | 有 | 新增为可选开发体验插件 |
| unplugin-vue-components | 无 | 有 | 新增为可选开发体验插件 |
| Tailwind 色板 | 缺少 success/warning | 完整 | 统一补齐完整色板 |
| ESLint `no-console` | error | 生产 warn | 统一为生产 warn |
| ESLint `vue/no-v-html` | 未关闭 | off | 统一关闭 |
| .gitattributes | 有 | 有 | 保留 |

## 11. 后续可扩展

- 支持保存用户默认选择到 `~/.claude/create-vue.preferences.json`。
- 支持通过命令参数跳过交互直接生成（如 `/create-vue --preset=minimal`）。
- 支持插件模板版本锁定文件。
