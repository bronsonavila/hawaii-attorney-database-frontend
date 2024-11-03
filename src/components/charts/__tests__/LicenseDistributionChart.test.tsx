import { calculateLicenseDistribution, getUniqueLicenseTypes } from '../../../utils/chartUtils'
import { LicenseDistributionChart } from '../LicenseDistributionChart'
import { loadTestData } from '../../../utils/testUtils'
import { render, screen } from '@testing-library/react'
import { Row } from '../../../App'

describe('LicenseDistributionChart', () => {
  let rows: Row[] = []

  beforeAll(() => {
    rows = loadTestData()
  })

  const testViews = [
    {
      getExpectedLabels: (rows: Row[]) => getUniqueLicenseTypes(rows),
      name: 'total view',
      title: 'License Type Distribution: Total',
      viewType: 'total' as const
    },
    {
      getExpectedLabels: (rows: Row[]) => getUniqueLicenseTypes(rows),
      name: 'byLawSchool view',
      title: 'License Type Distribution: By Law School',
      viewType: 'byLawSchool' as const
    },
    {
      getExpectedLabels: (rows: Row[]) => getUniqueLicenseTypes(rows),
      name: 'byAdmissionDate view',
      title: 'License Type Distribution: By Admission Date',
      viewType: 'byAdmissionDate' as const
    }
  ]

  testViews.forEach(({ name, viewType, title, getExpectedLabels }) => {
    describe(name, () => {
      it('renders without crashing', () => {
        const data = calculateLicenseDistribution(rows, viewType)

        render(<LicenseDistributionChart data={data} rows={rows} viewType={viewType} />)

        expect(screen.getByTitle(title)).toBeInTheDocument()
      })

      it('displays correct data labels', () => {
        const data = calculateLicenseDistribution(rows, viewType)
        const expectedLabels = getExpectedLabels(rows)

        render(<LicenseDistributionChart data={data} rows={rows} viewType={viewType} />)

        expectedLabels.forEach(label => expect(screen.getByText(label)).toBeInTheDocument())
      })
    })
  })
})
