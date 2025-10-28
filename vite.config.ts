import "dotenv/config";
import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true,
    hmr: {
      clientPort: 443,
      protocol: 'wss',
      host: process.env.REPLIT_DEV_DOMAIN || 'localhost'
    },
    fs: {
      allow: [".", "./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
    minify: mode === 'production' ? 'esbuild' : false,
    target: 'es2021',
    cssCodeSplit: true,
    cssMinify: mode === 'production',
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('@tanstack/react-query') || id.includes('@tanstack/react-virtual')) {
              return 'vendor-query';
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('react-markdown') || id.includes('remark') || id.includes('rehype') || id.includes('react-syntax-highlighter')) {
              return 'vendor-markdown';
            }
            if (id.includes('date-fns')) {
              return 'vendor-date';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-animation';
            }
            if (id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'vendor-forms';
            }
            if (id.includes('xlsx') || id.includes('jspdf')) {
              return 'vendor-export';
            }
          }
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.');
          const ext = info?.[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/woff2?|ttf|eot/i.test(ext || '')) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    chunkSizeWarningLimit: 2000,
    sourcemap: mode === 'development',
    reportCompressedSize: mode === 'production',
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);
      
      // Start analytics scheduler in development mode
      import('./server/features/analytics/services/analytics-scheduler.service.js')
        .then(({ startAnalyticsScheduler }) => {
          startAnalyticsScheduler();
        })
        .catch((error) => {
          console.error('Failed to start analytics scheduler:', error);
        });
      
      // Start auto-complete scheduler in development mode
      import('./server/features/counseling-sessions/services/auto-complete-scheduler.service.js')
        .then(({ startAutoCompleteScheduler }) => {
          startAutoCompleteScheduler();
        })
        .catch((error) => {
          console.error('Failed to start auto-complete scheduler:', error);
        });
      
      // Start daily action plan scheduler in development mode
      import('./server/services/daily-action-plan-scheduler.service.js')
        .then(({ startDailyActionPlanScheduler }) => {
          startDailyActionPlanScheduler();
        })
        .catch((error) => {
          console.error('Failed to start daily action plan scheduler:', error);
        });
    },
  };
}
