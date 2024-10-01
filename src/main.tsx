import './index.css'
import { App } from './App.tsx'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { LoadingProvider } from './contexts/LoadingContext.tsx'
import { StrictMode } from 'react'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <LoadingProvider>
        <App />
      </LoadingProvider>
    </HelmetProvider>
  </StrictMode>
)
