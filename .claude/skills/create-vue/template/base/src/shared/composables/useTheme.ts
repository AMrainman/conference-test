import { computed } from 'vue'
import { theme, resolvedTheme, setTheme, toggleTheme, initTheme } from '@/shared/stores/themeStore'

export function useTheme() {
  return {
    theme: computed(() => theme.value),
    resolvedTheme: computed(() => resolvedTheme.value),
    setTheme,
    toggleTheme,
    initTheme,
  }
}
