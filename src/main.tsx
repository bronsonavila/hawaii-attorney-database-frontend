import './index.css'
import { App } from './App.tsx'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { LicenseInfo } from '@mui/x-license'
import { LoadingProvider } from './contexts/LoadingContext.tsx'
import { StrictMode } from 'react'

// See: https://mui.com/x/introduction/licensing/#license-key-security
LicenseInfo.setLicenseKey(
  window.atob(
    'YmZmNzk0ZTg0ZTk1MWIyNzMwNGY1YjJiYTQ0NTY2OGZUejA1T1RFM055eEZQVEUzTlRrME16UXpOell3TURBc1V6MXdjbThzVEUwOWNHVnljR1YwZFdGc0xGQldQVkV6TFRJd01qUXNTMVk5TWc9PQ=='
  )
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <LoadingProvider>
        <App />
      </LoadingProvider>
    </HelmetProvider>
  </StrictMode>
)
