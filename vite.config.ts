
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
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // Intelligent chunk splitting for better caching
        manualChunks: (id) => {
          // Keep React, Radix UI and core libraries in main bundle to avoid context/component issues
          if (id.includes('node_modules')) {
            // Heavy libraries that are not critical for initial load
            if (id.includes('recharts') || id.includes('date-fns')) {
              return 'heavy-vendor';
            }
            // Core UI libraries - keep together for context sharing
            if (id.includes('@radix-ui') || id.includes('react-hook-form')) {
              return 'ui-vendor';
            }
            // Other node_modules - keep smaller chunks
            if (id.includes('i18next') || id.includes('lucide-react')) {
              return 'vendor';
            }
            // React Query and state management
            if (id.includes('@tanstack') || id.includes('zustand')) {
              return 'state-vendor';
            }
          }
          // Separate chunk for translations
          if (id.includes('translations/')) {
            return 'translations';
          }
        },
        // Ensures all assets use relative paths
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
    },
    // Ensure we don't use absolute paths in builds
    assetsInlineLimit: 4096, // Inline small assets
    chunkSizeWarningLimit: 800, // Lower warning threshold for Chrome extension
    // Disable source maps for production
    sourcemap: false,
    // Minimize bundle size
    minify: 'esbuild',
    // Target modern browsers that support ES modules
    target: 'es2020',
    // Optimize assets
    reportCompressedSize: false, // Faster builds
    cssCodeSplit: true, // Split CSS for better caching
    // Additional optimizations
    emptyOutDir: true,
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      'react-router-dom',
      '@tanstack/react-query',
      'i18next',
      'i18next-browser-languagedetector',
      'zustand'
    ],
    exclude: [
      // Exclude large libraries that should be lazy loaded
      'recharts',
      // Keep React and Radix UI in main bundle to avoid context/component issues
      'react',
      'react-dom'
    ],
    esbuildOptions: {
      jsx: 'automatic',
    },
  },
}));
