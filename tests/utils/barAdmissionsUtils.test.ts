import { calculateBarAdmissions } from '../../src/utils/charts/barAdmissionsUtils'
import { ViewType } from '../../src/enums/chartEnums'
import { Row } from '../../src/types/row'

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
  it('excludes Pro Hac Vice, consolidates Inactive/Suspended sub-statuses, and does not inject absent statuses', () => {
    const rows: Row[] = [
      // Use HSBA-like date format (M/D/YYYY). ISO YYYY-MM-DD is parsed as UTC in JS and can shift years by timezone.
      makeRow({ barAdmissionDate: '1/15/2000', id: 'a', licenseType: 'Active' }),
      makeRow({ barAdmissionDate: '2/15/2000', id: 'b', licenseType: 'Inactive Pro Bono' }),
      makeRow({ barAdmissionDate: '1/15/2001', id: 'c', licenseType: 'Suspended - Disciplined' }),
      makeRow({ barAdmissionDate: '2/15/2001', id: 'd', licenseType: 'Suspended - Non-Payment' }),
      // Should always be excluded from Bar Admissions, even if a date is present.
      makeRow({ barAdmissionDate: '3/15/2000', id: 'e', licenseType: 'Pro Hac Vice' })
    ]

    const data = calculateBarAdmissions(rows, ViewType.BY_LICENSE_TYPE) as Array<Record<string, unknown>>

    expect(data).toHaveLength(2)
    expect(data[0].year).toBe('2000')
    expect(data[1].year).toBe('2001')

    const year2000 = data[0] as Record<string, number | string>
    const year2001 = data[1] as Record<string, number | string>

    // No injected/legacy keys.
    expect('Government' in year2000).toBe(false)
    expect('Pro Hac Vice' in year2000).toBe(false)
    expect('Inactive Pro Bono' in year2000).toBe(false)
    expect('Inactive Voluntary' in year2000).toBe(false)
    expect('Suspended - Disciplined' in year2000).toBe(false)
    expect('Suspended - Non-Payment' in year2000).toBe(false)

    // Consolidated buckets exist.
    expect('Inactive' in year2000).toBe(true)
    expect('Suspended' in year2000).toBe(true)

    // Counts: 2000 includes Active + Inactive Pro Bono; Pro Hac Vice excluded.
    expect(year2000.count).toBe(2)
    expect(year2000.Active).toBe(1)
    expect(year2000.Inactive).toBe(1)
    expect(year2000.Suspended).toBe(0)

    // Counts: 2001 includes two suspended variants consolidated.
    expect(year2001.count).toBe(2)
    expect(year2001.Active).toBe(0)
    expect(year2001.Inactive).toBe(0)
    expect(year2001.Suspended).toBe(2)
  })
})
