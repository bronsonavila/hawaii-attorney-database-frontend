import { createContext, Dispatch, ReactNode, SetStateAction, useState } from 'react'

interface LoadingContextType {
  isLoading: boolean
  setIsLoading: Dispatch<SetStateAction<boolean>>
}

export const LoadingContext = createContext<LoadingContextType | null>(null)

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true)

  return <LoadingContext.Provider value={{ isLoading, setIsLoading }}>{children}</LoadingContext.Provider>
}
