import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base './' để deploy được lên GitHub Pages / bất kỳ subpath nào
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    // rapier (physics) nhúng wasm base64 ~3MB, đã lazy-load cùng cảnh 3D
    chunkSizeWarningLimit: 4000,
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@dimforge') || id.includes('rapier')) return 'physics'
          // WebGPU/TSL chỉ dùng cho arcade → tách riêng để hero không phải tải
          if (/three\.(webgpu|tsl)/.test(id)) return 'three-webgpu'
          if (id.includes('three') || id.includes('postprocessing')) return 'three'
        },
      },
    },
  },
})
