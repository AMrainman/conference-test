<script setup lang="ts">
interface Props {
  title: string
  meetingId: string
}

defineProps<Props>()
</script>

<template>
  <header class="flex items-center justify-between bg-surface px-4 py-2 shadow-sm">
    <div class="@container flex flex-1 min-w-0 items-center gap-3">
      <h1 class="truncate text-sm font-semibold @md:text-base">{{ title }}</h1>
      <span class="shrink-0 rounded bg-surface-secondary px-2 py-0.5 text-xs text-text-muted">
        {{ meetingId }}
      </span>
    </div>
    <div class="flex items-center gap-2">
      <slot />
    </div>
  </header>
</template>
