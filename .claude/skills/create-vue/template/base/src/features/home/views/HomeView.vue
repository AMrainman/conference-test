<script setup lang="ts">
import { useRouter } from 'vue-router'
import ThemeToggle from '@/shared/components/ThemeToggle.vue'
import Button from '@/shared/components/Button.vue'

const router = useRouter()

function goToAbout() {
  router.push('/about')
}
</script>

<template>
  <div class="mx-auto flex max-w-5xl flex-col px-4 py-6">
    <header class="mb-8 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-text">首页</h1>
      <ThemeToggle />
    </header>

    <main class="flex flex-col gap-8">
      <p class="text-text-secondary">欢迎来到 Vue 项目骨架。</p>
      <Button @click="goToAbout">关于</Button>
    </main>
  </div>
</template>
