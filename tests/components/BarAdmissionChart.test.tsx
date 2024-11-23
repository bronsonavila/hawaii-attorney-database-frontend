import { BarAdmissionsChart } from '../../src/components/charts/BarAdmissionsChart'
import { calculateBarAdmissions } from '../../src/utils/charts/barAdmissionsUtils'
import { ChartTestId, ViewType } from '../../src/enums/chartEnums'
import { loadTestRows } from '../utils/testUtils'
import { render, screen } from '@testing-library/react'
import { Row } from '../../src/App'
import React from 'react'

describe('BarAdmissionsChart', () => {
  let rows: Row[] = []

  beforeAll(() => {
    rows = loadTestRows()
  })

  const testViews = [
    { testId: ChartTestId.BAR_ADMISSIONS_TOTAL, viewType: ViewType.TOTAL },
    { testId: ChartTestId.BAR_ADMISSIONS_BY_LICENSE_TYPE, viewType: ViewType.BY_LICENSE_TYPE },
    { testId: ChartTestId.BAR_ADMISSIONS_BY_LAW_SCHOOL, viewType: ViewType.BY_LAW_SCHOOL }
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
