import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Theme } from '@/shared/types'

const STORAGE_KEY = 'app-theme'

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light'
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: 'light' | 'dark') {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // 在 Safari 隐私模式、沙箱 iframe 或 localStorage 被禁用时静默降级
  }
}

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>('system')

  // 监听系统主题变化时同步更新该 ref，使 resolvedTheme 具备响应性
  const systemTheme = ref<'light' | 'dark'>(getSystemTheme())

  // 用于清理上一次的系统主题监听器，避免重复注册导致泄漏
  let mediaQueryList: MediaQueryList | undefined
  let mediaQueryListener: ((event: MediaQueryListEvent) => void) | undefined

  const resolvedTheme = computed(() => {
    return theme.value === 'system' ? systemTheme.value : theme.value
  })

  function setTheme(value: Theme) {
    theme.value = value
    if (value === 'system') {
      // 切回 system 时刷新系统主题缓存，避免使用旧值
      systemTheme.value = getSystemTheme()
    }
    safeSetItem(STORAGE_KEY, value)
    applyTheme(resolvedTheme.value)
  }

  function initTheme() {
    const saved = safeGetItem(STORAGE_KEY)
    theme.value = saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system'

    // 初始化时同步一次系统主题，确保 resolvedTheme 与 DOM 一致
    systemTheme.value = getSystemTheme()
    applyTheme(resolvedTheme.value)

    // 重新初始化前先移除旧的监听器
    if (mediaQueryList && mediaQueryListener) {
      mediaQueryList.removeEventListener('change', mediaQueryListener)
    }

    mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQueryListener = (e) => {
      // 系统主题变化时同步刷新 systemTheme，让 resolvedTheme 自动重新计算
      systemTheme.value = e.matches ? 'dark' : 'light'
      if (theme.value === 'system') {
        applyTheme(resolvedTheme.value)
      }
    }
    mediaQueryList.addEventListener('change', mediaQueryListener)
  }

  return { theme, resolvedTheme, setTheme, initTheme }
})
