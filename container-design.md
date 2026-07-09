---
description: 强制执行容器驱动的组件设计模式，禁止组件内部滥用视口断点，统一响应式逻辑。
globs: ["src/components/**/*.{vue,tsx,jsx,css,scss}", "src/layouts/**/*.{vue,tsx,jsx,css,scss}"]
---

# 容器优先开发规范 (Container-Driven Development)

## 核心原则

本项目采用“容器查询 (Container Queries)”作为组件自适应的核心机制，视口查询 (Media Queries) 仅保留用于页面骨架布局 (Layout)。

## 规则指南

### 1. 组件与容器的解耦
- **严禁滥用全局断点**：在组件内部，严禁使用 `md:`, `lg:`, `xl:` 等视口断点修饰符。
- **容器容器化**：任何需要响应式的 UI 组件，必须首先拥有容器上下文。
  - 父容器定义：添加 `container-type: inline-size` 或 Tailwind 的 `@container` 工具类。
  - 组件逻辑：使用 `@<breakpoint>:` 修饰符来定义内部元素在不同容器宽度下的表现。

### 2. 原子类组合范式
当编写组件时，请遵循以下模式：

**错误示例（视口驱动）：**
```html
<div class="grid grid-cols-1 md:grid-cols-3">...</div>
```

**正确示例（容器驱动）：**

```html
<div class="@container">
  <div class="grid grid-cols-1 @md:grid-cols-3">
    ...
  </div>
</div>
```

### 3. 断点命名约定

使用 Tailwind @container 插件默认的容器断点：

| name | css |
| -- | -- |
| @xs | @container (min-width: 20rem /*320px*/) |
| @sm | @container (min-width: 24rem /*384px*/) |
| @md | @container (min-width: 28rem /*448px*/) |
| @lg | @container (min-width: 32rem /*512px*/) |
| @xl | @container (min-width: 36rem /*576px*/) |
| @2xl | @container (min-width: 42rem /*672px*/) |
| @3xl | @container (min-width: 48rem /*768px*/) |
| @4xl | @container (min-width: 56rem /*896px*/) |
| @5xl | @container (min-width: 64rem /*1024px*/) |
| @6xl | @container (min-width: 72rem /*1152px*/) |
| @7xl | @container (min-width: 80rem /*1280px*/) |

### 4. AI 编码辅助要求

- 当生成新组件时，默认假设其需要自适应，请主动为父容器添加 @container 类。
- 若组件过于复杂，请在组件顶部添加注释说明其容器查询的断点阈值。
- 拒绝使用 !important 覆盖响应式样式，优先通过调整容器大小逻辑解决。
- 如果组件在不同布局位置会有显著形态变化，请优先选择容器查询而不是传递额外的 props 来控制样式。

**自动化审查：**

1. **自动化审查**：完成所有任务后检查目前 `src/components` 下的所有文件，如果发现有 `md:` 或 `lg:` 且没有 `container` 类的组件，请列出来并建议重构。
2. **视觉反馈**：由于容器查询在开发时不像媒体查询那样方便手动缩放浏览器窗口测试，建议你在开发时使用类似 [Storybook](https://storybook.js.org/) 的工具，配合 `resize` 功能，这样你可以直观地看到容器宽度变化时组件的响应式效果。
3. **技术栈补充**：确保你的 `tailwind.config.js` 中已经安装并配置了 `@tailwindcss/container-queries` 插件，否则上述代码将无法生效。
