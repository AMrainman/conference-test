<script setup lang="ts">
interface Props {
  meetingTitle: string
  displayName: string
}

defineProps<Props>()
</script>

<template>
  <div class="@container flex min-h-screen items-center justify-center px-4 py-6">
    <div
      class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <div class="flex flex-col items-center text-center">
        <div
          class="mb-6 inline-flex h-16 w-16 animate-spin items-center justify-center rounded-full border-4 border-slate-200 border-t-primary-600 dark:border-slate-700 dark:border-t-primary-500"
          role="status"
          aria-label="加载中"
        />

        <h1
          class="mb-2 text-xl font-bold text-slate-900 dark:text-slate-100"
        >
          {{ meetingTitle }}
        </h1>

        <p class="mb-6 text-slate-600 dark:text-slate-300">
          欢迎，{{ displayName }}
        </p>

        <p class="text-sm text-slate-500 dark:text-slate-400">
          正在等候主持人准许入会，请稍候...
        </p>
      </div>
    </div>
  </div>
</template>
