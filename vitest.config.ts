import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'build', '.replit', 'server/**', '.cache/**', '**/node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['client/**/*.{ts,tsx}', 'shared/**/*.ts'],
      exclude: [
        'node_modules/',
        'dist/',
        'test/',
        'server/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
      ],
      all: false,
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70,
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client'),
      '@shared': path.resolve(__dirname, './shared'),
      '@/assets': path.resolve(__dirname, './client/assets'),
      '@test': path.resolve(__dirname, './test'),
    },
  },
});
