import { PaletteMode, useMediaQuery } from '@mui/material'
import { useEffect, useState } from 'react'

export const usePaletteMode = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const [paletteMode, setPaletteMode] = useState<PaletteMode>(() => {
    try {
      return (localStorage.getItem('theme') as PaletteMode) || (prefersDarkMode ? 'dark' : 'light')
    } catch {
      return prefersDarkMode ? 'dark' : 'light'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('theme', paletteMode)
    } catch {
      // `localStorage` access denied – silently fail.
    }
  }, [paletteMode])

  return { paletteMode, setPaletteMode }
}
