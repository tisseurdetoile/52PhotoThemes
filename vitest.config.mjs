import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.mjs'

// Reprend la config de Vite (plugin Vue, etc.) et y ajoute l'environnement de test
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom'
    }
  })
)
