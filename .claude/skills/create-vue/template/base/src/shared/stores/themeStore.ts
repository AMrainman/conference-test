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

const theme = ref<Theme>('system')
const systemTheme = ref<'light' | 'dark'>(getSystemTheme())

let mediaQueryList: MediaQueryList | undefined
let mediaQueryListener: ((event: MediaQueryListEvent) => void) | undefined

export const resolvedTheme = computed(() => {
  return theme.value === 'system' ? systemTheme.value : theme.value
})

export function cleanupTheme() {
  if (mediaQueryList && mediaQueryListener) {
    mediaQueryList.removeEventListener('change', mediaQueryListener)
  }
  mediaQueryList = undefined
  mediaQueryListener = undefined
}

export function setTheme(value: Theme) {
  theme.value = value
  if (value === 'system') {
    systemTheme.value = getSystemTheme()
  }
  safeSetItem(STORAGE_KEY, value)
  applyTheme(resolvedTheme.value)
}

export function toggleTheme() {
  const next = resolvedTheme.value === 'dark' ? 'light' : 'dark'
  setTheme(next)
}

export function initTheme() {
  const saved = safeGetItem(STORAGE_KEY)
  theme.value = saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system'
  systemTheme.value = getSystemTheme()
  applyTheme(resolvedTheme.value)

  cleanupTheme()
  mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQueryListener = e => {
    systemTheme.value = e.matches ? 'dark' : 'light'
    if (theme.value === 'system') {
      applyTheme(resolvedTheme.value)
    }
  }
  mediaQueryList.addEventListener('change', mediaQueryListener)
}

export { theme }
