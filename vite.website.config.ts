import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    base: '',
    root: "./website",
    build: {
        outDir: './prod',
        sourcemap: true,
        assetsDir: 'assets/',
        rollupOptions: {
            input: {
                index: '/home/cloakf4ce/projects/fixytm-react/website/index.html',
                demo: '/home/cloakf4ce/projects/fixytm-react/website/tryitout.html',
                privacy: '/home/cloakf4ce/projects/fixytm-react/website/privacypolicy.html',
            }
        }
    },
})