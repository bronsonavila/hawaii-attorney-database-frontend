import { ChartModal } from '@/components/charts/ChartModal'
import { HsbaCsvRow, mapHsbaCsvRowToRow } from '@/utils/rows/hsbaCsv'
import { Row } from '@/types/row'
import { screen, fireEvent, act, render } from '@testing-library/react'
import { vi } from 'vitest'
import fs from 'fs'
import Papa from 'papaparse'
import path from 'path'

export const loadTestRows = (): Row[] => {
  const csvPath = path.join(__dirname, '../../public/hsba-member-records.csv')
  const csvString = fs.readFileSync(csvPath, 'utf-8')

  const { data: rawRows } = Papa.parse<HsbaCsvRow>(csvString, { header: true, skipEmptyLines: 'greedy' })

  return rawRows
    .filter(row => row && row.jd_number)
    .map(mapHsbaCsvRowToRow)
    .filter(row => row.jdNumber) // Omit blank rows.
}

export const renderChartModal = async (props: {
  isOpen?: boolean
  onClose?: () => void
  paletteMode?: 'light' | 'dark'
  rows?: Row[]
}) => {
  const defaultProps = { isOpen: true, onClose: vi.fn(), paletteMode: 'light' as const, rows: loadTestRows() }

  const mergedProps = { ...defaultProps, ...props }

  await act(async () => render(<ChartModal {...mergedProps} />))

  return {
    ...mergedProps,
    selectChart: (chartName: string) => {
      const select = screen.getByRole('combobox')

      fireEvent.mouseDown(select)
      fireEvent.click(screen.getByText(chartName))
    }
  }
}
