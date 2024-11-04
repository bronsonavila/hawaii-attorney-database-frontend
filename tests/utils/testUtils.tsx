import { Row } from '../../src/App'
import fs from 'fs'
import Papa from 'papaparse'
import path from 'path'
import { screen, fireEvent, act, render } from '@testing-library/react'
import { vi } from 'vitest'
import { ChartModal } from '../../src/components/charts/ChartModal'
import React from 'react'

export const loadTestRows = (): Row[] => {
  const csvPath = path.join(__dirname, '../../public/processed-member-records.csv')
  const csvString = fs.readFileSync(csvPath, 'utf-8')

  const { data } = Papa.parse<Row>(csvString, { header: true })

  return data.filter(row => row.jdNumber) // Omit blank rows.
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
