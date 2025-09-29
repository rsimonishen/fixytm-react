import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        target: 'es2018',
        sourcemap: true,
        lib: {
            entry: './src/main.tsx',
            name: 'FIXYTMReact',
            formats: ['iife'],
            fileName: () => `fixytm-react.js`
        }
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify('production')
    }
})
