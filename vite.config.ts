import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/');

          // App code — split by route for lazy loading
          if (!normalizedId.includes('node_modules')) {
            if (normalizedId.includes('/src/pages/Admin')) return 'pages-admin';
            if (
              normalizedId.includes('/src/pages/Comprar') ||
              normalizedId.includes('/src/pages/DetalleSubasta') ||
              normalizedId.includes('/src/pages/MisSubastas') ||
              normalizedId.includes('/src/pages/Ganados') ||
              normalizedId.includes('/src/pages/Guardadas')
            ) return 'pages-auctions';
            if (
              normalizedId.includes('/src/pages/Peritaje') ||
              normalizedId.includes('/src/pages/HistorialPeritaje')
            ) return 'pages-inspections';
            if (
              normalizedId.includes('/src/pages/Soporte') ||
              normalizedId.includes('/src/pages/Ayuda') ||
              normalizedId.includes('/src/pages/Partners')
            ) return 'pages-support';
            if (normalizedId.includes('/src/pages/')) return 'pages-core';
            if (normalizedId.includes('/src/components/')) return 'app-components';
            return undefined;
          }
          if (
            normalizedId.includes('/node_modules/react/') ||
            normalizedId.includes('/node_modules/react-dom/') ||
            normalizedId.includes('/node_modules/react-router-dom/') ||
            normalizedId.includes('/node_modules/@tanstack/')
          ) return 'vendor-react';
          if (
            normalizedId.includes('/node_modules/@radix-ui/') ||
            normalizedId.includes('/node_modules/lucide-react/') ||
            normalizedId.includes('/node_modules/class-variance-authority/') ||
            normalizedId.includes('/node_modules/tailwind-merge/')
          ) return 'vendor-ui';
          if (normalizedId.includes('/node_modules/framer-motion/')) return 'vendor-motion';
          if (
            normalizedId.includes('/node_modules/recharts/') ||
            normalizedId.includes('/node_modules/d3-')
          ) return 'vendor-charts';
          if (
            normalizedId.includes('/node_modules/axios/') ||
            normalizedId.includes('/node_modules/date-fns/') ||
            normalizedId.includes('/node_modules/lodash/') ||
            normalizedId.includes('/node_modules/moment/') ||
            normalizedId.includes('/node_modules/zod/')
          ) return 'vendor-utils';
          return 'vendor';
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
