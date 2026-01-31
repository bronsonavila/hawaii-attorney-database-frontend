import { Box, Chip, Tooltip, Typography } from '@mui/material'
import { MouseEvent, useEffect, useRef, useState } from 'react'
import { useSingletonOpen } from '@/hooks/useSingletonOpen'

interface MultiValueCellProps {
  emptyText?: string
  isTouchDevice: boolean
  values: string[]
}

export const MultiValueCell = ({ emptyText = '', isTouchDevice, values }: MultiValueCellProps) => {
  const [open, setOpen] = useState(false)
  const chipRef = useRef<HTMLDivElement>(null)

  // Desktop: hover handlers
  const handleOpen = () => !isTouchDevice && setOpen(true)
  const handleClose = () => setOpen(false)

  // Touch: click handler
  const handleClick = (event: MouseEvent) => {
    event.stopPropagation()
    if (isTouchDevice) setOpen(prev => !prev)
  }

  // Keep singleton behavior for touch
  useSingletonOpen({ eventName: 'multiValueCellPopperOpen', isOpen: open, onClose: handleClose })

  // Close the tooltip on scroll or click-away (touch mode)
  useEffect(() => {
    if (!open || !chipRef.current) return

    const handleScroll = () => handleClose()

    const handleClickAway = (event: Event) => {
      if (chipRef.current && !chipRef.current.contains(event.target as Node)) {
        handleClose()
      }
    }

    const dataGridScroller = chipRef.current.closest('.MuiDataGrid-virtualScroller') as HTMLElement | null
    dataGridScroller?.addEventListener('scroll', handleScroll, { capture: true, passive: true })

    window.addEventListener('scroll', handleScroll, true)

    if (isTouchDevice) {
      document.addEventListener('click', handleClickAway, true)
    }

    return () => {
      dataGridScroller?.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('scroll', handleScroll, true)

      if (isTouchDevice) {
        document.removeEventListener('click', handleClickAway, true)
      }
    }
  }, [open, isTouchDevice])

  if (values.length === 0) {
    return emptyText ? (
      <Box sx={{ alignItems: 'center', display: 'flex', height: '100%' }}>
        <Typography color="text.secondary" sx={{ fontSize: 12 }} variant="body2">
          {emptyText}
        </Typography>
      </Box>
    ) : null
  }

  const firstValue = values[0]
  const hiddenValues = values.slice(1)
  const remainingCount = hiddenValues.length

  return (
    <Box sx={{ alignItems: 'center', display: 'flex', height: '100%' }}>
      <Box sx={{ alignItems: 'center', display: 'flex', gap: 1, overflow: 'hidden' }}>
        <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} variant="body2">
          {firstValue}
        </Typography>

        {remainingCount > 0 ? (
          <Tooltip
            disableFocusListener
            disableHoverListener={isTouchDevice}
            disableTouchListener
            onClose={handleClose}
            onOpen={handleOpen}
            open={open}
            title={
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {hiddenValues.map(value => (
                  <Typography key={value} sx={{ fontSize: 12 }} variant="body2">
                    {value}
                  </Typography>
                ))}
              </Box>
            }
          >
            <Chip
              label={`+${remainingCount}`}
              onClick={handleClick}
              ref={chipRef}
              size="small"
              sx={{
                cursor: isTouchDevice ? 'pointer' : 'default',
                height: 20,
                '.MuiChip-label': { lineHeight: '18px', px: 0.75 },
                '&:hover': { backgroundColor: isTouchDevice ? 'action.hover' : undefined }
              }}
              variant="outlined"
            />
          </Tooltip>
        ) : null}
      </Box>
    </Box>
  )
}
