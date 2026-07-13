import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'
import { mergePackageJsonContent, mergeViteConfig } from './merge-config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const TEMPLATE_ROOT = resolve(__dirname, '../template')

export async function generateProject(targetDir, options) {
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true })
  }

  copyBase(targetDir)

  const selected = [
    ...options.basePlugins,
    ...(options.uiLibrary ? [options.uiLibrary] : []),
    ...options.iconLibraries,
    ...options.dxPlugins,
  ]

  const manifests = selected.map(loadManifest).filter(Boolean)

  // 1. 合并 package.json
  const basePackagePath = join(targetDir, 'package.json')
  let packageContent = JSON.parse(readFileSync(basePackagePath, 'utf-8'))
  for (const manifest of manifests) {
    packageContent = mergePackageJsonContent(packageContent, manifest)
  }
  writeFileSync(basePackagePath, JSON.stringify(packageContent, null, 2) + '\n')

  // 2. 复制片段 files
  for (const manifest of manifests) {
    copyManifestFiles(manifest, targetDir)
  }

  // 3. 生成 main.ts 和 App.vue（处理多插件组合）
  generateMainEntry(targetDir, options)
  generateAppComponent(targetDir, options)

  // 4. 应用 overrides（除 main.ts / App.vue 外）
  for (const manifest of manifests) {
    for (const override of manifest.overrides || []) {
      if (override === 'src/app/main.ts' || override === 'src/app/App.vue') continue
      applyOverride(manifest, override, targetDir)
    }
  }

  return manifests
}

function copyBase(targetDir) {
  const baseDir = join(TEMPLATE_ROOT, 'base')
  cpSync(baseDir, targetDir, { recursive: true })
}

function loadManifest(name) {
  const categories = ['plugins', 'ui-libraries', 'icon-libraries']
  for (const category of categories) {
    const manifestPath = join(TEMPLATE_ROOT, category, name, 'manifest.json')
    if (existsSync(manifestPath)) {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
      manifest._root = join(TEMPLATE_ROOT, category, name)
      return manifest
    }
  }
  return null
}

function copyManifestFiles(manifest, targetDir) {
  const filesDir = join(manifest._root, 'files')
  if (!existsSync(filesDir)) return
  cpSync(filesDir, targetDir, { recursive: true, force: true })
}

function applyOverride(manifest, overridePath, targetDir) {
  const sourcePath = join(manifest._root, 'overrides', overridePath)
  const targetPath = join(targetDir, overridePath)

  if (!existsSync(sourcePath)) return

  if (overridePath === 'vite.config.ts') {
    const baseContent = readFileSync(targetPath, 'utf-8')
    const overrideContent = readFileSync(sourcePath, 'utf-8')
    writeFileSync(targetPath, mergeViteConfig(baseContent, overrideContent))
  } else if (overridePath === 'tsconfig.json') {
    const baseJson = JSON.parse(readFileSync(targetPath, 'utf-8'))
    const overrideJson = JSON.parse(readFileSync(sourcePath, 'utf-8'))
    const merged = {
      ...baseJson,
      ...overrideJson,
      include: [...new Set([...(baseJson.include || []), ...(overrideJson.include || [])])],
    }
    writeFileSync(targetPath, JSON.stringify(merged, null, 2) + '\n')
  } else if (overridePath === '.gitignore') {
    const baseContent = readFileSync(targetPath, 'utf-8')
    const overrideContent = readFileSync(sourcePath, 'utf-8')
    writeFileSync(targetPath, baseContent + '\n' + overrideContent + '\n')
  } else {
    cpSync(sourcePath, targetPath, { force: true })
  }
}

function generateMainEntry(targetDir, options) {
  const hasPinia = options.basePlugins.includes('pinia')
  const hasRouter = options.basePlugins.includes('vue-router')
  const hasMsw = options.basePlugins.includes('msw')

  const imports = ["import { createApp } from 'vue'", "import App from './App.vue'"]
  if (hasPinia) imports.push("import { createPinia } from 'pinia'")
  if (hasRouter) imports.push("import { router } from './router'")
  imports.push("import '@/shared/styles/tailwind.css'")

  let body = ''

  if (hasMsw) {
    body += `
async function enableMocking() {
  if (!import.meta.env.DEV) return
  const { worker } = await import('@/mocks/browser')
  await worker.start()
}

enableMocking().then(() => {
  const app = createApp(App)
${hasPinia ? '  app.use(createPinia())\n' : ''}${hasRouter ? '  app.use(router)\n' : ''}  app.mount('#app')
})
`
  } else {
    body += `
const app = createApp(App)
${hasPinia ? 'app.use(createPinia())\n' : ''}${hasRouter ? 'app.use(router)\n' : ''}app.mount('#app')
`
  }

  writeFileSync(join(targetDir, 'src/app/main.ts'), imports.join('\n') + body)
}

function generateAppComponent(targetDir, options) {
  const hasRouter = options.basePlugins.includes('vue-router')

  if (!hasRouter) {
    // base 已经包含合适的 App.vue，但这里显式生成无路由版本
    const content = `<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'
import AppShell from '@/shared/components/AppShell.vue'
import HomeView from '@/features/home/views/HomeView.vue'

const capturedError = ref<Error | null>(null)

onErrorCaptured((err) => {
  capturedError.value = err instanceof Error ? err : new Error(String(err))
  return false
})

function reload() {
  window.location.reload()
}
</script>

<template>
  <AppShell>
    <div v-if="capturedError" class="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <div class="rounded-lg bg-danger-subtle px-6 py-4 text-danger-text">
        <p class="font-semibold">应用发生错误</p>
        <p class="mt-1 text-sm">{{ capturedError.message }}</p>
      </div>
      <button
        type="button"
        class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-text hover:bg-primary-hover"
        @click="reload"
      >
        重新加载
      </button>
    </div>
    <HomeView v-else />
  </AppShell>
</template>
`
    writeFileSync(join(targetDir, 'src/app/App.vue'), content)
    return
  }

  // 有路由版本由 vue-router 片段 files 提供，无需生成
}
