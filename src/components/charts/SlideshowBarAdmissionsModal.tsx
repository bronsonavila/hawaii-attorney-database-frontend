import { Box, Modal, Typography } from '@mui/material'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Row } from '@/types/row'
import { SlideshowBarAdmissionsChart } from './SlideshowBarAdmissionsChart'
import { ViewType } from '@/types/chart'
import { SLIDESHOW_BAR_ADMISSIONS_END_YEAR, SLIDESHOW_BAR_ADMISSIONS_START_YEAR } from '@/constants/chartConstants'
import {
  calculateSlideshowBarAdmissions,
  calculateSlideshowEligibilitySummary,
  calculateSlideshowEligibleLineData
} from '@/utils/charts/barAdmissionsUtils'
import { SlideshowEligibilityDonutChart } from './SlideshowEligibilityDonutChart'
import { SlideshowEligibilityLineChart } from './SlideshowEligibilityLineChart'
import { SlideshowActiveAttorneysLineChart } from './SlideshowActiveAttorneysLineChart'

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

interface SlideshowBarAdmissionsModalProps {
  isOpen: boolean
  onClose: () => void
  rows: Row[]
}

const VIEW_TYPE_ORDER: ViewType[] = [
  ViewType.TOTAL,
  ViewType.BY_LICENSE_TYPE,
  ViewType.BY_LAW_SCHOOL,
  ViewType.SLIDESHOW_ELIGIBILITY_LINE,
  ViewType.SLIDESHOW_ELIGIBILITY_DONUT,
  ViewType.SLIDESHOW_HSBA_ACTIVE_ATTORNEYS
]

const getChartTitle = (viewType: ViewType) => {
  switch (viewType) {
    case ViewType.TOTAL:
      return 'Hawaii Bar Admissions'
    case ViewType.BY_LICENSE_TYPE:
      return 'Hawaii Attorneys by License Status'
    case ViewType.BY_LAW_SCHOOL:
      return 'Hawaii Attorneys by Law School'
    case ViewType.SLIDESHOW_ELIGIBILITY_LINE:
      return 'Hawaii Attorneys Eligible to Practice by Bar Admission Year'
    case ViewType.SLIDESHOW_ELIGIBILITY_DONUT:
      return 'Hawaii Attorneys by Eligibility to Practice'
    case ViewType.SLIDESHOW_HSBA_ACTIVE_ATTORNEYS:
      return 'HSBA Active Attorneys by Year'
    default:
      throw new Error(`Unhandled slideshow view type: ${viewType}`)
  }
}

const getAdjacentViewType = (currentViewType: ViewType, direction: -1 | 1) => {
  const currentIndex = VIEW_TYPE_ORDER.indexOf(currentViewType)
  const nextIndex = (currentIndex + direction + VIEW_TYPE_ORDER.length) % VIEW_TYPE_ORDER.length

  return VIEW_TYPE_ORDER[nextIndex]
}

const isEligibilitySummaryView = (viewType: ViewType) => viewType === ViewType.SLIDESHOW_ELIGIBILITY_DONUT
const isEligibilityLineView = (viewType: ViewType) => viewType === ViewType.SLIDESHOW_ELIGIBILITY_LINE
const isHsbaActiveAttorneysView = (viewType: ViewType) => viewType === ViewType.SLIDESHOW_HSBA_ACTIVE_ATTORNEYS

export const SlideshowBarAdmissionsModal = ({ isOpen, onClose, rows }: SlideshowBarAdmissionsModalProps) => {
  const modalSurfaceReference = useRef<HTMLDivElement>(null)
  const [viewType, setViewType] = useState<ViewType>(ViewType.TOTAL)

  const chartData = useMemo(
    () =>
      isEligibilitySummaryView(viewType) || isEligibilityLineView(viewType) || isHsbaActiveAttorneysView(viewType)
        ? []
        : calculateSlideshowBarAdmissions(rows, viewType),
    [rows, viewType]
  )
  const eligibilityLineData = useMemo(() => calculateSlideshowEligibleLineData(rows), [rows])
  const eligibilitySummaryData = useMemo(() => calculateSlideshowEligibilitySummary(rows), [rows])

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
    if (!isOpen && document.fullscreenElement) {
      void document.exitFullscreen()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target

      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        (target instanceof HTMLElement &&
          (target.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)))
      )
        return

      switch (event.key) {
        case '1':
          event.preventDefault()
          setViewType(ViewType.TOTAL)
          break
        case '2':
          event.preventDefault()
          setViewType(ViewType.BY_LICENSE_TYPE)
          break
        case '3':
          event.preventDefault()
          setViewType(ViewType.BY_LAW_SCHOOL)
          break
        case '4':
          event.preventDefault()
          setViewType(ViewType.SLIDESHOW_ELIGIBILITY_LINE)
          break
        case '5':
          event.preventDefault()
          setViewType(ViewType.SLIDESHOW_ELIGIBILITY_DONUT)
          break
        case '6':
          event.preventDefault()
          setViewType(ViewType.SLIDESHOW_HSBA_ACTIVE_ATTORNEYS)
          break
        case 'ArrowLeft':
          event.preventDefault()
          setViewType(currentViewType => getAdjacentViewType(currentViewType, -1))
          break
        case 'ArrowRight':
          event.preventDefault()
          setViewType(currentViewType => getAdjacentViewType(currentViewType, 1))
          break
        case 'f':
        case 'F':
          event.preventDefault()
          void handleFullscreenToggle()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleFullscreenToggle, isOpen])

  return (
    <Modal open={isOpen} onClose={handleModalClose}>
      <Box ref={modalSurfaceReference} sx={MODAL_BOX_SX}>
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexShrink: 0,
            pb: 1,
            pt: 2,
            px: 2
          }}
        >
          <Box
            sx={{ alignItems: 'baseline', columnGap: 1, display: 'flex', flexWrap: 'wrap', minWidth: 0, rowGap: 0.5 }}
          >
            <Typography component="span" sx={{ fontSize: 20, fontWeight: 600, lineHeight: 1.25 }} variant="h2">
              {getChartTitle(viewType)}
            </Typography>

            <Typography component="span" sx={{ color: 'text.disabled', fontSize: 16 }} variant="body2">
              |
            </Typography>

            <Typography component="span" sx={{ color: 'text.secondary', fontSize: 16 }} variant="body2">
              {viewType === ViewType.SLIDESHOW_ELIGIBILITY_DONUT
                ? `As of ${SLIDESHOW_BAR_ADMISSIONS_END_YEAR}`
                : viewType === ViewType.SLIDESHOW_HSBA_ACTIVE_ATTORNEYS
                  ? '2010 to 2025'
                  : `${SLIDESHOW_BAR_ADMISSIONS_START_YEAR} to ${SLIDESHOW_BAR_ADMISSIONS_END_YEAR}`}
            </Typography>
          </Box>
        </Box>

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
            {viewType === ViewType.SLIDESHOW_ELIGIBILITY_DONUT ? (
              <SlideshowEligibilityDonutChart data={eligibilitySummaryData} />
            ) : viewType === ViewType.SLIDESHOW_ELIGIBILITY_LINE ? (
              <SlideshowEligibilityLineChart data={eligibilityLineData} />
            ) : viewType === ViewType.SLIDESHOW_HSBA_ACTIVE_ATTORNEYS ? (
              <SlideshowActiveAttorneysLineChart />
            ) : (
              <SlideshowBarAdmissionsChart data={chartData} viewType={viewType} />
            )}
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}
