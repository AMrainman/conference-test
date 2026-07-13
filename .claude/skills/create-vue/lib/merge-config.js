import { existsSync, readFileSync } from 'fs'

export function mergePackageJson(basePath, overridePath) {
  const base = JSON.parse(readFileSync(basePath, 'utf-8'))
  if (!existsSync(overridePath)) return base

  const override = JSON.parse(readFileSync(overridePath, 'utf-8'))
  return mergePackageJsonContent(base, override)
}

export function mergePackageJsonContent(base, override) {
  return {
    ...base,
    dependencies: { ...base.dependencies, ...(override.dependencies || {}) },
    devDependencies: { ...base.devDependencies, ...(override.devDependencies || {}) },
    scripts: { ...base.scripts, ...(override.scripts || {}) },
    msw: override.msw ?? base.msw,
  }
}

export function mergeObject(base, override) {
  return { ...base, ...override }
}

export function mergeViteConfig(baseContent, overrideContent) {
  const overridePluginsMatch = overrideContent.match(/plugins:\s*\[([\s\S]*?)\],?/)
  const basePluginsMatch = baseContent.match(/plugins:\s*\[([\s\S]*?)\],?/)

  if (!overridePluginsMatch || !basePluginsMatch) {
    return overrideContent || baseContent
  }

  const mergedPlugins = `[\n    ${basePluginsMatch[1].trim()}\n${overridePluginsMatch[1].trim() ? `    ${overridePluginsMatch[1].trim()}` : ''}\n  ]`
  return baseContent.replace(/plugins:\s*\[[\s\S]*?\],?/, `plugins: ${mergedPlugins},`)
}
