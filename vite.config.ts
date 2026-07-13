import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import basicSsl from '@vitejs/plugin-basic-ssl'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    vue(),
    basicSsl(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
      dirs: ['src/shared/composables', 'src/shared/stores', 'src/shared/utils'],
      vueTemplate: true,
      eslintrc: {
        enabled: true,
      },
    }),
    Components({
      dirs: ['src/shared/components'],
      dts: 'src/components.d.ts',
      deep: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: true,
    https: true,
  },
})
