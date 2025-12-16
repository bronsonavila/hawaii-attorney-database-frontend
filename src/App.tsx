import {
  Box,
  createTheme,
  CssBaseline,
  GlobalStyles,
  Link,
  PaletteMode,
  ThemeProvider,
  useMediaQuery
} from '@mui/material'
import { compareMultiValueCells, getMultiValueFilterOperators, getValuesForDisplay } from '@/utils/dataGrid/multiValue'
import { countByRowPresence, sortByPrevalence } from '@/utils/rows/prevalence'
import { DataGridPro, GridColDef, GridRenderCellParams } from '@mui/x-data-grid-pro'
import { Footer } from '@/components/Footer'
import { getUniqueLicenseTypes } from '@/utils/charts/commonUtils'
import { HsbaCsvRow, mapHsbaCsvRowToRow } from '@/utils/hsbaCsv'
import { MultiValueCell } from '@/components/MultiValueCell'
import { Row } from '@/types/row'
import { Toolbar } from '@/components/Toolbar'
import { useEffect, useMemo, useState, WheelEvent } from 'react'
import { useFilterModelTracking } from '@/hooks/useFilterModelTracking'
import { useLoadingContext } from '@/hooks/useLoadingContext'
import Papa from 'papaparse'

const DATA_GRID_THEME_OVERRIDES = {
  MuiButtonBase: { defaultProps: { disableRipple: true } },
  MuiDataGrid: {
    // Elements rendered in a Popper element cannot be styled via DataGridPro.sx.
    styleOverrides: {
      columnsManagement: { padding: '12px 24px' },
      columnsManagementHeader: { display: 'none' },
      menu: { '.MuiButtonBase-root': { minHeight: 'auto' } },
      panelWrapper: {
        '@media (max-width: 599px)': {
          '&:has(.MuiDataGrid-panelContent)': {
            width: 'clamp(370px, 95vw, 540px)',
            '.MuiButton-icon': { ml: '-2px' },
            '.MuiButtonBase-root': { fontSize: 13, padding: '4px 5px' },
            '.MuiDataGrid-panelFooter .MuiSvgIcon-root': { fontSize: 18 },
            '.MuiFormLabel-root': { transform: 'translate(0, -1.5px) scale(0.67)' },
            '.MuiInputBase-input': { fontSize: 13 },
            '.MuiInputBase-root': { fontSize: 13 },
            '.MuiSvgIcon-root': { fontSize: 16 }
          }
        }
      },
      root: { border: 'none', height: '100dvh', width: '100dvw' }
    }
  },
  MuiInputBase: { defaultProps: { autoComplete: 'off' } },
  MuiList: {
    styleOverrides: { root: { '@media (max-width: 599px)': { '.MuiButtonBase-root': { minHeight: 'auto' } } } }
  }
}

export const App = () => {
  const { isLoading, setIsLoading } = useLoadingContext()
  const [licenseTypes, setLicenseTypes] = useState<string[]>([])
  const [membershipSectionOptions, setMembershipSectionOptions] = useState<string[]>([])
  const [otherLicenseOptions, setOtherLicenseOptions] = useState<string[]>([])
  const [rows, setRows] = useState<Row[]>([])
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

  const columns: GridColDef<Row>[] = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        renderCell: params => (
          <Link
            color="inherit"
            href={`https://hsba.org/member-directory/${encodeURIComponent(params.row.id)}`}
            onClick={event => event.stopPropagation()}
            rel="noopener noreferrer"
            sx={{
              display: 'inline-block',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            target="_blank"
            underline={isTouchLike ? 'always' : 'hover'}
          >
            {params.value as string}
          </Link>
        ),
        width: 220
      },
      {
        align: 'left',
        field: 'jdNumber',
        headerAlign: 'left',
        headerName: 'JD Number',
        type: 'number',
        valueFormatter: (value: number | null) => (value === null || value === undefined ? '' : value.toString()),
        valueGetter: (value: string) => Number(value),
        width: 150
      },
      {
        field: 'licenseType',
        headerName: 'License Status',
        type: 'singleSelect',
        valueOptions: licenseTypes,
        width: 200
      },
      { field: 'employer', headerName: 'Organization', width: 240 },
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
      },
      {
        field: 'membershipSections',
        filterOperators: getMultiValueFilterOperators(),
        headerName: 'Membership Sections',
        renderCell: (params: GridRenderCellParams<Row>) => {
          const filterModel = params.api.state.filter.filterModel
          const displayValues = getValuesForDisplay(params.row.membershipSections, filterModel, 'membershipSections')

          return <MultiValueCell values={displayValues} />
        },
        sortComparator: (v1, v2, p1, p2) =>
          compareMultiValueCells(
            v1,
            v2,
            p1.api.getRow(p1.id).membershipSections,
            p2.api.getRow(p2.id).membershipSections
          ),
        type: 'singleSelect',
        valueGetter: (_value, row) => row.membershipSections.join('; '),
        valueOptions: membershipSectionOptions,
        width: 280
      },
      {
        field: 'otherLicenses',
        filterOperators: getMultiValueFilterOperators(),
        headerName: 'Also Licensed In',
        renderCell: (params: GridRenderCellParams<Row>) => {
          const filterModel = params.api.state.filter.filterModel
          const displayValues = getValuesForDisplay(params.row.otherLicenses, filterModel, 'otherLicenses')

          return <MultiValueCell values={displayValues} />
        },
        sortComparator: (v1, v2, p1, p2) =>
          compareMultiValueCells(v1, v2, p1.api.getRow(p1.id).otherLicenses, p2.api.getRow(p2.id).otherLicenses),
        type: 'singleSelect',
        valueGetter: (_value, row) => row.otherLicenses.join('; '),
        valueOptions: otherLicenseOptions,
        width: 200
      }
    ],
    [isTouchLike, licenseTypes, membershipSectionOptions, otherLicenseOptions]
  )

  const handleFilterModelChange = useFilterModelTracking()

  // Theme

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const [paletteMode, setPaletteMode] = useState<PaletteMode>(() => {
    try {
      return (localStorage.getItem('theme') as PaletteMode) || (prefersDarkMode ? 'dark' : 'light')
    } catch {
      return prefersDarkMode ? 'dark' : 'light'
    }
  })

  const theme = useMemo(
    () => createTheme({ components: DATA_GRID_THEME_OVERRIDES, palette: { mode: paletteMode } }),
    [paletteMode]
  )

  // Effects

  useEffect(() => {
    try {
      localStorage.setItem('theme', paletteMode)
    } catch {
      // `localStorage` access denied – silently fail.
    }
  }, [paletteMode])

  useEffect(() => {
    fetch('/hsba-member-records.csv')
      .then(response => response.text())
      .then(csvString => {
        const { data: rawRows } = Papa.parse<HsbaCsvRow>(csvString, { header: true, skipEmptyLines: 'greedy' })
        const mappedRows = rawRows
          .filter(row => row && row.jd_number)
          .map(mapHsbaCsvRowToRow)
          .filter(row => row.jdNumber) // Omit blank rows.

        const membershipSectionsCounts = countByRowPresence(mappedRows, row => row.membershipSections)
        const otherLicensesCounts = countByRowPresence(mappedRows, row => row.otherLicenses)

        const sortedRows = mappedRows.map(row => ({
          ...row,
          membershipSections: sortByPrevalence(row.membershipSections, membershipSectionsCounts),
          otherLicenses: sortByPrevalence(row.otherLicenses, otherLicensesCounts)
        }))

        setRows(sortedRows)

        setLicenseTypes(getUniqueLicenseTypes(sortedRows))

        // Populate dropdown options sorted alphabetically
        setMembershipSectionOptions(Object.keys(membershipSectionsCounts).sort((a, b) => a.localeCompare(b)))
        setOtherLicenseOptions(Object.keys(otherLicensesCounts).sort((a, b) => a.localeCompare(b)))
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
