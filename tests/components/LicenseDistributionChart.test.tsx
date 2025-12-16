import { calculateLicenseDistribution } from '@/utils/charts/licenseDistributionUtils'
import { ChartTestId, ViewType } from '@/enums/chartEnums'
import { getUniqueLicenseTypes } from '@/utils/charts/commonUtils'
import { LicenseDistributionChart } from '@/components/charts/LicenseDistributionChart'
import { loadTestRows } from '@tests/utils/testUtils'
import { render, screen } from '@testing-library/react'
import { Row } from '@/types/row'

describe('LicenseDistributionChart', () => {
  let rows: Row[] = []

  beforeAll(() => {
    rows = loadTestRows()
  })

  const testViews = [
    { testId: ChartTestId.LICENSE_DISTRIBUTION_TOTAL, viewType: ViewType.TOTAL },
    { testId: ChartTestId.LICENSE_DISTRIBUTION_BY_ADMISSION_DATE, viewType: ViewType.BY_ADMISSION_DATE },
    { testId: ChartTestId.LICENSE_DISTRIBUTION_BY_LAW_SCHOOL, viewType: ViewType.BY_LAW_SCHOOL }
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
