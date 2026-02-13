// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ["@vee-validate/nuxt", "@pinia/nuxt"],
  css: [
    "~/assets/css/bootstrap-custom.scss",
    "~/assets/css/main.css"
  ],
  nitro: {
    experimental: {
      database: true,
    },

    database: {
      default: {
        connector: "mysql2",
        options: {
          database: "filc",
          user: "root",
          password: ""
        }
      }
    }
  },
  app: {
    head: {
      title: 'Filc',
      htmlAttrs: {
        lang: 'hu',
      },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },
})