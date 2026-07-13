<script setup lang="ts">
interface Props {
  title: string
  description?: string
}

defineProps<Props>()
</script>

<template>
  <div class="flex min-h-screen items-center justify-center px-4 py-6">
    <div class="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-sm">
      <div class="flex flex-col items-center text-center">
        <div v-if="$slots.icon" class="mb-6">
          <slot name="icon" />
        </div>

        <h1 class="mb-2 text-xl font-bold text-text">
          {{ title }}
        </h1>

        <p v-if="description" class="mb-6 text-text-secondary">{{ description }}</p>

        <div v-if="$slots.default" class="mb-6 w-full">
          <slot />
        </div>

        <div v-if="$slots.actions" class="flex flex-col items-center gap-3">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </div>
</template>
