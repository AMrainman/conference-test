<script setup lang="ts">
import { computed, useId } from 'vue'

interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'
  error?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), { type: 'text' })

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// useId 必须在 setup 阶段同步调用，再与外部传入的 id 合并
const fallbackId = useId()
const inputId = computed(() => props.id ?? fallbackId)
const errorId = computed(() => `${inputId.value}-error`)
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" :for="inputId" class="text-sm font-medium text-slate-700 dark:text-slate-300">
      {{ label }}
    </label>
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :aria-invalid="!!error"
      :aria-describedby="error ? errorId : undefined"
      class="rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 dark:bg-slate-800 dark:text-slate-100"
      :class="[
        error
          ? 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500'
          : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500 dark:border-slate-700',
      ]"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="error" :id="errorId" class="text-xs text-red-600">{{ error }}</span>
  </div>
</template>
