import { renderChartModal } from '../utils/testUtils'
import { screen, fireEvent, act } from '@testing-library/react'
import { vi } from 'vitest'

describe('ChartModal', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => mockOnClose.mockClear())

  it('renders when open and displays initial chart type', async () => {
    await renderChartModal({ onClose: mockOnClose })

    expect(screen.getByText('Select Chart')).toBeInTheDocument()
    expect(screen.getByText('Bar Admissions Over Time')).toBeInTheDocument()
    expect(screen.getByText('Total Count')).toBeInTheDocument()
    expect(screen.getByText('License Type')).toBeInTheDocument()
    expect(screen.getByText('Law School')).toBeInTheDocument()
  })

  it('does not render when closed', async () => {
    await renderChartModal({ isOpen: false, onClose: mockOnClose })

    expect(screen.queryByText('Select Chart')).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    await renderChartModal({ onClose: mockOnClose })

    fireEvent.click(screen.getByText('Close'))

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('changes chart type and updates view options', async () => {
    const { selectChart } = await renderChartModal({ onClose: mockOnClose })

    selectChart('License Type Distribution')

    expect(screen.getByText('Admission Date')).toBeInTheDocument()

    selectChart('Top 25 Employers (Non-Government)')

    expect(screen.getByText('Total Count')).toBeInTheDocument()
    expect(screen.getByText('Admission Date')).toBeInTheDocument()
    expect(screen.getByText('Law School')).toBeInTheDocument()
  })

  it('handles view type changes for Bar Admissions chart', async () => {
    await renderChartModal({ onClose: mockOnClose })

    await act(async () => fireEvent.click(screen.getByLabelText('License Type')))

    expect(screen.getByLabelText('License Type')).toBeChecked()

    await act(async () => fireEvent.click(screen.getByLabelText('Law School')))

    expect(screen.getByLabelText('Law School')).toBeChecked()
  })

  it('handles view type changes for License Distribution chart', async () => {
    const { selectChart } = await renderChartModal({ onClose: mockOnClose })

    selectChart('License Type Distribution')

    await act(async () => fireEvent.click(screen.getByLabelText('Admission Date')))

    expect(screen.getByLabelText('Admission Date')).toBeChecked()

    await act(async () => fireEvent.click(screen.getByLabelText('Law School')))

    expect(screen.getByLabelText('Law School')).toBeChecked()
  })

  it('handles view type changes for Top Employers chart', async () => {
    const { selectChart } = await renderChartModal({ onClose: mockOnClose })

    selectChart('Top 25 Employers (Non-Government)')

    await act(async () => fireEvent.click(screen.getByLabelText('Admission Date')))

    expect(screen.getByLabelText('Admission Date')).toBeChecked()

    await act(async () => fireEvent.click(screen.getByLabelText('Law School')))

    expect(screen.getByLabelText('Law School')).toBeChecked()
  })
})
