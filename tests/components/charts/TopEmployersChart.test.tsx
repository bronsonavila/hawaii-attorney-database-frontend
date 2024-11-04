import { calculateTopEmployers } from '../../../src/utils/chartUtils'
import { ChartTestId, TopEmployersViewType } from '../../../src/types/chartTypes'
import { loadTestRows } from '../../utils/testUtils'
import { render, screen } from '@testing-library/react'
import { Row } from '../../../src/App'
import { TopEmployersChart } from '../../../src/components/charts/TopEmployersChart'
import React from 'react'

describe('TopEmployersChart', () => {
  let rows: Row[] = []

  beforeAll(() => {
    rows = loadTestRows()
  })

  const testViews = [
    { testId: ChartTestId.TOP_EMPLOYERS_TOTAL, viewType: TopEmployersViewType.TOTAL },
    { testId: ChartTestId.TOP_EMPLOYERS_BY_ADMISSION_DATE, viewType: TopEmployersViewType.BY_ADMISSION_DATE },
    { testId: ChartTestId.TOP_EMPLOYERS_BY_LAW_SCHOOL, viewType: TopEmployersViewType.BY_LAW_SCHOOL }
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
