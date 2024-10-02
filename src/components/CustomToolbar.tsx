import { Box, Typography, Switch, PaletteMode, Skeleton } from '@mui/material'
import { FC } from 'react'
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarQuickFilter
} from '@mui/x-data-grid-pro'
import { useLoadingContext } from '../contexts/useLoadingContext'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'

interface CustomToolbarProps {
  paletteMode: PaletteMode
  setPaletteMode: (paletteMode: PaletteMode) => void
}

export const CustomToolbar: FC<CustomToolbarProps> = ({ paletteMode, setPaletteMode }) => {
  const { isLoading } = useLoadingContext()

  const handleModeToggle = () => setPaletteMode(paletteMode === 'light' ? 'dark' : 'light')

  return (
    <GridToolbarContainer sx={{ pr: 0, py: 0.5 }}>
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          px: 0.5,
          width: '100%'
        }}
      >
        <Typography sx={{ fontSize: { xs: 18, sm: 20 }, pl: 0.25 }} variant="h6">
          Hawaii Attorney Database
        </Typography>

        <Box sx={{ alignItems: 'center', display: 'flex', gap: 0.5, pr: 0.25 }}>
          <DarkModeIcon sx={{ fontSize: { xs: 16, sm: 20 }, opacity: paletteMode === 'dark' ? 1 : 0.25 }} />

          <Switch checked={paletteMode === 'light'} onChange={handleModeToggle} size="small" />

          <LightModeIcon sx={{ fontSize: { xs: 16, sm: 20 }, opacity: paletteMode === 'light' ? 1 : 0.25 }} />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'space-between', pl: 0.25, width: '100%' }}>
        {isLoading ? (
          <Skeleton sx={{ height: { xs: 28, sm: 30 }, m: 0.25, width: 300 }} />
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <GridToolbarColumnsButton />

            <GridToolbarFilterButton />

            <GridToolbarExport />
          </Box>
        )}

        <GridToolbarQuickFilter
          disabled={isLoading}
          sx={{ width: { xs: 300, xl: 400 }, '& .MuiInputBase-root': { fontSize: { xs: 14, md: 16 } } }}
        />
      </Box>
    </GridToolbarContainer>
  )
}
