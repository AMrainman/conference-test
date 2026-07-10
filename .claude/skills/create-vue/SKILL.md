---
description: "生成基于 Vue 3 + Pinia + TypeScript + Vite + Tailwind CSS + headlessui + Storybook + MSW 的项目骨架"
user-invocable: true
allowed-tools: Bash, Read, Write, Edit
---

# create-vue

在当前目录生成一个 Vue 3 项目骨架，包含容器自适应、日间/夜间模式、ESLint/Prettier、MSW Mock、Storybook 以及基础共享组件。不生成业务代码，仅保留 Home / About 两个示例页面用于验证路由。

## 用法

```bash
/create-vue
```

执行后会在**当前目录**生成文件。如果当前目录已存在文件（除README.md外的文件），必须先向用户确认是否继续。

## 执行步骤

1. **确认目录状态**：检查当前目录是否为空。若非空，询问用户是否继续。
2. **复制模板文件**：将 `.claude/skills/create-vue/template/` 下的所有文件递归复制到当前目录。
   - 命令示例：`cp -r .claude/skills/create-vue/template/. .`
3. **安装依赖**：运行 `npm install`。
4. **初始化 MSW worker**：运行 `npx msw init public --save false`。
5. **验证骨架**：依次运行 `npm run type-check`、`npm run lint`、`npm run test`、`npm run build`。
6. **报告结果**：告知用户验证结果，并说明如何启动开发服务器。

## 禁止行为

- 不要生成 Home / About 之外的任何业务页面或业务组件。
- 不要生成业务相关的 MSW handlers（只保留 `/api/health` 示例）。
- 不要在组件内部使用 `md:`、`lg:` 等视口断点。

## 模板文件来源

本 skill 的所有生成文件均来自同目录下的 `template/` 文件夹。修改骨架内容时，请直接编辑 `template/` 中的文件，而不是在 SKILL.md 中嵌入代码。
