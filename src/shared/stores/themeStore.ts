import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Theme } from '@/shared/types'

const STORAGE_KEY = 'app-theme'

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: 'light' | 'dark') {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>('system')

  // 用于清理上一次的系统主题监听器，避免重复注册导致泄漏
  let mediaQueryList: MediaQueryList | undefined
  let mediaQueryListener: ((event: MediaQueryListEvent) => void) | undefined

  const resolvedTheme = computed(() => {
    return theme.value === 'system' ? getSystemTheme() : theme.value
  })

  function setTheme(value: Theme) {
    theme.value = value
    localStorage.setItem(STORAGE_KEY, value)
    applyTheme(resolvedTheme.value)
  }

  function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    theme.value = saved ?? 'system'
    applyTheme(resolvedTheme.value)

    // 重新初始化前先移除旧的监听器
    if (mediaQueryList && mediaQueryListener) {
      mediaQueryList.removeEventListener('change', mediaQueryListener)
    }

    mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQueryListener = (e) => {
      if (theme.value === 'system') {
        applyTheme(e.matches ? 'dark' : 'light')
      }
    }
    mediaQueryList.addEventListener('change', mediaQueryListener)
  }

  return { theme, resolvedTheme, setTheme, initTheme }
})
