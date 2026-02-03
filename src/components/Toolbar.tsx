import { LAST_UPDATED } from '@/constants/siteMetadata'
import { Box, Button, PaletteMode, Skeleton, Switch, Typography } from '@mui/material'
import { ChartModal } from '@/components/charts/ChartModal'
import { ExportButton } from '@/components/ExportButton'
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarQuickFilter
} from '@mui/x-data-grid-pro'
import { Row } from '@/types/row'
import { useLoadingContext } from '@/hooks/useLoadingContext'
import { useQuickFilterTracking } from '@/hooks/useQuickFilterTracking'
import { useWindowResizeEffect } from '@/hooks/useWindowResizeEffect'
import { useState } from 'react'
import BarChartIcon from '@mui/icons-material/BarChart'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'

interface ToolbarProps {
  paletteMode: PaletteMode
  rows: Row[]
  setPaletteMode: (paletteMode: PaletteMode) => void
}

export const Toolbar = ({ paletteMode, setPaletteMode, rows }: ToolbarProps) => {
  const { isLoading } = useLoadingContext()
  const [isChartModalOpen, setIsChartModalOpen] = useState(false)

  const quickFilterRef = useQuickFilterTracking()

  const handleChartModalClose = () => setIsChartModalOpen(false)

  const handleChartModalOpen = () => setIsChartModalOpen(true)

  const handlePaletteModeToggle = () => setPaletteMode(paletteMode === 'light' ? 'dark' : 'light')

  useWindowResizeEffect(
    width => width < 1200 && isChartModalOpen,
    () => setIsChartModalOpen(false)
  )

  return (
    <GridToolbarContainer sx={{ pb: 0.5 }}>
      <Box
        sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' }}
      >
        <Box>
          <Typography sx={{ fontSize: { xs: 18, sm: 20 }, pl: 0.75 }} variant="h6">
            Hawaii Attorney Database
          </Typography>

          <Typography
            sx={{
              color: 'text.secondary',
              display: { xs: 'none', sm: 'block' },
              fontSize: { xs: 11, sm: 12 },
              pl: 0.75
            }}
            variant="body2"
          >
            Last updated: {LAST_UPDATED}
          </Typography>
        </Box>

        <Box sx={{ alignItems: 'center', display: 'flex', gap: 0.5, pr: 0.25 }}>
          <DarkModeIcon sx={{ fontSize: { xs: 16, sm: 20 }, opacity: paletteMode === 'dark' ? 1 : 0.25 }} />

          <Switch
            checked={paletteMode === 'light'}
            inputProps={{ 'aria-label': `Switch to ${paletteMode === 'light' ? 'dark' : 'light'} mode` }}
            onChange={handlePaletteModeToggle}
            size="small"
          />

          <LightModeIcon sx={{ fontSize: { xs: 16, sm: 20 }, opacity: paletteMode === 'light' ? 1 : 0.25 }} />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'space-between', pl: 0.25, width: '100%' }}>
        {isLoading ? (
          <Skeleton sx={{ height: { xs: 28, sm: 30 }, m: 0.25, width: { xs: 300, lg: 400 } }} />
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <GridToolbarColumnsButton />

            <GridToolbarFilterButton />

            <Button
              color="primary"
              onClick={handleChartModalOpen}
              size="small"
              startIcon={<BarChartIcon />}
              sx={{ display: { xs: 'none', lg: 'inline-flex' } }}
            >
              Charts
            </Button>

            <ExportButton />
          </Box>
        )}

        <Box ref={quickFilterRef}>
          <GridToolbarQuickFilter
            disabled={isLoading}
            sx={{ width: { xs: 300, md: 350, lg: 400 }, '& .MuiInputBase-root': { fontSize: { xs: 14, md: 16 } } }}
          />
        </Box>
      </Box>

      <ChartModal isOpen={isChartModalOpen} onClose={handleChartModalClose} paletteMode={paletteMode} rows={rows} />
    </GridToolbarContainer>
  )
}
