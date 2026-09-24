import { defineConfig } from "vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import { nitro } from "nitro/vite";

import viteReact from "@vitejs/plugin-react";

import tailwindcss from "@tailwindcss/vite";


export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },

  server: {
    host: true,
    port: 8080,
    strictPort: true,
  },

  plugins: [
    tanstackStart({
      spa: {
        enabled: true,
      },
    }),

    nitro(),

    viteReact(),

    tailwindcss(),
  ],
  
});