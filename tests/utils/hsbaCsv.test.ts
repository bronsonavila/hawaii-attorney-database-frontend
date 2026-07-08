import { getUniqueLicenseTypes } from '@/utils/charts/commonUtils'
import { mapHsbaCsvRowToRow } from '@/utils/rows/hsbaCsv'
import { loadTestRows } from '@tests/utils/testUtils'

const EXPECTED_FILTER_OPTIONS = [
  'Active',
  'Criminal Conviction',
  'Deceased',
  'Disbarred',
  'Foreign Law Consultant',
  'Government',
  'Inactive - Emeritus',
  'Inactive - Medical',
  'Inactive - Pro Bono',
  'Inactive - Voluntary',
  'Judge',
  'LLPE',
  'Pro Hac Vice',
  'RLSA',
  'RMSA',
  'Resigned - Discipline',
  'Resigned - Voluntary',
  'Restrained from Practice',
  'Retired Judge Per Diem',
  'Suspended - CLE',
  'Suspended - Disciplined',
  'Suspended - Non-Payment',
  'Suspended - Professionalism Course'
]

describe('hsbaCsv license type aliases', () => {
  it.each([
    ['Resign - Voluntary', 'Resigned - Voluntary'],
    ['Resign - Discipline', 'Resigned - Discipline'],
    ['Suspended - Non Payment', 'Suspended - Non-Payment'],
    ['Suspended - Discipline', 'Suspended - Disciplined'],
    ['Suspended CLE', 'Suspended - CLE'],
    ['Suspended Professionalism Course', 'Suspended - Professionalism Course']
  ])('maps raw "%s" to "%s"', (raw, expected) => {
    expect(mapHsbaCsvRowToRow({ membership_status: raw, id: '1' }).licenseType).toBe(expected)
  })

  it('returns 23 deduplicated filter options from real CSV data', () => {
    const rows = loadTestRows()
    const licenseTypes = getUniqueLicenseTypes(rows)

    expect(licenseTypes).toHaveLength(23)
    expect(licenseTypes).toEqual(EXPECTED_FILTER_OPTIONS)
  })
})
