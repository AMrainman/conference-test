<script setup lang="ts">
import Toolbar from '@/shared/components/Toolbar.vue'

interface Props {
  micOn?: boolean
  videoOn?: boolean
  beautyLevel?: 'off' | 'low' | 'medium' | 'high'
  blurLevel?: 'off' | 'low' | 'medium' | 'high'
  videoQuality?: 'fluent' | 'sd' | 'hd'
}

withDefaults(defineProps<Props>(), {
  micOn: true,
  videoOn: true,
  beautyLevel: 'off',
  blurLevel: 'off',
  videoQuality: 'hd',
})

const emit = defineEmits<{
  toggleMic: []
  toggleVideo: []
  toggleSidebar: []
  leave: []
  'update:beautyLevel': [level: 'off' | 'low' | 'medium' | 'high']
  'update:blurLevel': [level: 'off' | 'low' | 'medium' | 'high']
  'update:videoQuality': [level: 'fluent' | 'sd' | 'hd' | 'hdplus']
}>()
</script>

<template>
  <Toolbar
    :mic-on="micOn"
    :video-on="videoOn"
    :beauty-level="beautyLevel"
    :blur-level="blurLevel"
    :video-quality="videoQuality"
    @toggle-mic="emit('toggleMic')"
    @toggle-video="emit('toggleVideo')"
    @toggle-sidebar="emit('toggleSidebar')"
    @leave="emit('leave')"
    @update:beauty-level="emit('update:beautyLevel', $event)"
    @update:blur-level="emit('update:blurLevel', $event)"
    @update:video-quality="emit('update:videoQuality', $event)"
  />
</template>
