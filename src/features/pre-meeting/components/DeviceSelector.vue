<script setup lang="ts">
import { ref } from 'vue'

interface Camera {
  id: string
  label: string
}

const cameras = ref<Camera[]>([
  { id: 'default', label: '默认摄像头' },
  { id: 'front', label: '前置摄像头' },
  { id: 'back', label: '后置摄像头' },
  { id: 'usb', label: 'USB 摄像头' },
])

const selectedCamera = ref(cameras.value[0].id)
</script>

<template>
  <div class="flex flex-col gap-1">
    <label
      for="camera-select"
      class="text-sm font-medium text-slate-700 dark:text-slate-300"
    >摄像头</label>
    <select
      id="camera-select"
      v-model="selectedCamera"
      class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:border-primary-500 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
    >
      <option
        v-for="camera in cameras"
        :key="camera.id"
        :value="camera.id"
      >{{ camera.label }}</option>
    </select>
  </div>
</template>
