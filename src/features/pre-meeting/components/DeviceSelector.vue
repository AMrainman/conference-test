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
    <label for="camera-select" class="text-sm font-medium text-text-secondary">摄像头</label>
    <select
      id="camera-select"
      v-model="selectedCamera"
      class="w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:border-primary focus:ring-primary"
    >
      <option v-for="camera in cameras" :key="camera.id" :value="camera.id">{{ camera.label }}</option>
    </select>
  </div>
</template>
