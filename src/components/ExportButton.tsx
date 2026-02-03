import FileDownloadIcon from '@mui/icons-material/FileDownload'
import { Button } from '@mui/material'
import { captureMessage } from '@sentry/react'
import { GridFilterModel, useGridApiContext } from '@mui/x-data-grid-pro'
import { useRef } from 'react'

// Functions

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

export const ExportButton = () => {
  const apiRef = useGridApiContext()
  const exportHistoryRef = useRef<Set<string>>(new Set())

  const handleExport = () => {
    const { filterModel } = apiRef.current.state.filter
    const filename = generateExportFilename(filterModel)

    if (!exportHistoryRef.current.has(filename)) {
      captureMessage(`Export: ${filename}`, { extra: { filename }, tags: { type: 'export' } })

      exportHistoryRef.current.add(filename)
    }

    apiRef.current.exportDataAsCsv({ fileName: filename })
  }

  return (
    <Button color="primary" onClick={handleExport} size="small" startIcon={<FileDownloadIcon />}>
      Export
    </Button>
  )
}
