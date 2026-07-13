<script setup lang="ts">
import ThemeToggle from '@/shared/components/ThemeToggle.vue'
</script>

<template>
  <div class="mx-auto flex max-w-5xl flex-col px-4 py-6">
    <header class="mb-8 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-text">关于</h1>
      <ThemeToggle />
    </header>

    <main class="flex flex-col gap-8">
      <p class="text-text-secondary">这是基于 Vue 3 + TypeScript + Vite 的项目骨架。</p>
    </main>
  </div>
</template>
