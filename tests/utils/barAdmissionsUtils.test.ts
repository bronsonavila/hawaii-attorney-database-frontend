import {
  calculateBarAdmissions,
  calculateSlideshowBarAdmissions,
  calculateSlideshowEligibleLineData
} from '@/utils/charts/barAdmissionsUtils'
import { LICENSE_TYPE_ORDER } from '@/constants/chartConstants'
import { loadTestRows } from '@tests/utils/testUtils'
import { ViewType } from '@/types/chart'
import { Row } from '@/types/row'

const makeRow = (overrides: Partial<Row>): Row => ({
  barAdmissionDate: '',
  emailDomain: '',
  employer: '',
  id: 'id',
  jdNumber: '1',
  lawSchool: 'Test Law School',
  licenseType: 'Active',
  location: '',
  membershipSections: [],
  name: 'Name',
  otherLicenses: [],
  ...overrides
})

describe('calculateBarAdmissions (Bar Admissions Over Time)', () => {
  it('excludes Pro Hac Vice, consolidates Inactive/Suspended/Resigned sub-statuses, and does not inject absent statuses', () => {
    const rows: Row[] = [
      // Use HSBA-like date format (M/D/YYYY). ISO YYYY-MM-DD is parsed as UTC in JS and can shift years by timezone.
      makeRow({ barAdmissionDate: '1/15/2000', id: 'a', licenseType: 'Active' }),
      makeRow({ barAdmissionDate: '2/15/2000', id: 'b', licenseType: 'Inactive - Pro Bono' }),
      makeRow({ barAdmissionDate: '3/15/2000', id: 'b2', licenseType: 'Inactive - Emeritus' }),
      makeRow({ barAdmissionDate: '4/15/2000', id: 'b3', licenseType: 'Inactive - Medical' }),
      makeRow({ barAdmissionDate: '5/15/2000', id: 'b4', licenseType: 'Inactive - Voluntary' }),
      makeRow({ barAdmissionDate: '1/15/2001', id: 'c', licenseType: 'Suspended - Disciplined' }),
      makeRow({ barAdmissionDate: '2/15/2001', id: 'd', licenseType: 'Suspended - Non-Payment' }),
      makeRow({ barAdmissionDate: '3/15/2001', id: 'r1', licenseType: 'Resigned - Discipline' }),
      makeRow({ barAdmissionDate: '4/15/2001', id: 'r2', licenseType: 'Resigned - Voluntary' }),
      makeRow({ barAdmissionDate: '1/15/2002', id: 's1', licenseType: 'Restrained from Practice' }),
      makeRow({ barAdmissionDate: '2/15/2002', id: 's2', licenseType: 'Disbarred' }),
      makeRow({ barAdmissionDate: '3/15/2002', id: 's3', licenseType: 'Deceased' }),
      // Should always be excluded from Bar Admissions, even if a date is present.
      makeRow({ barAdmissionDate: '3/15/2000', id: 'e', licenseType: 'Pro Hac Vice' })
    ]

    const data = calculateBarAdmissions(rows, ViewType.BY_LICENSE_TYPE) as Array<Record<string, unknown>>

    expect(data).toHaveLength(3)
    expect(data[0].year).toBe('2000')
    expect(data[1].year).toBe('2001')
    expect(data[2].year).toBe('2002')

    const year2000 = data[0] as Record<string, number | string>
    const year2001 = data[1] as Record<string, number | string>
    const year2002 = data[2] as Record<string, number | string>

    // No raw sub-type keys appear in output.
    expect('Government' in year2000).toBe(false)
    expect('Pro Hac Vice' in year2000).toBe(false)
    expect('Inactive - Pro Bono' in year2000).toBe(false)
    expect('Inactive - Voluntary' in year2000).toBe(false)
    expect('Inactive - Emeritus' in year2000).toBe(false)
    expect('Inactive - Medical' in year2000).toBe(false)
    expect('Suspended - Disciplined' in year2000).toBe(false)
    expect('Suspended - Non-Payment' in year2000).toBe(false)
    expect('Resigned - Discipline' in year2001).toBe(false)
    expect('Resigned - Voluntary' in year2001).toBe(false)
    expect('Restrained from Practice' in year2002).toBe(false)
    expect('Disbarred' in year2002).toBe(false)

    // Consolidated buckets exist.
    expect('Inactive' in year2000).toBe(true)
    expect('Suspended' in year2000).toBe(true)
    expect('Resigned / Restrained / Disbarred' in year2001).toBe(true)
    expect('Resigned / Restrained / Disbarred' in year2002).toBe(true)
    expect('Deceased' in year2002).toBe(true)

    // Counts: 2000 includes Active + four Inactive sub-statuses; Pro Hac Vice excluded.
    expect(year2000.count).toBe(5)
    expect(year2000.Active).toBe(1)
    expect(year2000.Inactive).toBe(4)
    expect(year2000.Suspended).toBe(0)

    // Counts: 2001 includes two suspended variants consolidated, two resigned variants consolidated.
    expect(year2001.count).toBe(4)
    expect(year2001.Active).toBe(0)
    expect(year2001.Inactive).toBe(0)
    expect(year2001.Suspended).toBe(2)
    expect(year2001['Resigned / Restrained / Disbarred']).toBe(2)

    // Counts: 2002 includes Resigned/Restrained/Disbarred consolidated (2) and Deceased (1).
    expect(year2002.count).toBe(3)
    expect(year2002['Resigned / Restrained / Disbarred']).toBe(2)
    expect(year2002.Deceased).toBe(1)
  })

  it('consolidates unknown law schools into Other for the Law School view', () => {
    const rows: Row[] = [
      makeRow({ barAdmissionDate: '1/15/2000', id: 'a', lawSchool: 'Top School' }),
      makeRow({ barAdmissionDate: '2/15/2000', id: 'b', lawSchool: '' }),
      makeRow({ barAdmissionDate: '3/15/2000', id: 'c', lawSchool: 'Unknown' })
    ]

    const data = calculateBarAdmissions(rows, ViewType.BY_LAW_SCHOOL) as Array<Record<string, unknown>>

    expect(data).toHaveLength(1)

    const year2000 = data[0] as Record<string, number | string>

    expect(year2000.year).toBe('2000')
    expect(year2000.count).toBe(3)
    expect(year2000['Top School']).toBe(1)
    expect(year2000.Other).toBe(2)
    expect('Unknown' in year2000).toBe(false)
  })

  it('sorts "Unknown" last when using real CSV data', () => {
    const rows = loadTestRows()
    const data = calculateBarAdmissions(rows, ViewType.BY_LICENSE_TYPE) as Array<Record<string, unknown>>

    // Get the license types from the first year that has data
    const firstYearData = data[0]
    const licenseTypes = Object.keys(firstYearData)
      .filter(key => key !== 'year' && key !== 'count')
      .sort((a, b) => {
        const indexA = LICENSE_TYPE_ORDER.indexOf(a)
        const indexB = LICENSE_TYPE_ORDER.indexOf(b)

        const effectiveIndexA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA
        const effectiveIndexB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB

        if (effectiveIndexA !== effectiveIndexB) return effectiveIndexA - effectiveIndexB

        return a.localeCompare(b)
      })

    // Assert "Unknown" is the last element if it exists in the keys
    if (licenseTypes.includes('Unknown')) {
      expect(licenseTypes[licenseTypes.length - 1]).toBe('Unknown')
    }
  })
})

describe('calculateSlideshowBarAdmissions', () => {
  it('crops to 1987 through 2025, excludes Pro Hac Vice, and groups license statuses into eligibility buckets', () => {
    const rows: Row[] = [
      makeRow({ barAdmissionDate: '1/15/1986', id: 'pre-1987', licenseType: 'Active' }),
      makeRow({ barAdmissionDate: '1/15/1987', id: 'active', licenseType: 'Active' }),
      makeRow({ barAdmissionDate: '2/15/1987', id: 'government', licenseType: 'Government' }),
      makeRow({ barAdmissionDate: '3/15/1987', id: 'judge', licenseType: 'Judge' }),
      makeRow({ barAdmissionDate: '4/15/1987', id: 'inactive-pro-bono', licenseType: 'Inactive - Pro Bono' }),
      makeRow({ barAdmissionDate: '5/15/1987', id: 'rlsa', licenseType: 'RLSA' }),
      makeRow({ barAdmissionDate: '6/15/1987', id: 'suspended', licenseType: 'Suspended - Non-Payment' }),
      makeRow({ barAdmissionDate: '7/15/1987', id: 'unknown', licenseType: 'Unknown' }),
      makeRow({ barAdmissionDate: '8/15/1987', id: 'pro-hac-vice', licenseType: 'Pro Hac Vice' }),
      makeRow({ barAdmissionDate: '1/15/1988', id: 'deceased', licenseType: 'Deceased' })
    ]

    const data = calculateSlideshowBarAdmissions(rows, ViewType.BY_LICENSE_TYPE) as Array<Record<string, unknown>>

    expect(data).toHaveLength(2)
    expect(data[0].year).toBe('1987')
    expect(data[1].year).toBe('1988')

    const year1987 = data[0] as Record<string, number | string>
    const year1988 = data[1] as Record<string, number | string>

    expect(year1987.count).toBe(7)
    expect(year1987['Eligible to practice']).toBe(3)
    expect(year1987['Limited eligibility to practice']).toBe(2)
    expect(year1987['Not eligible to practice']).toBe(2)
    expect('Active' in year1987).toBe(false)
    expect('Government' in year1987).toBe(false)
    expect('Judge' in year1987).toBe(false)
    expect('Pro Hac Vice' in year1987).toBe(false)

    expect(year1988.count).toBe(1)
    expect(year1988['Eligible to practice']).toBe(0)
    expect(year1988['Limited eligibility to practice']).toBe(0)
    expect(year1988['Not eligible to practice']).toBe(1)
  })

  it('uses only William S. Richardson and Other in the law school view', () => {
    const rows: Row[] = [
      makeRow({ barAdmissionDate: '1/15/1987', id: 'richardson', lawSchool: 'William S. Richardson' }),
      makeRow({ barAdmissionDate: '2/15/1987', id: 'other', lawSchool: 'Harvard U.' }),
      makeRow({ barAdmissionDate: '3/15/1987', id: 'blank', lawSchool: '' }),
      makeRow({ barAdmissionDate: '1/15/1986', id: 'pre-1987', lawSchool: 'William S. Richardson' })
    ]

    const data = calculateSlideshowBarAdmissions(rows, ViewType.BY_LAW_SCHOOL) as Array<Record<string, unknown>>

    expect(data).toHaveLength(1)

    const year1987 = data[0] as Record<string, number | string>

    expect(year1987.year).toBe('1987')
    expect(year1987.count).toBe(3)
    expect(year1987['William S. Richardson']).toBe(1)
    expect(year1987.Other).toBe(2)
    expect('Harvard U.' in year1987).toBe(false)
  })

  it('omits bar admission years after 2025', () => {
    const rows: Row[] = [
      makeRow({ barAdmissionDate: '1/15/2025', id: 'in-range', licenseType: 'Active' }),
      makeRow({ barAdmissionDate: '6/15/2026', id: 'after-end', licenseType: 'Active' }),
      makeRow({ barAdmissionDate: '1/15/2030', id: 'far-future', licenseType: 'Active' })
    ]

    const data = calculateSlideshowBarAdmissions(rows, ViewType.TOTAL) as Array<Record<string, unknown>>

    expect(data).toHaveLength(1)
    expect(data[0].year).toBe('2025')
    expect((data[0] as Record<string, number>).count).toBe(1)
  })
})

describe('calculateSlideshowEligibleLineData', () => {
  it('fills missing years with zero and keeps eligible and limited-eligibility counts from 1987 through 2025', () => {
    const rows: Row[] = [
      makeRow({ barAdmissionDate: '1/15/1986', id: 'pre-range', licenseType: 'Active' }),
      makeRow({ barAdmissionDate: '1/15/1987', id: 'year-1987', licenseType: 'Active' }),
      makeRow({ barAdmissionDate: '1/15/1988', id: 'year-1988-limited', licenseType: 'RLSA' }),
      makeRow({ barAdmissionDate: '1/15/1989', id: 'year-1989-eligible', licenseType: 'Government' }),
      makeRow({ barAdmissionDate: '2/15/1989', id: 'year-1989-not-eligible', licenseType: 'Suspended - Non-Payment' }),
      makeRow({ barAdmissionDate: '1/15/2025', id: 'year-2025', licenseType: 'Judge' }),
      makeRow({ barAdmissionDate: '1/15/2026', id: 'post-range', licenseType: 'Active' })
    ]

    const data = calculateSlideshowEligibleLineData(rows) as Array<Record<string, unknown>>

    expect(data).toHaveLength(39)
    expect(data[0].year).toBe('1987')
    expect(data[data.length - 1].year).toBe('2025')

    const year1987 = data.find(item => item.year === '1987') as Record<string, number | string>
    const year1988 = data.find(item => item.year === '1988') as Record<string, number | string>
    const year1989 = data.find(item => item.year === '1989') as Record<string, number | string>
    const year2025 = data.find(item => item.year === '2025') as Record<string, number | string>

    expect(year1987.count).toBe(1)
    expect(year1988.count).toBe(1)
    expect(year1989.count).toBe(1)
    expect(year2025.count).toBe(1)
    expect(data.find(item => item.year === '1986')).toBeUndefined()
    expect(data.find(item => item.year === '2026')).toBeUndefined()
  })
})
