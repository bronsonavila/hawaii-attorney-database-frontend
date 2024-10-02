import { createTheme, CssBaseline, GlobalStyles, PaletteMode, ThemeProvider, useMediaQuery } from '@mui/material'
import { CustomFooter } from './components/CustomFooter'
import { CustomToolbar } from './components/CustomToolbar'
import { GridColDef, DataGridPro } from '@mui/x-data-grid-pro'
import { JsonLd } from './components/JsonLd'
import { useEffect, useMemo, useState } from 'react'
import { useLoadingContext } from './contexts/useLoadingContext'
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

export const App = () => {
  const { isLoading, setIsLoading } = useLoadingContext()
  const [licenseTypes, setLicenseTypes] = useState<string[]>([])
  const [rows, setRows] = useState<Row[]>([])

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'jdNumber', headerName: 'JD Number', width: 150 },
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
        width: 175
      }
    ],
    [licenseTypes]
  )

  // Theme

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const [paletteMode, setPaletteMode] = useState<PaletteMode>(
    (localStorage.getItem('theme') as PaletteMode) || (prefersDarkMode ? 'dark' : 'light')
  )

  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode: paletteMode },
        components: {
          MuiButtonBase: { defaultProps: { disableRipple: true } },
          MuiDataGrid: {
            styleOverrides: {
              // Column management elements are rendered in a Popper element and cannot be styled via DataGridPro.sx.
              columnsManagement: { padding: '12px 24px' },
              columnsManagementHeader: { display: 'none' },
              root: { border: 'none', height: '100dvh', width: '100dvw' }
            }
          }
        }
      }),
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
      .finally(() => setIsLoading(false))
  }, [])

  // Render

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <JsonLd />

      {/* Apply color scheme to all browser elements. See: https://github.com/mui/material-ui/issues/25016 */}
      <GlobalStyles styles={{ html: { colorScheme: paletteMode } }} />

      <DataGridPro
        autosizeOptions={{ includeHeaders: true, includeOutliers: true, outliersFactor: 1000 }}
        columns={columns}
        density="compact"
        disableRowSelectionOnClick
        ignoreDiacritics
        initialState={{ pagination: { paginationModel: { page: 0, pageSize: 100 } } }}
        loading={isLoading}
        rows={rows}
        slotProps={{ toolbar: { showQuickFilter: true } }}
        slots={{
          toolbar: props => <CustomToolbar {...props} paletteMode={paletteMode} setPaletteMode={setPaletteMode} />,
          footer: CustomFooter
        }}
      />
    </ThemeProvider>
  )
}
