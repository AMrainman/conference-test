<script setup lang="ts">
interface Props {
  meetingTitle: string
  displayName: string
}

defineProps<Props>()
</script>

<template>
  <div class="@container flex min-h-screen items-center justify-center px-4 py-6">
    <div class="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-sm">
      <div class="flex flex-col items-center text-center">
        <div
          class="mb-6 inline-flex h-16 w-16 animate-spin items-center justify-center rounded-full border-4 border-border border-t-primary"
          role="status"
          aria-label="加载中"
        />

        <h1 class="mb-2 text-xl font-bold text-text">
          {{ meetingTitle }}
        </h1>

        <p class="mb-6 text-text-secondary">欢迎，{{ displayName }}</p>

        <p class="text-sm text-text-muted">正在等候主持人准许入会，请稍候...</p>
      </div>
    </div>
  </div>
</template>
