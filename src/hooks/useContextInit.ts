import { Context, useContext } from 'react'

export const useContextInit = <T>(ContextComponent: Context<T | null>) => {
  const context = useContext(ContextComponent)

  if (context === null) {
    throw new Error()
  }

  return context
}
