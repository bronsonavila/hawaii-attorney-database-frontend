import './index.css'
import { createRoot } from 'react-dom/client'
import { LoadingProvider } from './contexts/LoadingContext.tsx'
import { StrictMode } from 'react'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LoadingProvider>
      <App />
    </LoadingProvider>
  </StrictMode>
)
