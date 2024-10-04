import { AdBlockerContext } from '../contexts/AdBlockerContext'
import { useContext } from 'react'

export const useAdBlockerDetection = () => {
  const context = useContext(AdBlockerContext)

  if (context === undefined) {
    throw new Error('useAdBlockerDetection must be used within an AdBlockerProvider')
  }

  return context
}
