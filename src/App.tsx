import { createTheme, CssBaseline, GlobalStyles, PaletteMode, ThemeProvider, useMediaQuery } from '@mui/material'
import { Footer } from './components/Footer'
import { GridColDef, DataGridPro } from '@mui/x-data-grid-pro'
import { Toolbar } from './components/Toolbar'
import { useEffect, useMemo, useState } from 'react'
import { useFilterModelTracking } from './hooks/useFilterModelTracking'
import { useLoadingContext } from './hooks/useLoadingContext'
import Papa from 'papaparse'

interface Row {
  jdNumber: string
  name: string
  licenseType: string
  employer: string
  location: string
  emailDomain: string
  lawSchool: string
  barAdmissionDate: string
}

const DATA_GRID_THEME_OVERRIDES = {
  MuiButtonBase: { defaultProps: { disableRipple: true } },
  MuiDataGrid: {
    styleOverrides: {
      // Elements rendered in a Popper element cannot be styled via DataGridPro.sx.
      columnsManagement: { padding: '12px 24px' },
      columnsManagementHeader: { display: 'none' },
      menu: { '.MuiButtonBase-root': { minHeight: 'auto' } },
      panelWrapper: {
        '@media (max-width: 599px)': {
          '&:has(.MuiDataGrid-panelContent)': { width: 'clamp(370px, 95vw, 540px)' },
          '.MuiButton-icon': { ml: '-2px' },
          '.MuiButtonBase-root': { fontSize: 13, padding: '4px 5px' },
          '.MuiDataGrid-panelFooter .MuiSvgIcon-root': { fontSize: 18 },
          '.MuiFormLabel-root': { transform: 'translate(0, -1.5px) scale(0.67)' },
          '.MuiInputBase-input': { fontSize: 13 },
          '.MuiInputBase-root': { fontSize: 13 },
          '.MuiSvgIcon-root': { fontSize: 16 }
        }
      },
      root: { border: 'none', height: '100dvh', width: '100dvw' }
    }
  },
  MuiInputBase: { defaultProps: { autoComplete: 'off' } }
}

export const App = () => {
  const { isLoading, setIsLoading } = useLoadingContext()
  const [licenseTypes, setLicenseTypes] = useState<string[]>([])
  const [rows, setRows] = useState<Row[]>([])

  const columns: GridColDef[] = useMemo(
    () => [
      {
        align: 'left',
        field: 'jdNumber',
        headerAlign: 'left',
        headerName: 'JD Number',
        type: 'number',
        valueFormatter: (value: number) => value.toString(),
        valueGetter: (value: string) => Number(value),
        width: 150
      },
      { field: 'name', headerName: 'Name', width: 200 },
      {
        field: 'licenseType',
        headerName: 'License Type',
        type: 'singleSelect',
        valueOptions: licenseTypes,
        width: 200
      },
      { field: 'employer', headerName: 'Employer', width: 200 },
      { field: 'location', headerName: 'Location', width: 350 },
      { field: 'emailDomain', headerName: 'Email Domain', width: 175 },
      { field: 'lawSchool', headerName: 'Law School', width: 200 },
      {
        field: 'barAdmissionDate',
        headerName: 'Bar Admission Date',
        type: 'date',
        valueFormatter: (value: Date | null) => (value instanceof Date ? value.toLocaleDateString() : ''),
        valueGetter: (value: string | null) => (value ? new Date(value) : null),
        width: 200
      }
    ],
    [licenseTypes]
  )

  const handleFilterModelChange = useFilterModelTracking()

  // Theme

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const [paletteMode, setPaletteMode] = useState<PaletteMode>(
    (localStorage.getItem('theme') as PaletteMode) || (prefersDarkMode ? 'dark' : 'light')
  )

  const theme = useMemo(
    () => createTheme({ components: DATA_GRID_THEME_OVERRIDES, palette: { mode: paletteMode } }),
    [paletteMode]
  )

  // Effects

  useEffect(() => {
    localStorage.setItem('theme', paletteMode)
  }, [paletteMode])

  useEffect(() => {
    fetch('/processed-member-records.csv')
      .then(response => response.text())
      .then(csvString => {
        const { data: rows } = Papa.parse<Row>(csvString, { header: true })

        setRows(rows)

        const uniqueLicenseTypes = [...new Set(rows.map(record => record.licenseType))]
          .filter((type): type is string => type !== undefined && type !== '')
          .sort()

        setLicenseTypes(uniqueLicenseTypes)
      })
      // Prevent flicker of "Total Rows: 0" on initial load. See: https://github.com/mui/mui-x/issues/12504
      .finally(() => setTimeout(() => setIsLoading(false)))
  }, [])

  // Render

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Apply color scheme to all browser elements. See: https://github.com/mui/material-ui/issues/25016 */}
      <GlobalStyles styles={{ html: { colorScheme: paletteMode } }} />

      <DataGridPro
        autosizeOptions={{ includeHeaders: true, includeOutliers: true, outliersFactor: 1 }}
        columns={columns}
        density="compact"
        disableMultipleRowSelection
        disableRowSelectionOnClick
        ignoreDiacritics
        loading={isLoading}
        onFilterModelChange={handleFilterModelChange}
        rows={rows}
        slotProps={{ columnsManagement: { disableShowHideToggle: true }, toolbar: { showQuickFilter: true } }}
        slots={{
          footer: Footer,
          toolbar: props => <Toolbar {...props} paletteMode={paletteMode} setPaletteMode={setPaletteMode} />
        }}
      />
    </ThemeProvider>
  )
}
