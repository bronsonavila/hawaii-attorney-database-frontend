import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MultiValueCell } from '@/components/MultiValueCell'

describe('MultiValueCell', () => {
  it('renders single value as text (not chip)', () => {
    render(<MultiValueCell values={['Value 1']} />)

    const valueElement = screen.getByText('Value 1')

    expect(valueElement).toBeInTheDocument()
    expect(valueElement.closest('.MuiChip-root')).not.toBeInTheDocument()
    expect(screen.queryByText(/\+/)).not.toBeInTheDocument()
  })

  it('renders multiple values', () => {
    render(<MultiValueCell values={['Value 1', 'Value 2']} />)

    const valueElement = screen.getByText('Value 1') // Visible value.

    expect(valueElement).toBeInTheDocument()
    expect(valueElement.closest('.MuiChip-root')).not.toBeInTheDocument()

    const moreElement = screen.getByText('+1') // +N indicator (should be a chip).

    expect(moreElement).toBeInTheDocument()
    expect(moreElement.closest('.MuiChip-root')).toBeInTheDocument()
  })

  it('renders only first value when multiple values provided', () => {
    render(<MultiValueCell values={['Value 1', 'Value 2', 'Value 3']} />)

    const textElement = screen.getByText('Value 1') // Only first value is shown as text.

    expect(textElement).toBeInTheDocument()
    expect(textElement.closest('.MuiChip-root')).not.toBeInTheDocument()
    expect(screen.getByText('+2')).toBeInTheDocument() // +N indicator shows remaining count.
  })

  it('opens popover with hidden values when +N chip is clicked', () => {
    render(<MultiValueCell values={['Value 1', 'Value 2', 'Value 3']} />)

    const moreChip = screen.getByText('+2')

    fireEvent.click(moreChip)

    // Hidden values in popover.
    expect(screen.getByText('Value 2')).toBeInTheDocument()
    expect(screen.getByText('Value 3')).toBeInTheDocument()
  })

  it('ensures only one popper is open at a time across the app', () => {
    render(
      <>
        <MultiValueCell values={['A1', 'A2']} />

        <MultiValueCell values={['B1', 'B2']} />
      </>
    )

    fireEvent.click(screen.getAllByText('+1')[0])

    expect(screen.getByText('A2')).toBeInTheDocument()

    fireEvent.click(screen.getAllByText('+1')[1])

    expect(screen.getByText('B2')).toBeInTheDocument()
    expect(screen.queryByText('A2')).not.toBeInTheDocument()
  })

  it('shows empty text when no values provided', () => {
    render(<MultiValueCell emptyText="No Data" values={[]} />)

    expect(screen.getByText('No Data')).toBeInTheDocument()
  })

  it('renders nothing when no values and no empty text', () => {
    const { container } = render(<MultiValueCell values={[]} />)

    expect(container).toBeEmptyDOMElement()
  })
})
