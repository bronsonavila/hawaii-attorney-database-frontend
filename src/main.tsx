import './index.css'
import { SentryBlockProvider } from './contexts/SentryBlockContext.tsx'
import { App } from './App.tsx'
import { createRoot } from 'react-dom/client'
import { LicenseInfo } from '@mui/x-license'
import { LoadingProvider } from './contexts/LoadingContext.tsx'
import { StrictMode } from 'react'
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'https://cfa453de82d1586384a65e9ee14bd276@o4508061209395200.ingest.us.sentry.io/4508061234102272',
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  tracesSampleRate: 1.0
})

// See: https://mui.com/x/introduction/licensing/#license-key-security
LicenseInfo.setLicenseKey(
  window.atob(
    'YmZmNzk0ZTg0ZTk1MWIyNzMwNGY1YjJiYTQ0NTY2OGZUejA1T1RFM055eEZQVEUzTlRrME16UXpOell3TURBc1V6MXdjbThzVEUwOWNHVnljR1YwZFdGc0xGQldQVkV6TFRJd01qUXNTMVk5TWc9PQ=='
  )
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SentryBlockProvider>
      <LoadingProvider>
        <App />
      </LoadingProvider>
    </SentryBlockProvider>
  </StrictMode>
)
