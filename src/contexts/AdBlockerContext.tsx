import React, { createContext, useState, useEffect, ReactNode } from 'react'
import { useDetectAdBlock } from 'adblock-detect-react'

interface AdBlockerContextType {
  isAdBlockDetected: boolean | null
}

export const AdBlockerContext = createContext<AdBlockerContextType | undefined>(undefined)

export const AdBlockerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAdBlockDetected, setIsAdBlockDetected] = useState<boolean | null>(null)
  const adBlockDetected = useDetectAdBlock()

  useEffect(() => {
    setIsAdBlockDetected(adBlockDetected)
  }, [adBlockDetected])

  return <AdBlockerContext.Provider value={{ isAdBlockDetected }}>{children}</AdBlockerContext.Provider>
}
