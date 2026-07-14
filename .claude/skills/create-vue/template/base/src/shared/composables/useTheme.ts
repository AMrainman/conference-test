import { computed } from 'vue'
import { useThemeStore } from '@/shared/stores/themeStore'

export function useTheme() {
  const store = useThemeStore()
  return {
    theme: computed(() => store.theme),
    resolvedTheme: computed(() => store.resolvedTheme),
    setTheme: store.setTheme,
    toggleTheme: store.toggleTheme,
    initTheme: store.initTheme,
  }
}
