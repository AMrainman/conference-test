---
description: 强制执行容器驱动的组件设计模式，禁止组件内部滥用视口断点。
globs: ["src/components/**/*.{vue,tsx,jsx,css,scss}", "src/layouts/**/*.{vue,tsx,jsx,css,scss}"]
---

# 容器优先开发规范

## 核心原则

本项目采用“容器查询 (Container Queries)”作为组件自适应的核心机制，视口查询 (Media Queries) 仅保留用于页面骨架布局。

## 规则指南

### 1. 组件与容器的解耦

- 在组件内部，严禁使用 `md:`、`lg:`、`xl:` 等视口断点修饰符。
- 任何需要响应式的 UI 组件，必须首先拥有容器上下文。
  - 父容器定义：添加 `@container` 工具类。
  - 组件逻辑：使用 `@<breakpoint>:` 修饰符。

### 2. 原子类组合范式

错误示例：

```html
<div class="grid grid-cols-1 md:grid-cols-3">...</div>
```

正确示例：

```html
<div class="@container">
  <div class="grid grid-cols-1 @md:grid-cols-3">...</div>
</div>
```

### 3. 断点命名约定

使用 Tailwind @container 插件默认的容器断点：@xs、@sm、@md、@lg、@xl、@2xl ... @7xl。

### 4. AI 编码辅助要求

- 生成新组件时，默认假设其需要自适应，主动为父容器添加 `@container` 类。
- 拒绝使用 `!important` 覆盖响应式样式。
- 组件在不同布局位置有显著形态变化时，优先选择容器查询而非额外 props。
