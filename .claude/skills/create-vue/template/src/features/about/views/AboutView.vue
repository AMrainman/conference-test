<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from '@/shared/components/Button.vue'

const router = useRouter()

function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="mx-auto flex max-w-5xl flex-col px-4 py-6">
    <header class="mb-8 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-text">关于</h1>
    </header>

    <main class="flex flex-col gap-8">
      <p class="text-text-secondary">这是基于 Vue 3 + TypeScript + Vite 的项目骨架。</p>
      <Button variant="secondary" @click="goBack">返回首页</Button>
    </main>
  </div>
</template>
