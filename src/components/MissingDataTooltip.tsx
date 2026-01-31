import { MouseEvent, useEffect, useRef, useState } from 'react'
import { Tooltip, Typography } from '@mui/material'
import { InfoOutlined } from '@mui/icons-material'
import { useSingletonOpen } from '@/hooks/useSingletonOpen'

export const MissingDataTooltip = ({ isTouchDevice }: { isTouchDevice: boolean }) => {
  const [open, setOpen] = useState(false)
  const iconRef = useRef<SVGSVGElement>(null)

  const handleOpen = () => !isTouchDevice && setOpen(true)
  const handleClose = () => setOpen(false)

  const handleClick = (event: MouseEvent) => {
    event.stopPropagation()
    if (isTouchDevice) setOpen(prev => !prev)
  }

  useSingletonOpen({ eventName: 'missingDataTooltipOpen', isOpen: open, onClose: handleClose })

  // Close the tooltip on scroll or click-away (touch mode)
  useEffect(() => {
    if (!open || !iconRef.current) return

    const handleScroll = () => handleClose()

    const handleClickAway = (event: Event) => {
      if (iconRef.current && !iconRef.current.contains(event.target as Node)) {
        handleClose()
      }
    }

    const dataGridScroller = iconRef.current.closest('.MuiDataGrid-virtualScroller') as HTMLElement | null
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

  return (
    <Tooltip
      disableFocusListener
      disableHoverListener={isTouchDevice}
      disableTouchListener
      onClose={handleClose}
      onOpen={handleOpen}
      open={open}
      title={
        <Typography sx={{ fontSize: 12 }} variant="body2">
          Not found in HSBA directory. May be outdated.
        </Typography>
      }
    >
      <InfoOutlined
        color="action"
        onClick={handleClick}
        ref={iconRef}
        sx={{
          cursor: isTouchDevice ? 'pointer' : 'default',
          fontSize: 16,
          opacity: 0.6
        }}
      />
    </Tooltip>
  )
}
