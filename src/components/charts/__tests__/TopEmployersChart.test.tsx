import { calculateTopEmployers } from '../../../utils/chartUtils'
import { loadTestData } from '../../../utils/testUtils'
import { render, screen } from '@testing-library/react'
import { Row } from '../../../App'
import { TopEmployersChart } from '../TopEmployersChart'
import { TopEmployersViewType } from '../../../types/chartTypes'

describe('TopEmployersChart', () => {
  let rows: Row[] = []

  beforeAll(() => {
    rows = loadTestData()
  })

  const testViews = [
    { title: 'Top Employers: Total', viewType: TopEmployersViewType.TOTAL },
    { title: 'Top Employers: By Admission Date', viewType: TopEmployersViewType.BY_ADMISSION_DATE },
    { title: 'Top Employers: By Law School', viewType: TopEmployersViewType.BY_LAW_SCHOOL }
  ]

  testViews.forEach(({ viewType, title }) => {
    describe(`${viewType} view`, () => {
      it('renders without crashing', () => {
        const data = calculateTopEmployers(rows, viewType)

        render(<TopEmployersChart data={data} viewType={viewType} />)

        expect(screen.getByTitle(title)).toBeInTheDocument()
      })
    })
  })
})
