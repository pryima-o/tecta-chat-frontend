import path from 'node:path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
   server: {
    port: 2560
  },
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      strategies: "injectManifest",
      srcDir: "src",
      filename: "service-worker.ts",

      manifest: {
        name: "Tecta",
        short_name: "Tecta",
        description: "Secure messaging application",
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
        start_url: "/",
        scope: "/",

        icons: [
          {
            src: "/assets/img/logo.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/assets/img/logo.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/assets/img/logo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
