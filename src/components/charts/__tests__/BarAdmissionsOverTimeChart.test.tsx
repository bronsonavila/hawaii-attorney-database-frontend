import { BarAdmissionsOverTimeChart } from '../BarAdmissionsOverTimeChart'
import { calculateBarAdmissionsOverTime } from '../../../utils/chartUtils'
import { loadTestData } from '../../../utils/testUtils'
import { render, screen } from '@testing-library/react'
import { Row } from '../../../App'

describe('BarAdmissionsOverTimeChart', () => {
  let rows: Row[] = []

  beforeAll(() => {
    rows = loadTestData()
  })

  const testViews = [
    { name: 'total view', title: 'Admissions Over Time: Total', viewType: 'total' as const },
    { name: 'byLicenseType view', title: 'Admissions Over Time: By License Type', viewType: 'byLicenseType' as const },
    { name: 'byLawSchool view', title: 'Admissions Over Time: By Law School', viewType: 'byLawSchool' as const }
  ]

  testViews.forEach(({ name, viewType, title }) => {
    describe(name, () => {
      it('renders without crashing', () => {
        const data = calculateBarAdmissionsOverTime(rows, viewType)

        render(<BarAdmissionsOverTimeChart data={data} rows={rows} viewType={viewType} />)

        expect(screen.getByTitle(title)).toBeInTheDocument()
      })
    })
  })
})
