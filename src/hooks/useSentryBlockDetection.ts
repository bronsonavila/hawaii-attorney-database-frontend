import { useContext } from 'react'
import { SentryBlockContext } from '../contexts/SentryBlockContext'

export const useSentryBlockDetection = () => {
  const context = useContext(SentryBlockContext)

  if (context === undefined) {
    throw new Error('useSentryBlockDetection must be used within a SentryBlockProvider')
  }

  return context
}
