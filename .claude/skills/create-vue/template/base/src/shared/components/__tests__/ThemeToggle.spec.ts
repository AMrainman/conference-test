// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import ThemeToggle from '../ThemeToggle.vue'
import { useThemeStore } from '@/shared/stores/themeStore'

function createMatchMediaMock(initialDark = false) {
  let isDark = initialDark
  const listeners = new Set<(event: MediaQueryListEvent) => void>()

  return {
    get matches() {
      return isDark
    },
    addEventListener(_event: string, listener: (event: MediaQueryListEvent) => void) {
      listeners.add(listener)
    },
    removeEventListener(_event: string, listener: (event: MediaQueryListEvent) => void) {
      listeners.delete(listener)
    },
    setDark(value: boolean) {
      isDark = value
      listeners.forEach(listener => listener({ matches: value } as MediaQueryListEvent))
    },
  }
}

describe('ThemeToggle', () => {
  let matchMediaMock: ReturnType<typeof createMatchMediaMock>

  beforeEach(() => {
    matchMediaMock = createMatchMediaMock(false)
    vi.stubGlobal('matchMedia', () => matchMediaMock)

    localStorage.clear()
    document.documentElement.classList.remove('dark')
    setActivePinia(createPinia())
    useThemeStore().initTheme()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('默认跟随系统主题，显示太阳图标', async () => {
    await nextTick()

    const wrapper = mount(ThemeToggle)
    expect(wrapper.find('button').attributes('aria-pressed')).toBe('false')
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('点击按钮切换到深色模式并缓存', async () => {
    const wrapper = mount(ThemeToggle)
    await wrapper.find('button').trigger('click')
    await nextTick()

    const store = useThemeStore()
    expect(store.theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('app-theme')).toBe('dark')
    expect(wrapper.find('button').attributes('aria-pressed')).toBe('true')
  })

  it('再次点击按钮切换回浅色模式并缓存', async () => {
    const store = useThemeStore()
    store.setTheme('dark')
    await nextTick()

    const wrapper = mount(ThemeToggle)
    await wrapper.find('button').trigger('click')
    await nextTick()

    expect(store.theme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('app-theme')).toBe('light')
    expect(wrapper.find('button').attributes('aria-pressed')).toBe('false')
  })
})
