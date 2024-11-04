import { BarAdmissionsChart } from '../../../src/components/charts/BarAdmissionsChart'
import { BarAdmissionsViewType, ChartTestId } from '../../../src/types/chartTypes'
import { calculateBarAdmissions } from '../../../src/utils/chartUtils'
import { loadTestRows } from '../../utils/testUtils'
import { render, screen } from '@testing-library/react'
import { Row } from '../../../src/App'
import React from 'react'

describe('BarAdmissionsChart', () => {
  let rows: Row[] = []

  beforeAll(() => {
    rows = loadTestRows()
  })

  const testViews = [
    { testId: ChartTestId.BAR_ADMISSIONS_TOTAL, viewType: BarAdmissionsViewType.TOTAL },
    { testId: ChartTestId.BAR_ADMISSIONS_BY_LICENSE_TYPE, viewType: BarAdmissionsViewType.BY_LICENSE_TYPE },
    { testId: ChartTestId.BAR_ADMISSIONS_BY_LAW_SCHOOL, viewType: BarAdmissionsViewType.BY_LAW_SCHOOL }
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
})
