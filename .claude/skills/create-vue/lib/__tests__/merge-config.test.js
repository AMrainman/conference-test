import { describe, it, expect } from 'vitest'
import { mergePackageJsonContent, mergeObject, mergeViteConfig } from '../merge-config.js'

describe('mergePackageJsonContent', () => {
  it('merges dependencies and devDependencies', () => {
    const base = {
      dependencies: { vue: '^3.5.0' },
      devDependencies: { vite: '^6.0.0' },
      scripts: { dev: 'vite' },
    }
    const override = {
      dependencies: { pinia: '^2.1.7' },
      devDependencies: { '@vitejs/plugin-vue': '^5.2.0' },
      scripts: { test: 'vitest run' },
    }
    const result = mergePackageJsonContent(base, override)
    expect(result.dependencies).toEqual({ vue: '^3.5.0', pinia: '^2.1.7' })
    expect(result.devDependencies).toEqual({ vite: '^6.0.0', '@vitejs/plugin-vue': '^5.2.0' })
    expect(result.scripts).toEqual({ dev: 'vite', test: 'vitest run' })
  })
})

describe('mergeObject', () => {
  it('overrides base keys with override keys', () => {
    expect(mergeObject({ a: 1, b: 2 }, { b: 3, c: 4 })).toEqual({ a: 1, b: 3, c: 4 })
  })
})

describe('mergeViteConfig', () => {
  it('merges plugin arrays', () => {
    const base = `export default defineConfig({\\n  plugins: [vue()],\\n})`
    const override = `export default defineConfig({\\n  plugins: [AutoImport()],\\n})`
    const result = mergeViteConfig(base, override)
    expect(result).toContain('vue()')
    expect(result).toContain('AutoImport()')
  })
})
