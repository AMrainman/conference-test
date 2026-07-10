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
        ? 'text-danger hover:bg-danger-subtle'
        : active
          ? 'bg-primary-subtle text-primary'
          : 'text-text-secondary hover:bg-surface-secondary',
    ]"
    @click="emit('click', $event)"
  >
    <slot />
    <span class="text-xs" :class="labelClass">{{ label }}</span>
  </button>
</template>
