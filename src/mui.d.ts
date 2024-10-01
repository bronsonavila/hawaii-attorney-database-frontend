import { ComponentsOverrides, ComponentsProps, ComponentsVariants } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Components {
    [key: string]: {
      defaultProps?: ComponentsProps[keyof ComponentsProps]
      styleOverrides?: ComponentsOverrides<Theme>[keyof ComponentsOverrides<Theme>]
      variants?: ComponentsVariants[keyof ComponentsVariants]
    }
  }
}

export {}
