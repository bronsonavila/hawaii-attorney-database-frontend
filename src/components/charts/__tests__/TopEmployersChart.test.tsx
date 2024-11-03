import { calculateTopEmployers } from '../../../utils/chartUtils'
import { loadTestData } from '../../../utils/testUtils'
import { render, screen } from '@testing-library/react'
import { Row } from '../../../App'
import { TopEmployersChart } from '../TopEmployersChart'
import { ChartTestId, TopEmployersViewType } from '../../../types/chartTypes'

describe('TopEmployersChart', () => {
  let rows: Row[] = []

  beforeAll(() => {
    rows = loadTestData()
  })

  const testViews = [
    { testId: ChartTestId.TOP_EMPLOYERS_TOTAL, viewType: TopEmployersViewType.TOTAL },
    { testId: ChartTestId.TOP_EMPLOYERS_BY_ADMISSION_DATE, viewType: TopEmployersViewType.BY_ADMISSION_DATE },
    { testId: ChartTestId.TOP_EMPLOYERS_BY_LAW_SCHOOL, viewType: TopEmployersViewType.BY_LAW_SCHOOL }
  ]

  testViews.forEach(({ testId, viewType }) => {
    describe(`${viewType} view`, () => {
      it('renders without crashing', () => {
        const data = calculateTopEmployers(rows, viewType)

        render(<TopEmployersChart data={data} viewType={viewType} />)

        expect(screen.getByTestId(testId)).toBeInTheDocument()
      })
    })
  })
})
