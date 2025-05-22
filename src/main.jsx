import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'

// Register service worker with periodic updates
const updateSW = registerSW({
  onNeedRefresh() {
    // When a new version is available and needs refresh
    if (confirm('Nueva versión disponible. ¿Recargar para actualizar?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('La aplicación está lista para uso sin conexión')
  },
  onRegistered(r) {
    console.log('Service worker registrado correctamente')
    
    // Check for updates every hour if the app is open that long
    if (import.meta.env.PROD) {
      setInterval(() => {
        r?.update()
      }, 60 * 60 * 1000)
    }
  },
  onRegisterError(error) {
    console.error('Error al registrar service worker:', error)
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
