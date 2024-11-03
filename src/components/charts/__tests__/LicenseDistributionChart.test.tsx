import { calculateLicenseDistribution, getUniqueLicenseTypes } from '../../../utils/chartUtils'
import { LicenseDistributionChart } from '../LicenseDistributionChart'
import { LicenseDistributionViewType } from '../../../types/chartTypes'
import { loadTestData } from '../../../utils/testUtils'
import { render, screen } from '@testing-library/react'
import { Row } from '../../../App'

describe('LicenseDistributionChart', () => {
  let rows: Row[] = []

  beforeAll(() => {
    rows = loadTestData()
  })

  const testViews = [
    { title: 'License Type Distribution: Total', viewType: LicenseDistributionViewType.TOTAL },
    { title: 'License Type Distribution: By Admission Date', viewType: LicenseDistributionViewType.BY_ADMISSION_DATE },
    { title: 'License Type Distribution: By Law School', viewType: LicenseDistributionViewType.BY_LAW_SCHOOL }
  ]

  testViews.forEach(({ title, viewType }) => {
    describe(`${viewType} view`, () => {
      it('renders without crashing', () => {
        const data = calculateLicenseDistribution(rows, viewType)

        render(<LicenseDistributionChart data={data} rows={rows} viewType={viewType} />)

        expect(screen.getByTitle(title)).toBeInTheDocument()
      })

      it('displays correct data labels', () => {
        const data = calculateLicenseDistribution(rows, viewType)
        const expectedLabels = getUniqueLicenseTypes(rows)

        render(<LicenseDistributionChart data={data} rows={rows} viewType={viewType} />)

        expectedLabels.forEach(label => expect(screen.getByText(label)).toBeInTheDocument())
      })
    })
  })
})
