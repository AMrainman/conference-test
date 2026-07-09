# 会议系统前端 UI 骨架设计文档

> 日期：2026-07-09  
> 主题：基于 Vue 3 + TypeScript + Vite + Tailwind CSS + Storybook 的会议系统前端骨架

---

## 1. 项目背景与目标

构建一个类似腾讯会议的会议系统前端 UI 骨架。本次范围限定为**纯前端 UI 骨架**，不集成 WebRTC、信令服务或后端接口，但保留清晰的扩展接口，便于后续替换为真实能力。

核心目标：
- 搭好可运行的工程骨架，开箱即用的开发体验。
- 统一容器自适应响应式方案，禁止组件内部滥用视口断点。
- 支持日间/夜间模式切换，并提供 Storybook 级别的主题调试能力。
- 按业务域组织代码，控制骨架阶段的复杂度，避免过度设计。

---

## 2. 技术栈

| 类别 | 选型 | 说明 |
|---|---|---|
| 构建工具 | Vite 6 | 快速冷启动、原生 ESM、Vue 官方推荐 |
| 框架 | Vue 3.5 | Composition API + `<script setup>` |
| 语言 | TypeScript 5 | 严格模式，所有组件与 store 均提供类型 |
| 路由 | Vue Router 4 | `createWebHistory` 模式 |
| 状态管理 | Pinia | setup store 写法 |
| 样式 | Tailwind CSS | 配合 `@tailwindcss/container-queries` 插件 |
| 无样式交互库 | Headless UI (Vue) / Radix Vue primitive | 仅取交互行为，样式完全自定义 |
| 组件文档 | Storybook 8 | 覆盖全部核心组件，支持主题切换 |
| 测试 | Vitest + `@vue/test-utils` | 单元/组件测试 |
| 类型检查 | `vue-tsc --noEmit` | 作为提交前/CI 检查 |

浏览器兼容目标：**现代浏览器最新 2 个版本**（Chrome、Edge、Safari、Firefox），原生支持 CSS 容器查询，无需 polyfill。

---

## 3. 目录结构

采用**按业务域分模块（Feature-based）** 结构：

```
conference-test/
├── .storybook/                    # Storybook 配置
│   ├── main.ts
│   ├── preview.ts
│   └── preview-body.html
├── docs/
│   └── superpowers/specs/         # 设计文档
│       └── 2026-07-09-conference-ui-design.md
├── public/
├── src/
│   ├── app/                       # 应用入口
│   │   ├── App.vue
│   │   ├── main.ts
│   │   └── router.ts
│   ├── features/                  # 业务模块
│   │   ├── home/                  # 首页 / 会议列表
│   │   ├── join/                  # 新建 / 加入会议
│   │   ├── pre-meeting/           # 会前设置
│   │   ├── waiting-room/          # 等候室
│   │   ├── meeting-room/          # 会议中
│   │   └── meeting-ended/         # 结束页
│   ├── shared/                    # 共享层
│   │   ├── components/            # 通用 UI 组件
│   │   ├── composables/           # 通用组合式函数
│   │   ├── stores/                # 全局 store
│   │   ├── styles/                # Tailwind 入口与全局样式
│   │   ├── types/                 # 全局类型
│   │   └── utils/                 # 工具函数
│   └── vite-env.d.ts
├── container-design.md            # 容器查询开发规范
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

每个 feature 内部推荐结构：

```
features/meeting-room/
├── components/        # 本 feature 专用组件
├── views/             # 页面级组件
├── stores/            # feature 级 store（可选）
├── composables/       # feature 级组合式函数（可选）
├── types.ts           # feature 级类型
└── index.ts           # 对外暴露的公开 API
```

---

## 4. 页面清单

| 页面 | 路由 | 说明 |
|---|---|---|
| 首页 / 会议列表 | `/` | 展示历史会议、快速加入入口 |
| 新建/加入会议 | `/join` 或弹窗 | 输入会议号、设置入会名称 |
| 会前设置 | `/pre-meeting/:meetingId` | 摄像头/麦克风预览、设备选择 |
| 等候室 | `/waiting/:meetingId` | 等待主持人准入 |
| 会议中 | `/meeting/:meetingId` | 核心会议界面 |
| 会议结束 | `/ended/:meetingId` | 结束摘要、评分 |
| 404 | `/:pathMatch(.*)*` | 未匹配路由 |

---

## 5. 组件设计

### 5.1 Shared 组件

| 组件 | 职责 | Storybook |
|---|---|---|
| `AppShell` | 页面级容器，提供最小高度、主题背景、字体基础 | ✅ |
| `ThemeToggle` | 日间/夜间切换按钮 | ✅ |
| `Button` | 主按钮、次按钮、危险按钮 | ✅ |
| `IconButton` | 图标按钮，用于工具栏 | ✅ |
| `Modal` / `Dialog` | 弹窗，基于 Headless UI Dialog | ✅ |
| `Input` | 文本输入框 | ✅ |
| `Avatar` | 用户头像，含 fallback 文字 | ✅ |
| `VideoTile` | 单个视频占位格子，显示姓名、麦克风状态 | ✅ |
| `Toolbar` | 底部工具栏容器 | ✅ |
| `Sidebar` | 可滑出侧边栏（参会者/聊天） | ✅ |
| `MeetingHeader` | 会议信息栏 | ✅ |

### 5.2 Feature 组件

- `features/home`: `MeetingList`、`MeetingListItem`、`QuickStartCard`
- `features/join`: `JoinMeetingForm`、`NewMeetingForm`
- `features/pre-meeting`: `DevicePreview`、`DeviceSelector`、`EnterButton`
- `features/waiting-room`: `WaitingRoomCard`、`HostActions`
- `features/meeting-room`: `VideoGrid`、`MeetingToolbar`、`ParticipantPanel`、`ChatPanel`
- `features/meeting-ended`: `MeetingSummary`、`FeedbackForm`

### 5.3 组件接口原则

- 所有 props 定义类型，优先使用 interface/type。
- 事件使用 `defineEmits` 显式声明。
- 复杂状态不通过深层 prop drilling，优先提升到 store 或 feature 级 provide/inject。

---

## 6. 响应式方案：容器查询优先

### 6.1 核心规则

本项目严格执行 `container-design.md` 中的容器优先开发规范：

1. **组件与容器解耦**：组件内部严禁直接使用 `md:`、`lg:`、`xl:` 等视口断点修饰符。
2. **容器容器化**：任何需要响应式的 UI 组件，父节点必须添加 `@container`。
3. **内部断点使用 `@<breakpoint>:`**：例如 `@md:`、`@lg:`、`@2xl:`。
4. **页面级骨架布局**（如侧边栏是否折叠、全局导航显隐）可保留少量媒体查询。
5. **禁止 `!important` 覆盖响应式样式**，优先调整容器大小逻辑。

### 6.2 典型应用示例

**错误示例：**

```html
<div class="grid grid-cols-1 md:grid-cols-3">
  ...
</div>
```

**正确示例：**

```html
<div class="@container">
  <div class="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3">
    ...
  </div>
</div>
```

### 6.3 会议中布局的容器查询策略

采用**经典布局**（顶部信息栏 + 视频网格区 + 底部工具栏 + 可滑出侧边栏），参考腾讯会议默认布局：

- `MeetingRoomView` 作为根容器，使用 flex 布局撑满视口。
- `VideoGrid` 的父容器声明 `@container`，根据容器宽度自动调整列数。
- `Sidebar` 滑出后内部再次声明 `@container`，参会者列表根据侧边栏自身宽度显示头像+名字或仅头像。
- `Toolbar` 的父容器声明 `@container`，宽度不足时自动折叠按钮到“更多”菜单。

### 6.4 Storybook 调试容器查询

在 Storybook 中为复杂组件（`VideoGrid`、`Sidebar`、`Toolbar`）提供不同容器尺寸的故事，利用 Storybook 的 `viewport` 或自定义 wrapper 模拟父容器宽度变化。

---

## 7. 日间/夜间模式

### 7.1 实现策略

- Tailwind 配置 `darkMode: 'class'`。
- `themeStore` 管理主题状态：`theme: 'system' | 'light' | 'dark'`。
- `resolvedTheme` getter 将 `'system'` 解析为当前系统偏好。
- `initTheme()` 在应用启动时：
  1. 读取 `localStorage` 中保存的主题偏好。
  2. 若无保存值，默认 `'system'`。
  3. 监听 `matchMedia('(prefers-color-scheme: dark)')` 变化，当 `theme === 'system'` 时实时同步。
  4. 根据 `resolvedTheme` 给 `document.documentElement` 添加或移除 `dark` 类。
- `ThemeToggle` 组件提供手动切换入口，切换时持久化到 `localStorage`。

### 7.2 设计 token

使用 Tailwind 默认的 `slate`、`zinc`、`neutral` 等色板，配合 `dark:` 修饰符。自定义 token 尽量收敛到 `tailwind.config.ts` 的 `theme.extend.colors` 中，避免散落在组件里。

### 7.3 Storybook 主题调试

在 Storybook `preview.ts` 中配置全局 decorator：

- 根据 Storybook 全局工具栏参数切换 `html` 的 `dark` 类。
- 每个 story 默认渲染 light 和 dark 两种状态，或提供主题切换开关。

---

## 8. 状态与数据流

### 8.1 Store 设计

**`themeStore`**

```ts
interface ThemeState {
  theme: 'system' | 'light' | 'dark'
}

// getters
resolvedTheme: 'light' | 'dark'

// actions
setTheme(theme: 'system' | 'light' | 'dark'): void
initTheme(): void
```

**`meetingStore`**（模拟数据层）

```ts
interface MeetingState {
  currentMeeting: Meeting | null
  participants: Participant[]
  localUser: Participant
  isHost: boolean
  messages: ChatMessage[]
  isMuted: boolean
  isVideoOff: boolean
  isLoading: boolean
  error: string | null
}

// actions
join(meetingId: string, displayName: string): Promise<void>
leave(): void
toggleMute(): void
toggleVideo(): void
sendMessage(content: string): void
```

**`uiStore`**（会议中 UI 局部状态）

```ts
interface UIState {
  sidebarOpen: boolean
  activeSidebarTab: 'participants' | 'chat'
}
```

### 8.2 数据流规则

- Shared 组件通过 props 接收数据，通过 `emit` 通知父组件。
- Feature 视图可直接读取 store，复杂状态变更统一走 store action。
- 容器查询只响应样式，不响应业务状态。

---

## 9. 错误处理

### 9.1 路由错误

- 404 页面捕获所有未匹配路由。
- 路由守卫校验必要参数（如 `meetingId`），缺失时重定向到首页。

### 9.2 渲染错误

- `App.vue` 顶层使用 `onErrorCaptured` 捕获未处理渲染错误，降级显示友好提示。
- `MeetingRoomView` 等复杂页面内部可用 `ErrorBoundary` 组件隔离。

### 9.3 状态错误

- `meetingStore` 的异步 action 用 `try/catch` 包装，暴露 `error` 状态。
- UI 根据 `error` 状态显示重试按钮或提示信息。

### 9.4 主题错误

- `themeStore.initTheme()` 失败时回退到 `light`，不阻塞应用渲染。

### 9.5 用户反馈

- 骨架阶段提供全局 toast 通知能力（基于 Headless UI + 自定义），显示操作结果。
- 暂不要求全局错误上报。

---

## 10. 测试策略

### 10.1 单元/组件测试

- 框架：`Vitest` + `@vue/test-utils`
- 覆盖重点：
  - `themeStore`：主题解析、localStorage 读写、系统偏好监听
  - `meetingStore`：状态变更 action
  - Shared 组件：基础渲染、事件触发（Button、ThemeToggle、Modal）
- mock 原则：不访问真实浏览器 API，`localStorage` 和 `matchMedia` 使用 `vi.stubGlobal` 模拟。

### 10.2 视觉/交互测试

- Storybook 作为视觉回归与容器查询调试工具。
- 为 `VideoGrid`、`Toolbar`、`Sidebar` 等复杂组件提供不同容器尺寸和主题的故事。
- 骨架阶段暂不上 Chromatic，但 story 结构保留扩展空间。

### 10.3 E2E 测试

- 骨架阶段暂不引入 Playwright/Cypress，后续核心链路稳定后再补充。

---

## 11. 开发与构建脚本

推荐 `package.json` scripts：

```json
{
  "dev": "vite",
  "build": "vue-tsc --noEmit && vite build",
  "preview": "vite preview",
  "type-check": "vue-tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "storybook": "storybook dev -p 6006",
  "build-storybook": "storybook build"
}
```

---

## 12. README 关键内容预告

README 中需包含以下两部分注意事项：

### 12.1 容器自适应方案注意事项

1. 组件内部禁止使用 `md:`、`lg:` 等视口断点，必须在外层容器声明 `@container`。
2. 页面级骨架布局（如全局导航、侧边栏折叠）可酌情使用媒体查询。
3. 开发复杂响应式组件时，优先在 Storybook 中通过调整容器宽度验证效果，而非缩放浏览器窗口。
4. `tailwind.config.ts` 必须正确安装并配置 `@tailwindcss/container-queries` 插件。
5. 容器断点默认值参见 `container-design.md`，不要随意覆盖。

### 12.2 日间/夜间模式注意事项

1. Tailwind 使用 `darkMode: 'class'`，主题类挂载在 `document.documentElement`。
2. 默认行为是跟随系统偏好，用户手动切换后优先读取 `localStorage` 记忆值。
3. 所有颜色 token 必须通过 `dark:` 修饰符或扩展主题配置提供暗色版本。
4. Storybook 预览区已配置主题切换，开发组件时务必在两种主题下检查。
5. 切换主题时不要直接操作 DOM，统一通过 `themeStore.setTheme()`。

---

## 13. 风险与后续扩展

| 风险 | 说明 | 当前策略 |
|---|---|---|
| 容器查询兼容性 | 旧浏览器不支持 | 限定现代浏览器最新 2 版 |
| 骨架膨胀 | 用户希望页面较多 | 每个页面只做 UI 壳，业务逻辑用 mock |
| 主题 token 管理 | 颜色可能分散 | 统一收敛到 `tailwind.config.ts` |
| Storybook 维护成本 | 组件多故事多 | 先保证核心组件有 story，结构标准化 |

后续扩展方向：
- 用真实 WebRTC 替换 `VideoTile` 的占位视频。
- 用 WebSocket/信令服务替换 `meetingStore` 的 mock 数据。
- 补充 E2E 测试覆盖核心入会链路。

---

## 14. 审批记录

- 2026-07-09：用户确认范围 A（纯前端 UI 骨架）、页面清单、Vue Router 4 + Pinia、Tailwind class 主题、Headless UI、经典会议布局、现代浏览器兼容、全组件 Storybook 覆盖、Feature-based 目录结构。
