<script setup lang="ts">
interface Props {
  label: string
  active?: boolean
  danger?: boolean
  labelClass?: string | string[]
}

withDefaults(defineProps<Props>(), { active: false, danger: false })

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    type="button"
    :aria-label="label"
    :aria-pressed="active"
    class="flex flex-col items-center gap-1 rounded-lg p-2 transition-colors"
    :class="[
      danger
        ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900'
        : active
          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
    ]"
    @click="emit('click', $event)"
  >
    <slot />
    <span class="text-xs" :class="labelClass">{{ label }}</span>
  </button>
</template>
