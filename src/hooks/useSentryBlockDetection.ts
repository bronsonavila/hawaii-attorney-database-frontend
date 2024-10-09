import { SentryBlockContext } from '../contexts/SentryBlockContext'
import { useContextInit } from './useContextInit'

export const useSentryBlockDetection = () => useContextInit(SentryBlockContext)
