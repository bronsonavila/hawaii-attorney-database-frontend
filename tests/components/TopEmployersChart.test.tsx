import { calculateTopEmployers } from '../../src/utils/charts/topEmployersUtils'
import { ChartTestId, ViewType } from '../../src/enums/chartEnums'
import { loadTestRows } from '../utils/testUtils'
import { render, screen } from '@testing-library/react'
import { Row } from '../../src/App'
import { TopEmployersChart } from '../../src/components/charts/TopEmployersChart'
import React from 'react'

describe('TopEmployersChart', () => {
  let rows: Row[] = []

  beforeAll(() => {
    rows = loadTestRows()
  })

  const testViews = [
    { testId: ChartTestId.TOP_EMPLOYERS_TOTAL, viewType: ViewType.TOTAL },
    { testId: ChartTestId.TOP_EMPLOYERS_BY_ADMISSION_DATE, viewType: ViewType.BY_ADMISSION_DATE },
    { testId: ChartTestId.TOP_EMPLOYERS_BY_LAW_SCHOOL, viewType: ViewType.BY_LAW_SCHOOL }
  ]

  testViews.forEach(({ testId, viewType }) => {
    describe(`${viewType} view`, () => {
      it('renders without crashing', () => {
        const data = calculateTopEmployers(rows, viewType)

        render(<TopEmployersChart data={data} viewType={viewType} />)

        expect(screen.getByTestId(testId)).toBeInTheDocument()
      })
    })
  })
})
