import { BarAdmissionsChart } from '../BarAdmissionsChart'
import { BarAdmissionsViewType } from '../../../types/chartTypes'
import { calculateBarAdmissions } from '../../../utils/chartUtils'
import { loadTestData } from '../../../utils/testUtils'
import { render, screen } from '@testing-library/react'
import { Row } from '../../../App'

describe('BarAdmissionsChart', () => {
  let rows: Row[] = []

  beforeAll(() => {
    rows = loadTestData()
  })

  const testViews = [
    { title: 'Admissions Over Time: Total', viewType: BarAdmissionsViewType.TOTAL },
    { title: 'Admissions Over Time: By License Type', viewType: BarAdmissionsViewType.BY_LICENSE_TYPE },
    { title: 'Admissions Over Time: By Law School', viewType: BarAdmissionsViewType.BY_LAW_SCHOOL }
  ]

  testViews.forEach(({ viewType, title }) => {
    describe(`${viewType} view`, () => {
      it('renders without crashing', () => {
        const data = calculateBarAdmissions(rows, viewType)

        render(<BarAdmissionsChart data={data} rows={rows} viewType={viewType} />)

        expect(screen.getByTitle(title)).toBeInTheDocument()
      })
    })
  })
})
