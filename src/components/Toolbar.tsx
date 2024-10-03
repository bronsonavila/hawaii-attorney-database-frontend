import { Box, Typography, Switch, PaletteMode, Skeleton, Button } from '@mui/material'
import { createSvgIcon, debounce } from '@mui/material/utils'
import { FC, useCallback, useRef, useEffect } from 'react'
import {
  GridCsvGetRowsToExportParams,
  gridExpandedSortedRowIdsSelector,
  GridFilterModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
  useGridApiContext
} from '@mui/x-data-grid-pro'
import { useLoadingContext } from '../contexts/useLoadingContext'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import posthog from 'posthog-js'

// Types

interface ToolbarProps {
  paletteMode: PaletteMode
  setPaletteMode: (paletteMode: PaletteMode) => void
}

// Hooks

const useQuickFilterTracking = () => {
  const quickFilterRef = useRef<HTMLDivElement>(null)
  const lastFilterValueRef = useRef<string>('')

  const debouncedPosthogCapture = useCallback(
    debounce((value: string) => {
      if (value && value !== lastFilterValueRef.current) {
        posthog.capture('quick_filter_used', { filter_value: value })

        lastFilterValueRef.current = value
      }
    }, 1000),
    []
  )

  useEffect(() => {
    if (!quickFilterRef.current) return

    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
          const inputElement = mutation.target as HTMLInputElement
          const newValue = inputElement.value

          debouncedPosthogCapture(newValue)
        }
      }
    })

    const inputElement = quickFilterRef.current.querySelector('input')

    if (inputElement) observer.observe(inputElement, { attributes: true, attributeFilter: ['value'] })

    return () => {
      observer.disconnect()

      debouncedPosthogCapture.clear()
    }
  }, [debouncedPosthogCapture])

  return quickFilterRef
}

// Helpers

const generateExportFilename = (filterModel: GridFilterModel) => {
  let filename = 'hawaii-attorney-database'

  const quickFilterValues = filterModel.quickFilterValues || []

  if (quickFilterValues.length > 0) {
    filename += `--${quickFilterValues.join('-')}`
  }

  const columnFilters = filterModel.items || []

  const formattedColumnFilters = columnFilters.map(filter =>
    filter.value instanceof Date ? { ...filter, value: filter.value.toISOString().slice(0, 10) } : filter
  )

  formattedColumnFilters.forEach(filter => {
    if (filter.value !== undefined && filter.value !== '') {
      filename += `--${filter.field}-${filter.value}`
    }
  })

  return filename.toLowerCase().replace(/\s+/g, '-')
}

// Components

const ExportIcon = createSvgIcon(
  <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z" />,
  'Export'
)

export const Toolbar: FC<ToolbarProps> = ({ paletteMode, setPaletteMode }) => {
  const { isLoading } = useLoadingContext()
  const apiRef = useGridApiContext()
  const quickFilterRef = useQuickFilterTracking()

  const getFilteredRows = ({ apiRef }: GridCsvGetRowsToExportParams) => gridExpandedSortedRowIdsSelector(apiRef)

  const handleExport = () => {
    const filterModel = apiRef.current.state.filter.filterModel

    apiRef.current.exportDataAsCsv({ fileName: generateExportFilename(filterModel), getRowsToExport: getFilteredRows })
  }

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

        <Box ref={quickFilterRef}>
          <GridToolbarQuickFilter
            disabled={isLoading}
            sx={{ width: { xs: 300, md: 350, lg: 400 }, '& .MuiInputBase-root': { fontSize: { xs: 14, md: 16 } } }}
          />
        </Box>
      </Box>
    </GridToolbarContainer>
  )
}
