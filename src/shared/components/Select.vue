<script setup lang="ts">
import { computed, useId } from 'vue'

export interface SelectOption {
  value: string
  label: string
}

interface Props {
  modelValue: string
  label?: string
  options: SelectOption[]
  placeholder?: string
  id?: string
  error?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const fallbackId = useId()
const selectId = computed(() => props.id ?? fallbackId)
const errorId = computed(() => `${selectId.value}-error`)
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" :for="selectId" class="text-sm font-medium text-text-secondary">
      {{ label }}
    </label>
    <select
      :id="selectId"
      :value="modelValue"
      :aria-invalid="!!error"
      :aria-describedby="error ? errorId : undefined"
      class="w-full rounded-lg border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-1"
      :class="[
        error
          ? 'border-danger focus:border-danger focus:ring-danger'
          : 'border-border-strong focus:border-primary focus:ring-primary',
      ]"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <span v-if="error" :id="errorId" class="text-xs text-danger">{{ error }}</span>
  </div>
</template>
