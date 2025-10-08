import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // já existiam
      '/met': {
        target: 'https://collectionapi.metmuseum.org/public/collection/v1',
        changeOrigin: true,
        rewrite: function (path) { return path.replace(/^\/met/, ''); }
      },
      '/aic': {
        target: 'https://api.artic.edu/api/v1',
        changeOrigin: true,
        rewrite: function (path) { return path.replace(/^\/aic/, ''); }
      },
      // novo: harvard
      '/harvard': {
        target: 'https://api.harvardartmuseums.org', // novo
        changeOrigin: true,                           // novo
        rewrite: function (path) { return path.replace(/^\/harvard/, ''); } // novo
      }
    }
  }
})


// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
