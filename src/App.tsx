import { Box, createTheme, CssBaseline, GlobalStyles, ThemeProvider, useMediaQuery } from '@mui/material'
import { DATA_GRID_THEME_OVERRIDES } from '@/theme/dataGridTheme'
import { DataGridPro } from '@mui/x-data-grid-pro'
import { Footer } from '@/components/Footer'
import { getColumns } from '@/columns/columns'
import { Toolbar } from '@/components/Toolbar'
import { TouchEvent, useMemo, WheelEvent } from 'react'
import { useAttorneyData } from '@/hooks/useAttorneyData'
import { useFilterModelTracking } from '@/hooks/useFilterModelTracking'
import { useLoadingContext } from '@/hooks/useLoadingContext'
import { usePaletteMode } from '@/hooks/usePaletteMode'

export const App = () => {
  const { isLoading } = useLoadingContext()
  const { rows, licenseTypes, membershipSectionOptions, otherLicenseOptions } = useAttorneyData()
  const isTouchDevice = useMediaQuery('(hover: none), (pointer: coarse)')

  const blurFocusedGridElement = (container: HTMLElement) => {
    const activeElement = document.activeElement as HTMLElement | null

    if (!activeElement) return
    if (!container.contains(activeElement)) return

    // Prevent the grid from snapping horizontally to keep a focused header/cell in view while the user is scrolling.
    if (activeElement.closest('.MuiDataGrid-columnHeader') || activeElement.closest('.MuiDataGrid-cell')) {
      activeElement.blur()
    }
  }

  const handleGridWheelCapture = (event: WheelEvent<HTMLDivElement>) => {
    const isHorizontalWheel = Math.abs(event.deltaX) > 0 || (event.shiftKey && Math.abs(event.deltaY) > 0)

    if (!isHorizontalWheel) return

    blurFocusedGridElement(event.currentTarget)
  }

  const handleGridTouchMoveCapture = (event: TouchEvent<HTMLDivElement>) => {
    blurFocusedGridElement(event.currentTarget)
  }

  const columns = useMemo(
    () => getColumns({ isTouchDevice, licenseTypes, membershipSectionOptions, otherLicenseOptions }),
    [isTouchDevice, licenseTypes, membershipSectionOptions, otherLicenseOptions]
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

      <Box onTouchMoveCapture={handleGridTouchMoveCapture} onWheelCapture={handleGridWheelCapture}>
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
