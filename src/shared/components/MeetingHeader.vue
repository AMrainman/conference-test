<script setup lang="ts">
interface Props {
  title: string
  meetingId: string
}

defineProps<Props>()
</script>

<template>
  <header class="flex items-center justify-between bg-white px-4 py-2 shadow-sm dark:bg-slate-900">
    <div class="@container flex items-center gap-3">
      <h1 class="text-sm font-semibold @md:text-base">{{ title }}</h1>
      <span class="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800">{{ meetingId }}</span>
    </div>
    <div class="flex items-center gap-2">
      <slot />
    </div>
  </header>
</template>
