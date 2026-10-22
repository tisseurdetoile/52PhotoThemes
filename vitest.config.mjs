import { mergeConfig } from 'vite'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default mergeConfig(
  defineConfig({
    plugins: [vue()],
    test: {
      environment: 'jsdom'
    }
  })
)
