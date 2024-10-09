import { createContext, FC, ReactNode, useState, useEffect } from 'react'

interface SentryBlockContextType {
  isSentryBlocked: boolean | null
}

interface SentryBlockProviderProps {
  children: ReactNode
}

interface SentryRequest extends PerformanceResourceTiming {
  responseStatus?: number // Optional because it's not available in Safari.
}

export const SentryBlockContext = createContext<SentryBlockContextType | null>(null)

export const SentryBlockProvider: FC<SentryBlockProviderProps> = ({ children }) => {
  const [isSentryBlocked, setIsSentryBlocked] = useState<boolean | null>(null)
  const sentryUrlPattern = /sentry\.io\/api\/.+\/envelope/

  useEffect(() => {
    if (isSentryBlocked !== null) return

    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries()
      const sentryRequest = entries.find(entry => sentryUrlPattern.test(entry.name)) as SentryRequest | undefined

      if (sentryRequest) {
        setIsSentryBlocked(sentryRequest.responseStatus === 0 || sentryRequest.duration < 10)

        observer.disconnect()
      }
    })

    observer.observe({ buffered: true, type: 'resource' })

    return () => observer.disconnect()
  }, [isSentryBlocked])

  return <SentryBlockContext.Provider value={{ isSentryBlocked }}>{children}</SentryBlockContext.Provider>
}
