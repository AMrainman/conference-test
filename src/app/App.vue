<script setup lang="ts">
import { onErrorCaptured } from 'vue'
import { RouterView } from 'vue-router'
import AppShell from '@/shared/components/AppShell.vue'

onErrorCaptured((_err, _instance, _info) => {
  // 捕获应用级错误，避免错误继续向上传播
  return false
})
</script>

<template>
  <AppShell>
    <RouterView />
  </AppShell>
</template>
