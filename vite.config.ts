
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // componentTagger() removed due to missing definition
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize for Chrome extension
    outDir: 'dist',
    // Use relative paths for assets in production build
    assetsDir: '',
    rollupOptions: {
      output: {
        manualChunks: undefined,
        // Ensures all assets use relative paths
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      },
    },
    // Ensure we don't use absolute paths in builds
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1600,
  },
  // Allow importing different file types
  optimizeDeps: {
    esbuildOptions: {
      jsx: 'automatic',
    },
  },
}));
