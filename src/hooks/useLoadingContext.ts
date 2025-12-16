import { LoadingContext } from '@/contexts/LoadingContext'
import { useContextInit } from './useContextInit'

export const useLoadingContext = () => useContextInit(LoadingContext)
