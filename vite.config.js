import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' keeps asset URLs relative so the built site works from any
// path (GitHub Pages project pages, Netlify, S3 subfolders, etc.)
export default defineConfig({
  base: './',
  plugins: [react()],
});
