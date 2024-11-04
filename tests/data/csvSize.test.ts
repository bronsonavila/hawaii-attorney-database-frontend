import { loadTestRows } from '../utils/testUtils'

describe('processed-member-records.csv', () => {
  it('contains more than 10,000 rows', () => {
    const rows = loadTestRows()

    expect(rows.length).toBeGreaterThan(10000)
  })
})
