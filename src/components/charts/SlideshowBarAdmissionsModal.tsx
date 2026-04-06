import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  IconButton,
  Modal,
  Radio,
  RadioGroup,
  Typography
} from '@mui/material'
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Row } from '@/types/row'
import { SlideshowBarAdmissionsChart } from './SlideshowBarAdmissionsChart'
import { ViewType } from '@/types/chart'
import { calculateSlideshowBarAdmissions } from '@/utils/charts/barAdmissionsUtils'

const MODAL_BOX_SX = {
  bgcolor: 'background.paper',
  borderRadius: 0,
  boxShadow: 'none',
  display: { xs: 'none', lg: 'flex' },
  flexDirection: 'column',
  height: '100dvh',
  left: 0,
  margin: 0,
  maxHeight: '100dvh',
  maxWidth: '100vw',
  outline: 'none',
  overflow: 'hidden',
  position: 'fixed',
  top: 0,
  transform: 'none',
  width: '100vw'
}

const VIEW_TYPE_OPTIONS = [
  { label: 'Total Count', value: ViewType.TOTAL },
  { label: 'License Status', value: ViewType.BY_LICENSE_TYPE },
  { label: 'Law School', value: ViewType.BY_LAW_SCHOOL }
]

interface SlideshowBarAdmissionsModalProps {
  isOpen: boolean
  onClose: () => void
  rows: Row[]
}

const getChartTitle = (viewType: ViewType) => {
  switch (viewType) {
    case ViewType.TOTAL:
      return 'Total Count'
    case ViewType.BY_LICENSE_TYPE:
      return 'License Status'
    case ViewType.BY_LAW_SCHOOL:
      return 'Law School'
    default:
      throw new Error(`Unhandled slideshow view type: ${viewType}`)
  }
}

export const SlideshowBarAdmissionsModal = ({ isOpen, onClose, rows }: SlideshowBarAdmissionsModalProps) => {
  const modalSurfaceReference = useRef<HTMLDivElement>(null)
  const [viewType, setViewType] = useState<ViewType>(ViewType.TOTAL)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fullscreenSupported, setFullscreenSupported] = useState(false)

  const chartData = useMemo(() => calculateSlideshowBarAdmissions(rows, viewType), [rows, viewType])

  const exitFullscreenIfActive = useCallback(async () => {
    const surface = modalSurfaceReference.current

    if (surface && document.fullscreenElement === surface) {
      await document.exitFullscreen()
    }
  }, [])

  const handleModalClose = useCallback(() => {
    void exitFullscreenIfActive()
    onClose()
  }, [exitFullscreenIfActive, onClose])

  const handleFullscreenToggle = useCallback(async () => {
    const surface = modalSurfaceReference.current

    if (!surface) return

    try {
      if (document.fullscreenElement === surface) {
        await document.exitFullscreen()
      } else {
        await surface.requestFullscreen()
      }
    } catch {
      // User denied permission or fullscreen is unavailable.
    }
  }, [])

  useEffect(() => {
    setFullscreenSupported(typeof document.documentElement.requestFullscreen === 'function')
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === modalSurfaceReference.current)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    if (!isOpen && document.fullscreenElement) {
      void document.exitFullscreen()
    }
  }, [isOpen])

  const handleViewTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setViewType(event.target.value as ViewType)
  }

  return (
    <Modal open={isOpen} onClose={handleModalClose}>
      <Box ref={modalSurfaceReference} sx={MODAL_BOX_SX}>
        <Box
          sx={{
            alignItems: 'flex-start',
            display: 'flex',
            flexShrink: 0,
            flexWrap: 'wrap',
            gap: 2,
            justifyContent: 'space-between',
            pb: 1,
            pt: 2,
            px: 2
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 20, fontWeight: 600, lineHeight: 1.25 }} variant="h2">
              Hawaii Bar Admissions
            </Typography>

            <Typography sx={{ color: 'text.secondary', mt: 0.25 }} variant="body2">
              1987 to present
            </Typography>
          </Box>

          <Box sx={{ alignItems: 'center', display: 'flex', flexShrink: 0, flexWrap: 'wrap', gap: 1 }}>
            {fullscreenSupported ? (
              <IconButton
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                color="inherit"
                edge="end"
                onClick={() => void handleFullscreenToggle()}
                size="small"
              >
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            ) : null}

            <FormControl sx={{ flexShrink: 0 }}>
              <RadioGroup onChange={handleViewTypeChange} row sx={{ flexWrap: 'wrap', gap: 1 }} value={viewType}>
                {VIEW_TYPE_OPTIONS.map(option => (
                  <FormControlLabel
                    control={<Radio size="small" />}
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
        </Box>

        <Typography sx={{ flexShrink: 0, fontSize: 16, fontWeight: 600, px: 2, py: 0.5 }}>
          {getChartTitle(viewType)}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            minHeight: 0,
            px: 2,
            pb: 1
          }}
        >
          <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', minHeight: 0 }}>
            <SlideshowBarAdmissionsChart data={chartData} viewType={viewType} />
          </Box>
        </Box>

        <Button onClick={handleModalClose} sx={{ display: 'block', flexShrink: 0, mb: 1.5, ml: 'auto', mr: 2 }}>
          Close
        </Button>
      </Box>
    </Modal>
  )
}
