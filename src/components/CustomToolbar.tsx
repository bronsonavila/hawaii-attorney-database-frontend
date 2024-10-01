import { Box, Typography, Switch, PaletteMode } from '@mui/material'
import { FC } from 'react'
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarQuickFilter
} from '@mui/x-data-grid'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'

interface CustomToolbarProps {
  paletteMode: PaletteMode
  setPaletteMode: (paletteMode: PaletteMode) => void
}

export const CustomToolbar: FC<CustomToolbarProps> = ({ paletteMode, setPaletteMode }) => {
  const handleModeToggle = () => setPaletteMode(paletteMode === 'light' ? 'dark' : 'light')

  return (
    <GridToolbarContainer sx={{ p: 0.5 }}>
      <Box
        sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' }}
      >
        <Typography sx={{ fontSize: { xs: 16, sm: 20 }, pl: 0.5 }} variant="h6">
          Hawaii Attorney Database
        </Typography>

        <Box sx={{ alignItems: 'center', display: 'flex', gap: 0.5 }}>
          <DarkModeIcon sx={{ fontSize: { xs: 16, sm: 20 }, opacity: paletteMode === 'dark' ? 1 : 0.25 }} />

          <Switch checked={paletteMode === 'light'} onChange={handleModeToggle} size="small" />

          <LightModeIcon sx={{ fontSize: { xs: 16, sm: 20 }, opacity: paletteMode === 'light' ? 1 : 0.25 }} />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'space-between', width: '100%' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <GridToolbarColumnsButton />

          <GridToolbarFilterButton />

          <GridToolbarExport />
        </Box>

        <GridToolbarQuickFilter
          sx={{
            width: { xs: 'auto', md: 250, lg: 300, xl: 400 },
            '& .MuiInputBase-root': { fontSize: { xs: 14, md: 16 } }
          }}
        />
      </Box>
    </GridToolbarContainer>
  )
}
