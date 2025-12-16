import { fireEvent, render, screen } from '@testing-library/react'
import { MultiValueCell } from '@/components/MultiValueCell'
import { describe, expect, it } from 'vitest'

describe('MultiValueCell', () => {
  it('renders single value correctly', () => {
    render(<MultiValueCell values={['Value 1']} />)
    expect(screen.getByText('Value 1')).toBeInTheDocument()
    expect(screen.queryByText(/\+/)).not.toBeInTheDocument()
  })

  it('renders multiple values with default maxVisible=1', () => {
    render(<MultiValueCell values={['Value 1', 'Value 2']} />)
    expect(screen.getByText('Value 1')).toBeInTheDocument()
    expect(screen.getByText('+1')).toBeInTheDocument()
  })

  it('renders multiple values with custom maxVisible', () => {
    render(<MultiValueCell maxVisible={2} values={['Value 1', 'Value 2', 'Value 3']} />)
    expect(screen.getByText('Value 1')).toBeInTheDocument()
    expect(screen.getByText('Value 2')).toBeInTheDocument()
    expect(screen.getByText('+1')).toBeInTheDocument()
  })

  it('opens popover with hidden values when +N chip is clicked', () => {
    render(<MultiValueCell values={['Value 1', 'Value 2', 'Value 3']} />)

    const moreChip = screen.getByText('+2')
    fireEvent.click(moreChip)

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
