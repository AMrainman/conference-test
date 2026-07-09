<script setup lang="ts">
import Avatar from '@/shared/components/Avatar.vue'

interface Props {
  displayName: string
}

defineProps<Props>()
</script>

<template>
  <div class="@container w-full">
    <div
      class="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-slate-900"
    >
      <Avatar :name="displayName" size="lg" />
      <span
        class="absolute bottom-4 left-4 text-sm font-medium text-white"
      >{{ displayName }}</span>
    </div>
  </div>
</template>
