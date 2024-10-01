import { createContext, Dispatch, FC, ReactNode, SetStateAction, useState } from 'react'

interface LoadingContextType {
  isLoading: boolean
  setIsLoading: Dispatch<SetStateAction<boolean>>
}

export const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export const LoadingProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)

  return <LoadingContext.Provider value={{ isLoading, setIsLoading }}>{children}</LoadingContext.Provider>
}
