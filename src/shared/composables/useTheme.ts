import { useThemeStore } from '@/shared/stores/themeStore'

export function useTheme() {
  const store = useThemeStore()
  return {
    theme: store.theme,
    resolvedTheme: store.resolvedTheme,
    setTheme: store.setTheme,
    initTheme: store.initTheme,
  }
}
