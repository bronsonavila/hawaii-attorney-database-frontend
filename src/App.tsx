import { Box, createTheme, CssBaseline, GlobalStyles, ThemeProvider, useMediaQuery } from '@mui/material'
import { DATA_GRID_THEME_OVERRIDES } from '@/theme/dataGridTheme'
import { DataGridPro } from '@mui/x-data-grid-pro'
import { Footer } from '@/components/Footer'
import { getColumns } from '@/columns/columns'
import { Toolbar } from '@/components/Toolbar'
import { useMemo, WheelEvent } from 'react'
import { useAttorneyData } from '@/hooks/useAttorneyData'
import { useFilterModelTracking } from '@/hooks/useFilterModelTracking'
import { useLoadingContext } from '@/hooks/useLoadingContext'
import { usePaletteMode } from '@/hooks/usePaletteMode'

export const App = () => {
  const { isLoading } = useLoadingContext()
  const { rows, licenseTypes, membershipSectionOptions, otherLicenseOptions } = useAttorneyData()
  const isTouchLike = useMediaQuery('(hover: none), (pointer: coarse)')

  const handleGridWheelCapture = (event: WheelEvent<HTMLDivElement>) => {
    const isHorizontalWheel = Math.abs(event.deltaX) > 0 || (event.shiftKey && Math.abs(event.deltaY) > 0)

    if (!isHorizontalWheel) return

    const activeElement = document.activeElement as HTMLElement | null

    if (!activeElement) return
    if (!event.currentTarget.contains(activeElement)) return

    // Prevent the grid from snapping horizontally to keep a focused header/cell in view
    // while the user is doing a horizontal scroll gesture.
    if (activeElement.closest('.MuiDataGrid-columnHeader') || activeElement.closest('.MuiDataGrid-cell')) {
      activeElement.blur()
    }
  }

  const columns = useMemo(
    () => getColumns({ isTouchLike, licenseTypes, membershipSectionOptions, otherLicenseOptions }),
    [isTouchLike, licenseTypes, membershipSectionOptions, otherLicenseOptions]
  )

  const handleFilterModelChange = useFilterModelTracking()

  const { paletteMode, setPaletteMode } = usePaletteMode()

  const theme = useMemo(
    () => createTheme({ components: DATA_GRID_THEME_OVERRIDES, palette: { mode: paletteMode } }),
    [paletteMode]
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Apply color scheme to all browser elements. See: https://github.com/mui/material-ui/issues/25016 */}
      <GlobalStyles styles={{ html: { colorScheme: paletteMode } }} />

      <Box onWheelCapture={handleGridWheelCapture}>
        <DataGridPro
          autosizeOptions={{ includeHeaders: true, includeOutliers: true, outliersFactor: 1 }}
          columns={columns}
          density="compact"
          disableMultipleRowSelection
          disableRowSelectionOnClick
          ignoreDiacritics
          initialState={{ pinnedColumns: { left: ['name'] } }}
          loading={isLoading}
          onFilterModelChange={handleFilterModelChange}
          rows={rows}
          slotProps={{ columnsManagement: { disableShowHideToggle: true }, toolbar: { showQuickFilter: true } }}
          slots={{
            footer: Footer,
            toolbar: props => (
              <Toolbar {...props} paletteMode={paletteMode} rows={rows} setPaletteMode={setPaletteMode} />
            )
          }}
        />
      </Box>
    </ThemeProvider>
  )
}
