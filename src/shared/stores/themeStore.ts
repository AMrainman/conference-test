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

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (theme.value === 'system') {
        applyTheme(e.matches ? 'dark' : 'light')
      }
    })
  }

  return { theme, resolvedTheme, setTheme, initTheme }
})
