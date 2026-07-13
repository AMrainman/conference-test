<script setup lang="ts">
import Toolbar from '@/shared/components/Toolbar.vue'

interface Props {
  micOn?: boolean
  videoOn?: boolean
  beautyLevel?: 'off' | 'low' | 'medium' | 'high'
  blurLevel?: 'off' | 'low' | 'medium' | 'high'
}

withDefaults(defineProps<Props>(), {
  micOn: true,
  videoOn: true,
  beautyLevel: 'off',
  blurLevel: 'off',
})

const emit = defineEmits<{
  toggleMic: []
  toggleVideo: []
  toggleSidebar: []
  leave: []
  'update:beautyLevel': [level: 'off' | 'low' | 'medium' | 'high']
  'update:blurLevel': [level: 'off' | 'low' | 'medium' | 'high']
}>()
</script>

<template>
  <Toolbar
    :mic-on="micOn"
    :video-on="videoOn"
    :beauty-level="beautyLevel"
    :blur-level="blurLevel"
    @toggle-mic="emit('toggleMic')"
    @toggle-video="emit('toggleVideo')"
    @toggle-sidebar="emit('toggleSidebar')"
    @leave="emit('leave')"
    @update:beauty-level="emit('update:beautyLevel', $event)"
    @update:blur-level="emit('update:blurLevel', $event)"
  />
</template>
