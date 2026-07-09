<script setup lang="ts">
import Toolbar from '@/shared/components/Toolbar.vue'

interface Props {
  micOn?: boolean
  videoOn?: boolean
}

withDefaults(defineProps<Props>(), { micOn: true, videoOn: true })

const emit = defineEmits<{
  toggleMic: []
  toggleVideo: []
  toggleSidebar: []
  leave: []
}>()
</script>

<template>
  <Toolbar
    :mic-on="micOn"
    :video-on="videoOn"
    @toggle-mic="emit('toggleMic')"
    @toggle-video="emit('toggleVideo')"
    @toggle-sidebar="emit('toggleSidebar')"
    @leave="emit('leave')"
  />
</template>
