<script setup lang="ts">
import { ref } from 'vue'
import Select, { type SelectOption } from '@/shared/components/Select.vue'

const cameras = ref<SelectOption[]>([
  { value: 'default', label: '默认摄像头' },
  { value: 'front', label: '前置摄像头' },
  { value: 'back', label: '后置摄像头' },
  { value: 'usb', label: 'USB 摄像头' },
])

const selectedCamera = ref(cameras.value[0].value)
</script>

<template>
  <Select v-model="selectedCamera" label="摄像头" :options="cameras" />
</template>
