import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from 'react-query'
import App from './App'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)

// Register service worker for PWA (auto-update)
// Expose update hooks on window so components can prompt the user
window.__swNeedsRefresh = false
window.__updateSW = null
const updateSW = registerSW({
  onNeedRefresh() {
    window.__swNeedsRefresh = true
    window.dispatchEvent(new CustomEvent('sw:need-refresh'))
  },
  onOfflineReady() {
    window.dispatchEvent(new CustomEvent('sw:offline-ready'))
  }
})
window.__updateSW = updateSW