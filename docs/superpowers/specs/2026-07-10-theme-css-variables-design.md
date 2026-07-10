# 主题切换与 CSS 变量化设计文档

## 背景

当前项目使用 Tailwind 的 `slate`、`blue`、`red` 等硬编码色板，并通过 `dark:` 修饰符手动切换日间/夜间模式。`ThemeToggle.vue` 提供三个选项（浅色 / 深色 / 跟随系统）。需求要求：

1. `ThemeToggle.vue` 改为单个按钮，点击在 light / dark 之间切换；首次访问默认跟随系统，用户选择后缓存到 localStorage。
2. 颜色方案使用 CSS 变量定义两套主题色（日间 / 夜间），页面所有颜色使用 CSS 变量，并与 Tailwind CSS 结合。
3. 同步改动到 `.claude/skills/create-vue/template`，确保 skill 生成的新项目也具备相同的主题能力。

## 目标

- 主题切换体验更简洁：单按钮切换，默认跟随系统，用户选择持久化。
- 所有颜色通过语义化 CSS 变量管理，换肤只需修改变量值，不改动组件类名。
- Tailwind 类名使用语义 token（如 `bg-surface`、`text-text-muted`），避免每个组件写 `dark:` 覆盖。
- 项目骨架模板（create-vue skill template）与主项目保持一致。

## 方案

### 1. CSS 变量架构

新增 `src/shared/styles/theme.css`，在 `:root` 中定义日间变量，在 `.dark` 中覆盖为夜间变量。变量使用 RGB 分量（而非十六进制），以便 Tailwind 的透明度修饰符正常工作。

变量分为以下语义组：

| 语义组 | 说明 | 示例 token |
|---|---|---|
| 背景 | 页面、卡片、浮层背景 | `background`, `surface`, `surface-secondary`, `surface-elevated` |
| 边框 | 普通/强边框 | `border`, `border-strong` |
| 文字 | 主文本、次要文本、弱文本 | `text`, `text-secondary`, `text-muted` |
| 主色 | 按钮、链接、高亮 | `primary`, `primary-hover`, `primary-subtle`, `primary-text` |
| 危险 | 错误、删除、警告 | `danger`, `danger-hover`, `danger-subtle` |
| 遮罩 | 模态遮罩 | `overlay` |

日间示例：

```css
:root {
  --color-background: 255 255 255;
  --color-surface: 255 255 255;
  --color-surface-secondary: 241 245 249;
  --color-surface-elevated: 248 250 252;
  --color-border: 226 232 240;
  --color-border-strong: 203 213 225;
  --color-text: 15 23 42;
  --color-text-secondary: 51 65 85;
  --color-text-muted: 100 116 139;
  --color-primary: 37 99 235;
  --color-primary-hover: 29 78 216;
  --color-primary-subtle: 219 234 254;
  --color-primary-text: 255 255 255;
  --color-danger: 220 38 38;
  --color-danger-hover: 185 28 28;
  --color-danger-subtle: 254 226 226;
  --color-overlay: 0 0 0;
}
```

夜间示例：

```css
.dark {
  --color-background: 2 6 23;
  --color-surface: 30 41 59;
  --color-surface-secondary: 30 41 59;
  --color-surface-elevated: 51 65 85;
  --color-border: 51 65 85;
  --color-border-strong: 71 85 105;
  --color-text: 248 250 252;
  --color-text-secondary: 226 232 240;
  --color-text-muted: 148 163 184;
  --color-primary: 59 130 246;
  --color-primary-hover: 96 165 250;
  --color-primary-subtle: 30 58 138;
  --color-primary-text: 255 255 255;
  --color-danger: 248 113 113;
  --color-danger-hover: 252 165 165;
  --color-danger-subtle: 127 29 29;
  --color-overlay: 0 0 0;
}
```

### 2. Tailwind 集成

在 `tailwind.config.ts` 中扩展语义化颜色，引用上述 CSS 变量：

```ts
colors: {
  background: 'rgb(var(--color-background) / <alpha-value>)',
  surface: {
    DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
    secondary: 'rgb(var(--color-surface-secondary) / <alpha-value>)',
    elevated: 'rgb(var(--color-surface-elevated) / <alpha-value>)',
  },
  border: {
    DEFAULT: 'rgb(var(--color-border) / <alpha-value>)',
    strong: 'rgb(var(--color-border-strong) / <alpha-value>)',
  },
  text: {
    DEFAULT: 'rgb(var(--color-text) / <alpha-value>)',
    secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
    muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
  },
  primary: {
    DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
    hover: 'rgb(var(--color-primary-hover) / <alpha-value>)',
    subtle: 'rgb(var(--color-primary-subtle) / <alpha-value>)',
    text: 'rgb(var(--color-primary-text) / <alpha-value>)',
  },
  danger: {
    DEFAULT: 'rgb(var(--color-danger) / <alpha-value>)',
    hover: 'rgb(var(--color-danger-hover) / <alpha-value>)',
    subtle: 'rgb(var(--color-danger-subtle) / <alpha-value>)',
  },
  overlay: 'rgb(var(--color-overlay) / <alpha-value>)',
}
```

在 `src/shared/styles/tailwind.css` 中通过 `@import './theme.css';` 引入主题变量。

### 3. ThemeToggle.vue 改造

改为单个图标按钮：

- 使用 `SunIcon` 和 `MoonIcon`。
- 根据 `resolvedTheme` 显示对应图标：light 显示太阳，dark 显示月亮。
- 点击调用 `themeStore.toggleTheme()`，在 light / dark 间切换。
- 按钮使用语义化类名，如 `bg-surface-secondary text-text hover:text-text-secondary`。
- 保留 `aria-label` 和 `aria-pressed`。

### 4. themeStore.ts 改造

- 保留 `Theme = 'system' | 'light' | 'dark'` 类型，但切换按钮只产出 `'light'` 或 `'dark'`。
- 新增 `toggleTheme()`：
  - 若当前 `resolvedTheme` 为 `'dark'`，则 `setTheme('light')`。
  - 否则 `setTheme('dark')`。
  - 保存到 localStorage。
- `initTheme()` 逻辑保持：
  - 从 localStorage 读取缓存值，无则 `'system'`。
  - 初始化系统主题监听。
  - 应用当前 resolved 主题到 DOM。
- `setTheme('system')` 保留，但不再由切换按钮调用，可通过其他入口（如设置页）使用。

### 5. 组件类名迁移策略

将 `src/**/*.vue` 和 `src/**/*.css` 中的硬编码颜色类名替换为语义 token。映射规则示例：

| 原类名 | 新类名 |
|---|---|
| `bg-white dark:bg-slate-900` | `bg-background` |
| `bg-slate-50 dark:bg-slate-950` | `bg-surface-elevated` |
| `bg-slate-100 dark:bg-slate-800` | `bg-surface-secondary` |
| `bg-slate-800 dark:bg-slate-700` | `bg-surface`（视场景） |
| `text-slate-900 dark:text-slate-100` | `text-text` |
| `text-slate-700 dark:text-slate-200` | `text-text-secondary` |
| `text-slate-500 dark:text-slate-400` | `text-text-muted` |
| `border-slate-200 dark:border-slate-700` | `border-border` |
| `border-slate-300 dark:border-slate-700` | `border-border-strong` |
| `bg-primary-600 dark:bg-primary-600` | `bg-primary` |
| `text-primary-700 dark:text-primary-300` | `text-primary` |
| `bg-primary-100 dark:bg-primary-900` | `bg-primary-subtle` |
| `bg-red-600 dark:bg-red-600` | `bg-danger` |
| `bg-red-100 dark:bg-red-900` | `bg-danger-subtle` |
| `bg-black/50` | `bg-overlay/50` |

对于组件内部固定不随主题变化的颜色（如 `VideoTile` 的视频占位黑底），可保留原色或引入专用 token，但本次改造统一纳入变量体系。

### 6. 测试调整

现有测试通过类名断言颜色（如 `expect(...).toContain('bg-primary-600')`）。改造后类名变为语义 token，需要同步更新断言：

- `Button.spec.ts`：`bg-primary-600` → `bg-primary`，`bg-red-600` → `bg-danger`。
- `IconButton.spec.ts`：`text-slate-600` → `text-text-secondary`，`bg-primary-100` / `text-primary-700` → `bg-primary-subtle` / `text-primary`。
- `Input.spec.ts`：`border-slate-300` → `border-border`。
- `Modal.spec.ts`：`bg-black/50` → `bg-overlay/50`。
- 新增 `ThemeToggle.spec.ts` 覆盖单按钮切换行为。

### 7. create-vue skill template 同步

`.claude/skills/create-vue/template` 是项目骨架模板，包含与主题相关的核心文件：

- `src/shared/components/ThemeToggle.vue`
- `src/shared/stores/themeStore.ts`
- `src/shared/composables/useTheme.ts`
- `src/shared/styles/tailwind.css`
- `tailwind.config.ts`
- `src/shared/components/AppShell.vue`
- `src/shared/components/Button.vue`
- `src/shared/components/Input.vue`
- `src/shared/components/Modal.vue`
- `src/shared/components/IconButton.vue`

同步策略：

1. 在主项目完成改造并通过测试后，将上述文件同步到 template 对应路径。
2. 若 template 中不存在某些新增文件（如 `src/shared/styles/theme.css`），则新增。
3. 保持 template 的 package.json、依赖与主项目一致，确保 `@tailwindcss/container-queries` 等插件已配置。
4. 不迁移 template 中不存在的 feature 页面（如 `features/home`、`features/meeting-room` 等），只同步共享层与主题直接相关的文件。

## 验收标准

- [ ] `ThemeToggle.vue` 为单个图标按钮，点击切换 light/dark，图标随当前主题变化。
- [ ] 首次访问无缓存时默认跟随系统；用户点击后写入 localStorage，后续读取该值。
- [ ] 页面所有颜色均通过 CSS 变量提供，日间/夜间变量在 `:root` / `.dark` 中定义。
- [ ] Tailwind 配置使用语义化颜色引用 CSS 变量。
- [ ] 所有 Vue 组件和 CSS 中的硬编码 `slate-*`、`primary-*`、`red-*`、`bg-black/50` 等替换为语义 token。
- [ ] 现有测试通过，且断言类名已同步更新。
- [ ] `create-vue` skill template 的对应文件已同步。

## 风险与注意事项

- 颜色类名全量替换改动面较广，需逐文件检查，避免遗漏导致夜间模式异常。
- 部分组件（如 `DevicePreview.vue` 的黑底视频区域）原色可能不应随主题变化，需根据业务语义判断是否保留固定色。
- Tailwind v3 的 CSS 变量颜色需使用 RGB 分量形式，否则 `bg-primary/50` 等透明度类失效。
- 需确保 `theme.css` 在 `tailwind.css` 中正确引入，否则 Tailwind 编译出的 CSS 会引用未定义变量。
