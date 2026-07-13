<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'
import AppShell from '@/shared/components/AppShell.vue'
import HomeView from '@/features/home/views/HomeView.vue'

const capturedError = ref<Error | null>(null)

onErrorCaptured(err => {
  // 捕获应用级错误，展示降级 UI 并阻止继续向上传播
  capturedError.value = err instanceof Error ? err : new Error(String(err))
  return false
})

function reload() {
  window.location.reload()
}
</script>

<template>
  <AppShell>
    <div v-if="capturedError" class="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <div class="rounded-lg bg-danger-subtle px-6 py-4 text-danger-text">
        <p class="font-semibold">应用发生错误</p>
        <p class="mt-1 text-sm">{{ capturedError.message }}</p>
      </div>
      <button
        type="button"
        class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-text hover:bg-primary-hover"
        @click="reload"
      >
        重新加载
      </button>
    </div>
    <HomeView v-else />
  </AppShell>
</template>
