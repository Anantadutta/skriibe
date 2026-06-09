import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Analytics } from '@vercel/analytics/react' // 1. Import the package

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Analytics /> {/* 2. Inject it below the App */}
  </StrictMode>,
)