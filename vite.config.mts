import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nngqibikdpbocptdzhre.supabase.co'),
      'process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_0hS5AVJnBno5yIPLW63k_Q__HKrLweK'),
      'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL || 'https://nngqibikdpbocptdzhre.supabase.co'),
      'process.env.SUPABASE_PUBLISHABLE_KEY': JSON.stringify(process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_0hS5AVJnBno5yIPLW63k_Q__HKrLweK'),
    },
    build: {
      target: 'esnext',
      outDir: 'dist'
    }
  };
});