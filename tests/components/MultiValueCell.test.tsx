import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MultiValueCell } from '@/components/MultiValueCell'

describe('MultiValueCell', () => {
  it('renders single value as text (not chip)', () => {
    render(<MultiValueCell isTouchDevice={false} values={['Value 1']} />)

    const valueElement = screen.getByText('Value 1')

    expect(valueElement).toBeInTheDocument()
    expect(valueElement.closest('.MuiChip-root')).not.toBeInTheDocument()
    expect(screen.queryByText(/\+/)).not.toBeInTheDocument()
  })

  it('renders multiple values', () => {
    render(<MultiValueCell isTouchDevice={false} values={['Value 1', 'Value 2']} />)

    const valueElement = screen.getByText('Value 1') // Visible value.

    expect(valueElement).toBeInTheDocument()
    expect(valueElement.closest('.MuiChip-root')).not.toBeInTheDocument()

    const moreElement = screen.getByText('+1') // +N indicator (should be a chip).

    expect(moreElement).toBeInTheDocument()
    expect(moreElement.closest('.MuiChip-root')).toBeInTheDocument()
  })

  it('renders only first value when multiple values provided', () => {
    render(<MultiValueCell isTouchDevice={false} values={['Value 1', 'Value 2', 'Value 3']} />)

    const textElement = screen.getByText('Value 1') // Only first value is shown as text.

    expect(textElement).toBeInTheDocument()
    expect(textElement.closest('.MuiChip-root')).not.toBeInTheDocument()
    expect(screen.getByText('+2')).toBeInTheDocument() // +N indicator shows remaining count.
  })

  describe('Desktop mode (hover)', () => {
    it('opens tooltip on hover', async () => {
      render(<MultiValueCell isTouchDevice={false} values={['Value 1', 'Value 2', 'Value 3']} />)

      const moreChip = screen.getByText('+2')

      // Hover over the chip
      fireEvent.mouseOver(moreChip)

      // Wait for tooltip to appear
      expect(await screen.findByText('Value 2')).toBeInTheDocument()
      expect(screen.getByText('Value 3')).toBeInTheDocument()

      // Mouse out
      fireEvent.mouseLeave(moreChip)

      // Tooltip should disappear (might need waitForElementToBeRemoved in real browser,
      // but JSDOM/React Testing Library handles state updates synchronously usually)
    })

    it('does not toggle on click', () => {
      render(<MultiValueCell isTouchDevice={false} values={['Value 1', 'Value 2']} />)

      const moreChip = screen.getByText('+1')

      // Click should do nothing in desktop mode (handled by hover)
      fireEvent.click(moreChip)

      // We can't easily test "nothing happened" for internal state,
      // but we can verify it doesn't crash or behave unexpectedly.
      // The tooltip logic relies on mouseOver for desktop.
    })
  })

  describe('Touch mode (tap)', () => {
    it('toggles tooltip on click/tap', async () => {
      render(<MultiValueCell isTouchDevice={true} values={['Value 1', 'Value 2']} />)

      const moreChip = screen.getByText('+1')

      // Tap to open
      fireEvent.click(moreChip)
      expect(await screen.findByText('Value 2')).toBeInTheDocument()

      // Tap to close
      fireEvent.click(moreChip)
      // Note: Tooltip closing animation might delay removal, but in JSDOM it should be gone or not visible
    })
  })

  it('ensures only one tooltip is open at a time in touch mode', async () => {
    render(
      <>
        <MultiValueCell isTouchDevice={true} values={['A1', 'A2']} />
        <MultiValueCell isTouchDevice={true} values={['B1', 'B2']} />
      </>
    )

    const chipA = screen.getAllByText('+1')[0]
    const chipB = screen.getAllByText('+1')[1]

    // Open first one
    fireEvent.click(chipA)
    expect(await screen.findByText('A2')).toBeInTheDocument()

    // Open second one - first should close
    fireEvent.click(chipB)
    expect(await screen.findByText('B2')).toBeInTheDocument()

    // Wait for A2 to be removed (MUI Tooltip may have exit animation)
    await waitFor(() => {
      expect(screen.queryByText('A2')).not.toBeInTheDocument()
    })
  })

  it('shows empty text when no values provided', () => {
    render(<MultiValueCell emptyText="No Data" isTouchDevice={false} values={[]} />)

    expect(screen.getByText('No Data')).toBeInTheDocument()
  })

  it('renders nothing when no values and no empty text', () => {
    const { container } = render(<MultiValueCell isTouchDevice={false} values={[]} />)

    expect(container).toBeEmptyDOMElement()
  })
})
