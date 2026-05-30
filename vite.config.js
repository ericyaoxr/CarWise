import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: 'CarWise',
                short_name: 'CarWise',
                description: '新能源车主私人管家',
                theme_color: '#3a245f',
                background_color: '#f3f5f7',
                display: 'standalone',
                scope: '/',
                start_url: '/',
            },
        }),
    ],
});
