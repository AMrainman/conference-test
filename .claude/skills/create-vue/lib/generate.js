import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'
import { mergePackageJsonContent } from './merge-config.js'

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
    ...options.uiLibraries,
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

  // 3. 生成 main.ts、vite.config.ts 和 vitest.setup.ts
  generateMainEntry(targetDir, options)
  generateViteConfig(targetDir, options)
  generateVitestSetup(targetDir, options)

  // 4. 应用 overrides（除 main.ts / vite.config.ts / vitest.setup.ts 外）
  for (const manifest of manifests) {
    for (const override of manifest.overrides || []) {
      if (override === 'src/app/main.ts' || override === 'vite.config.ts' || override === 'vitest.setup.ts') continue
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
  const hasRouter = options.basePlugins.includes('vue-router')
  const hasMsw = options.basePlugins.includes('msw')

  const imports = [
    "import { createApp } from 'vue'",
    "import { createPinia } from 'pinia'",
    "import App from './App.vue'",
    "import { useThemeStore } from '@/shared/stores/themeStore'",
  ]
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
`
  }

  body += `
async function bootstrap() {
${hasMsw ? '  await enableMocking()\n' : ''}  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)
${hasRouter ? '  app.use(router)\n' : ''}  const themeStore = useThemeStore()
  themeStore.initTheme()
  app.mount('#app')
}

bootstrap().catch(err => {
  const message = err instanceof Error ? err.message : String(err)
  const appEl = document.getElementById('app')
  if (appEl) {
    appEl.innerHTML = \`
      <div style="padding:2rem;text-align:center;font-family:sans-serif">
        <h1 style="color:#dc2626;font-size:1.25rem;margin-bottom:0.5rem">应用启动失败</h1>
        <p style="color:#4b5563;margin-bottom:1rem">请刷新页面重试，如果问题持续存在请检查控制台日志</p>
        <pre style="text-align:left;background:#f3f4f6;padding:1rem;border-radius:0.5rem;overflow:auto;font-size:0.875rem">\${message.replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c]!)}</pre>
      </div>
    \`
  }
})
`

  writeFileSync(join(targetDir, 'src/app/main.ts'), imports.join('\n') + '\n' + body)
}

function generateViteConfig(targetDir, options) {
  const hasAutoImport = options.dxPlugins.includes('auto-import')
  const hasComponents = options.dxPlugins.includes('components-auto')

  const imports = [
    "import { defineConfig } from 'vite'",
    "import vue from '@vitejs/plugin-vue'",
    "import { resolve } from 'path'",
  ]
  const plugins = ['vue()']

  if (hasAutoImport) {
    imports.push("import AutoImport from 'unplugin-auto-import/vite'")
    plugins.push(`AutoImport({\n      imports: ['vue', 'vue-router', 'pinia'],\n      dts: 'src/auto-imports.d.ts',\n      dirs: ['src/shared/composables', 'src/shared/stores'],\n      vueTemplate: true,\n      eslintrc: {\n        enabled: true,\n      },\n    })`)
  }

  if (hasComponents) {
    imports.push("import Components from 'unplugin-vue-components/vite'")
    plugins.push(`Components({\n      dirs: ['src/shared/components'],\n      dts: 'src/components.d.ts',\n      deep: true,\n    })`)
  }

  const content = `${imports.join('\n')}\n\nexport default defineConfig({\n  plugins: [\n    ${plugins.join(',\n    ')},\n  ],\n  resolve: {\n    alias: {\n      '@': resolve(__dirname, 'src'),\n    },\n  },\n})\n`

  writeFileSync(join(targetDir, 'vite.config.ts'), content)
}

function generateVitestSetup(targetDir, options) {
  const hasVitest = options.basePlugins.includes('vitest')
  if (!hasVitest) return

  const hasMsw = options.basePlugins.includes('msw')

  let content = ''
  if (hasMsw) {
    content = `import { setupServer } from 'msw/node'
import { beforeAll, afterAll, afterEach } from 'vitest'
import { handlers } from './src/mocks/handlers'

const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
`
  } else {
    content = `import { expect } from 'vitest'

// 占位 setup，可根据需要扩展自定义 matchers
expect.extend({})
`
  }

  writeFileSync(join(targetDir, 'vitest.setup.ts'), content)
}
