<script setup lang="ts">
import StatusPage from '@/shared/components/StatusPage.vue'

interface Props {
  meetingTitle: string
  displayName: string
}

defineProps<Props>()
</script>

<template>
  <StatusPage :title="meetingTitle" :description="`欢迎，${displayName}`">
    <template #icon>
      <div
        class="inline-flex h-16 w-16 animate-spin items-center justify-center rounded-full border-4 border-border border-t-primary"
        role="status"
        aria-label="加载中"
      />
    </template>

    <p class="text-sm text-text-muted">正在等候主持人准许入会，请稍候...</p>
  </StatusPage>
</template>
