// @vitest-environment jsdom
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useThemeStore } from '../themeStore'

describe('themeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('默认主题为 system', () => {
    const store = useThemeStore()
    expect(store.theme).toBe('system')
  })

  it('setTheme light 会添加 dark 类', () => {
    const store = useThemeStore()
    store.setTheme('dark')
    expect(store.theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('app-theme')).toBe('dark')
  })

  it('resolvedTheme 根据系统偏好解析 system', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    const store = useThemeStore()
    expect(store.resolvedTheme).toBe('dark')
  })
})
