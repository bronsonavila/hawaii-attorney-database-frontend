import { Box, Typography, Switch, PaletteMode, Skeleton, Button } from '@mui/material'
import { createSvgIcon } from '@mui/material/utils'
import { FC } from 'react'
import {
  GridCsvGetRowsToExportParams,
  gridExpandedSortedRowIdsSelector,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
  useGridApiContext
} from '@mui/x-data-grid-pro'
import { useLoadingContext } from '../contexts/useLoadingContext'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'

interface ToolbarProps {
  paletteMode: PaletteMode
  setPaletteMode: (paletteMode: PaletteMode) => void
}

export const Toolbar: FC<ToolbarProps> = ({ paletteMode, setPaletteMode }) => {
  const { isLoading } = useLoadingContext()
  const apiRef = useGridApiContext()

  const getFilteredRows = ({ apiRef }: GridCsvGetRowsToExportParams) => gridExpandedSortedRowIdsSelector(apiRef)

  const handleExport = () => apiRef.current.exportDataAsCsv({ getRowsToExport: getFilteredRows })

  const handleModeToggle = () => setPaletteMode(paletteMode === 'light' ? 'dark' : 'light')

  return (
    <GridToolbarContainer sx={{ pb: 0.5 }}>
      <Box
        sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' }}
      >
        <Typography sx={{ fontSize: { xs: 18, sm: 20 }, pl: 0.75 }} variant="h6">
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

            <Button color="primary" size="small" startIcon={<ExportIcon />} onClick={handleExport}>
              Export
            </Button>
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

const ExportIcon = createSvgIcon(
  <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z" />,
  'SaveAlt'
)
