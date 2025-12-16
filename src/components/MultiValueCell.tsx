import { Box, Chip, ClickAwayListener, Paper, Popper, Typography } from '@mui/material'
import { MouseEvent, useCallback, useEffect, useState } from 'react'
import { useSingletonOpen } from '@/hooks/useSingletonOpen'

interface MultiValueCellProps {
  emptyText?: string
  maxVisible?: number
  values: string[]
}

export const MultiValueCell = ({ emptyText = '', maxVisible = 1, values }: MultiValueCellProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null)

  const open = Boolean(anchorEl)

  const handleClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    // Stop propagation to prevent row selection or other grid events if needed.
    event.stopPropagation()

    setAnchorEl(event.currentTarget)
  }, [])

  const handleClose = useCallback(() => setAnchorEl(null), [])

  useSingletonOpen({ eventName: 'multiValueCellPopperOpen', isOpen: open, onClose: handleClose })

  // Close the popup on actual scroll events.
  // Do not close on wheel/touchpad events, because that often consumes the first scroll gesture.
  useEffect(() => {
    if (!anchorEl) return

    const handleScroll = () => handleClose()

    const dataGridScroller = anchorEl.closest('.MuiDataGrid-virtualScroller') as HTMLElement | null
    dataGridScroller?.addEventListener('scroll', handleScroll, { capture: true, passive: true })

    window.addEventListener('scroll', handleScroll, true)

    return () => {
      dataGridScroller?.removeEventListener('scroll', handleScroll, true)

      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [anchorEl, handleClose])

  if (values.length === 0) {
    return emptyText ? (
      <Box sx={{ alignItems: 'center', display: 'flex', height: '100%' }}>
        <Typography color="text.secondary" sx={{ fontSize: 12 }} variant="body2">
          {emptyText}
        </Typography>
      </Box>
    ) : null
  }

  const visibleValues = values.slice(0, maxVisible)
  const hiddenValues = values.slice(maxVisible)
  const remainingCount = values.length - visibleValues.length

  return (
    <Box sx={{ alignItems: 'center', display: 'flex', height: '100%' }}>
      <Box sx={{ alignItems: 'center', display: 'flex', gap: 0.5, overflow: 'hidden' }}>
        {visibleValues.map(value => (
          <Chip
            key={value}
            label={value}
            size="small"
            sx={{
              height: 20,
              maxWidth: 260,
              '.MuiChip-label': { lineHeight: '18px', overflow: 'hidden', px: 0.75, textOverflow: 'ellipsis' }
            }}
            variant="outlined"
          />
        ))}

        {remainingCount > 0 ? (
          <>
            <Chip
              clickable
              label={`+${remainingCount}`}
              onClick={handleClick}
              size="small"
              sx={{
                cursor: 'pointer',
                height: 20,
                '.MuiChip-label': { lineHeight: '18px', px: 0.75 },
                '&:hover': { backgroundColor: 'action.hover' }
              }}
              variant="outlined"
            />

            <Popper anchorEl={anchorEl} open={open} placement="bottom-start">
              <ClickAwayListener onClickAway={handleClose}>
                <Paper elevation={4} sx={{ mt: 0.5, p: 1 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {hiddenValues.map(value => (
                      <Typography key={value} sx={{ fontSize: 12 }} variant="body2">
                        {value}
                      </Typography>
                    ))}
                  </Box>
                </Paper>
              </ClickAwayListener>
            </Popper>
          </>
        ) : null}
      </Box>
    </Box>
  )
}
