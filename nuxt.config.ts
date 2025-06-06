// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ["@prisma/nuxt", '@nuxt/ui', '@nuxt/icon'],
  css: ['~/public/assets/css/main.css']
})
