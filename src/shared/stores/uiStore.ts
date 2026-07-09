import { defineStore } from 'pinia'
import { ref } from 'vue'

export type SidebarTab = 'participants' | 'chat'

export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(false)
  const activeSidebarTab = ref<SidebarTab>('participants')

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function closeSidebar() {
    sidebarOpen.value = false
  }

  function setActiveTab(tab: SidebarTab) {
    activeSidebarTab.value = tab
  }

  return {
    sidebarOpen,
    activeSidebarTab,
    toggleSidebar,
    closeSidebar,
    setActiveTab,
  }
})
