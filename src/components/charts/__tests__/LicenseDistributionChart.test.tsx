import { calculateLicenseDistribution, getUniqueLicenseTypes } from '../../../utils/chartUtils'
import { LicenseDistributionChart } from '../LicenseDistributionChart'
import { ChartTestId, LicenseDistributionViewType } from '../../../types/chartTypes'
import { loadTestData } from '../../../utils/testUtils'
import { render, screen } from '@testing-library/react'
import { Row } from '../../../App'

describe('LicenseDistributionChart', () => {
  let rows: Row[] = []

  beforeAll(() => {
    rows = loadTestData()
  })

  const testViews = [
    { testId: ChartTestId.LICENSE_DISTRIBUTION_TOTAL, viewType: LicenseDistributionViewType.TOTAL },
    {
      testId: ChartTestId.LICENSE_DISTRIBUTION_BY_ADMISSION_DATE,
      viewType: LicenseDistributionViewType.BY_ADMISSION_DATE
    },
    { testId: ChartTestId.LICENSE_DISTRIBUTION_BY_LAW_SCHOOL, viewType: LicenseDistributionViewType.BY_LAW_SCHOOL }
  ]

  testViews.forEach(({ testId, viewType }) => {
    describe(`${viewType} view`, () => {
      it('renders without crashing', () => {
        const data = calculateLicenseDistribution(rows, viewType)

        render(<LicenseDistributionChart data={data} rows={rows} viewType={viewType} />)

        expect(screen.getByTestId(testId)).toBeInTheDocument()
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
