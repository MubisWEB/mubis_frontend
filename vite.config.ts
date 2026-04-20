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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/');

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
          if (id.includes('react-dom') || id.includes('react-router-dom') || id.includes('/react/')) return 'vendor-react';
          if (id.includes('@tanstack/react-query') || id.includes('axios') || id.includes('socket.io-client')) return 'vendor-data';
          if (id.includes('framer-motion') || id.includes('@hello-pangea/dnd')) return 'vendor-motion';
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) return 'vendor-forms';
          if (id.includes('date-fns') || id.includes('moment') || id.includes('lodash')) return 'vendor-utils';
          if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
          if (id.includes('@radix-ui') || id.includes('lucide-react')) return 'vendor-ui';
          if (id.includes('leaflet') || id.includes('react-leaflet')) return 'vendor-maps';
          if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('react-quill')) return 'vendor-docs';
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
