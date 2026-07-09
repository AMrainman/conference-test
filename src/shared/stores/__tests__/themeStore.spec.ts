// @vitest-environment jsdom
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useThemeStore } from '../themeStore'

function mockMatchMedia(matches: boolean) {
  const mql = {
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
  vi.stubGlobal('matchMedia', vi.fn(() => mql))
  return mql
}

describe('themeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('默认主题为 system', () => {
    const store = useThemeStore()
    expect(store.theme).toBe('system')
  })

  it('setTheme dark 会添加 dark 类并保存到 localStorage', () => {
    mockMatchMedia(false)
    const store = useThemeStore()
    store.setTheme('dark')
    expect(store.theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('app-theme')).toBe('dark')
  })

  it('resolvedTheme 根据系统偏好解析 system', () => {
    mockMatchMedia(true)
    const store = useThemeStore()
    expect(store.resolvedTheme).toBe('dark')
  })

  it('setTheme system 会解析为系统主题并保存 system', () => {
    mockMatchMedia(true)
    const store = useThemeStore()
    store.setTheme('system')
    expect(store.theme).toBe('system')
    expect(store.resolvedTheme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('app-theme')).toBe('system')
  })

  it('initTheme 从 localStorage 恢复主题', () => {
    mockMatchMedia(false)
    localStorage.setItem('app-theme', 'dark')
    const store = useThemeStore()
    store.initTheme()
    expect(store.theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('initTheme 在 system 模式下监听系统主题变化并应用', () => {
    const mql = mockMatchMedia(false)
    const store = useThemeStore()
    store.initTheme()
    expect(store.theme).toBe('system')
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    const listener = mql.addEventListener.mock.calls[0][1] as (event: { matches: boolean }) => void
    listener({ matches: true })
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('多次调用 initTheme 不会重复注册系统主题监听器', () => {
    const mql = mockMatchMedia(false)
    const store = useThemeStore()
    store.initTheme()
    store.initTheme()
    expect(mql.removeEventListener).toHaveBeenCalledTimes(1)
    expect(mql.addEventListener).toHaveBeenCalledTimes(2)
  })
})
