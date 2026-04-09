import { BarAdmissionsChart } from '@/components/charts/BarAdmissionsChart'
import { SlideshowBarAdmissionsChart } from '@/components/charts/SlideshowBarAdmissionsChart'
import { SlideshowEligibilityLineChart } from '@/components/charts/SlideshowEligibilityLineChart'
import {
  calculateBarAdmissions,
  calculateSlideshowBarAdmissions,
  calculateSlideshowEligibleLineData
} from '@/utils/charts/barAdmissionsUtils'
import { ChartTestId, ViewType } from '@/types/chart'
import { loadTestRows } from '@tests/utils/testUtils'
import { Box } from '@mui/material'
import { render, screen, within } from '@testing-library/react'
import { Row } from '@/types/row'

describe('BarAdmissionsChart', () => {
  let rows: Row[] = []

  beforeAll(() => {
    rows = loadTestRows()
  })

  const testViews = [
    { testId: ChartTestId.BAR_ADMISSIONS_TOTAL, viewType: ViewType.TOTAL },
    { testId: ChartTestId.BAR_ADMISSIONS_BY_LICENSE_TYPE, viewType: ViewType.BY_LICENSE_TYPE },
    { testId: ChartTestId.BAR_ADMISSIONS_BY_LAW_SCHOOL, viewType: ViewType.BY_LAW_SCHOOL }
  ]

  testViews.forEach(({ testId, viewType }) => {
    describe(`${viewType} view`, () => {
      it('renders without crashing', () => {
        const data = calculateBarAdmissions(rows, viewType)

        render(<BarAdmissionsChart data={data} rows={rows} viewType={viewType} />)

        expect(screen.getByTestId(testId)).toBeInTheDocument()
      })
    })
  })

  describe('slideshow total view', () => {
    it('renders without crashing', () => {
      const data = calculateSlideshowBarAdmissions(rows, ViewType.TOTAL)

      render(
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 480, width: '100%' }}>
          <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', minHeight: 0 }}>
            <SlideshowBarAdmissionsChart data={data} viewType={ViewType.TOTAL} />
          </Box>
        </Box>
      )

      expect(screen.getByTestId(ChartTestId.SLIDESHOW_BAR_ADMISSIONS_TOTAL)).toBeInTheDocument()
    })
  })

  const slideshowTestViews = [
    {
      legendLabels: ['Eligible to practice', 'Limited eligibility to practice', 'Not eligible to practice'],
      testId: ChartTestId.SLIDESHOW_BAR_ADMISSIONS_BY_LICENSE_TYPE,
      viewType: ViewType.BY_LICENSE_TYPE
    },
    {
      legendLabels: ['William S. Richardson', 'Other'],
      testId: ChartTestId.SLIDESHOW_BAR_ADMISSIONS_BY_LAW_SCHOOL,
      viewType: ViewType.BY_LAW_SCHOOL
    }
  ]

  slideshowTestViews.forEach(({ legendLabels, testId, viewType }) => {
    describe(`slideshow ${viewType} view`, () => {
      it('renders with a persistent legend', () => {
        const data = calculateSlideshowBarAdmissions(rows, viewType)

        render(
          <Box sx={{ display: 'flex', flexDirection: 'column', height: 480, width: '100%' }}>
            <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', minHeight: 0 }}>
              <SlideshowBarAdmissionsChart data={data} viewType={viewType} />
            </Box>
          </Box>
        )

        const chartRoot = screen.getByTestId(testId)

        expect(chartRoot).toBeInTheDocument()

        legendLabels.forEach(label => {
          expect(within(chartRoot).getByText(label)).toBeInTheDocument()
        })
      })
    })
  })

  describe('slideshow eligibility line view', () => {
    it('renders without crashing', () => {
      const data = calculateSlideshowEligibleLineData(rows)

      render(
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 480, width: '100%' }}>
          <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', minHeight: 0 }}>
            <SlideshowEligibilityLineChart data={data} />
          </Box>
        </Box>
      )

      expect(screen.getByTestId(ChartTestId.SLIDESHOW_ELIGIBILITY_LINE)).toBeInTheDocument()
    })
  })
})
