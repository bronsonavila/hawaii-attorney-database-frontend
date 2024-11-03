import { calculateTopEmployers } from '../../../utils/chartUtils'
import { loadTestData } from '../../../utils/testUtils'
import { render, screen } from '@testing-library/react'
import { Row } from '../../../App'
import { TopEmployersChart } from '../TopEmployersChart'

describe('TopEmployersChart', () => {
  let rows: Row[] = []

  beforeAll(() => {
    rows = loadTestData()
  })

  const testViews = [
    { name: 'total view', title: 'Top Employers: Total', viewType: 'total' as const },
    { name: 'byLawSchool view', title: 'Top Employers: By Law School', viewType: 'byLawSchool' as const },
    { name: 'byAdmissionDate view', title: 'Top Employers: By Admission Date', viewType: 'byAdmissionDate' as const }
  ]

  testViews.forEach(({ name, viewType, title }) => {
    describe(name, () => {
      it('renders without crashing', () => {
        const data = calculateTopEmployers(rows, viewType)

        render(<TopEmployersChart data={data} viewType={viewType} />)

        expect(screen.getByTitle(title)).toBeInTheDocument()
      })
    })
  })
})
