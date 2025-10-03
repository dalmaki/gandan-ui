import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@dalmaki/gandan/index'
import App from './App.tsx'

createRoot(document.getElementById('Root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
