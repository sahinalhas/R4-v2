import "dotenv/config";
import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
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
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react-core';
            }
            if (id.includes('react-router')) {
              return 'vendor-react-router';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            if (id.includes('@tanstack/react-virtual')) {
              return 'vendor-virtual';
            }
            if (id.includes('@radix-ui')) {
              const component = id.match(/@radix-ui\/react-([^/]+)/)?.[1];
              if (component) {
                const commonComponents = ['slot', 'primitive', 'use-callback-ref', 'use-controllable-state', 'use-layout-effect', 'use-escape-keydown', 'use-rect'];
                if (commonComponents.includes(component)) {
                  return 'vendor-radix-core';
                }
                const frequentComponents = ['dialog', 'dropdown-menu', 'select', 'toast', 'tabs'];
                if (frequentComponents.includes(component)) {
                  return 'vendor-radix-frequent';
                }
                return `vendor-radix-${component}`;
              }
              return 'vendor-radix-core';
            }
            if (id.includes('recharts')) {
              return 'charts';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('react-markdown') || id.includes('remark') || id.includes('rehype') || id.includes('react-syntax-highlighter')) {
              return 'markdown';
            }
            if (id.includes('date-fns')) {
              return 'vendor-date';
            }
            if (id.includes('framer-motion')) {
              return 'animation';
            }
            if (id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'vendor-forms';
            }
            if (id.includes('xlsx') || id.includes('jspdf')) {
              return 'export';
            }
            if (id.includes('zod')) {
              return 'vendor-validation';
            }
            if (id.includes('node_modules')) {
              return 'vendor-common';
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
  plugins: [
    react(),
    expressPlugin(),
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: 'bundle-analysis.html',
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
      "@/assets": path.resolve(__dirname, "./client/assets"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      // Lazy-load Express app only when a request comes in
      let expressApp: any = null;
      let isInitializing = false;
      
      server.middlewares.use(async (req, res, next) => {
        // Skip initialization for Vite's internal requests
        if (req.url?.startsWith('/@') || req.url?.includes('node_modules')) {
          return next();
        }
        
        if (!expressApp && !isInitializing) {
          isInitializing = true;
          try {
            const { createServer } = await import('./server/index.js');
            expressApp = createServer();
            
            // Start schedulers after Express app is ready
            Promise.all([
              import('./server/features/analytics/services/analytics-scheduler.service.js')
                .then(({ startAnalyticsScheduler }) => startAnalyticsScheduler()),
              import('./server/features/counseling-sessions/services/auto-complete-scheduler.service.js')
                .then(({ startAutoCompleteScheduler }) => startAutoCompleteScheduler()),
              import('./server/services/daily-action-plan-scheduler.service.js')
                .then(({ startDailyActionPlanScheduler }) => startDailyActionPlanScheduler())
            ]).catch((error) => {
              console.error('Failed to start schedulers:', error);
            });
          } catch (error) {
            console.error('Failed to initialize Express app:', error);
            isInitializing = false;
            return next();
          }
        }
        
        if (expressApp) {
          expressApp(req, res, next);
        } else {
          // Still initializing, wait a bit
          setTimeout(() => {
            if (expressApp) {
              expressApp(req, res, next);
            } else {
              next();
            }
          }, 100);
        }
      });
    },
  };
}
