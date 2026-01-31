import { calculateLicenseDistribution } from '@/utils/charts/licenseDistributionUtils'
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
  isMissingFromSource: false,
  ...overrides
})

describe('calculateLicenseDistribution (License Distribution)', () => {
  it('consolidates unknown law schools into Other for the Law School view', () => {
    const rows: Row[] = [
      makeRow({ id: 'a', licenseType: 'Active', lawSchool: 'Top School' }),
      makeRow({ id: 'b', licenseType: 'Active', lawSchool: '' }),
      makeRow({ id: 'c', licenseType: 'Active', lawSchool: 'Unknown' })
    ]

    const data = calculateLicenseDistribution(rows, ViewType.BY_LAW_SCHOOL) as Array<Record<string, unknown>>
    const active = data.find(d => d.licenseType === 'Active') as Record<string, number | string> | undefined

    expect(active).toBeTruthy()
    expect(active?.count).toBe(3)
    expect(active?.['Top School']).toBe(1)
    expect(active?.Other).toBe(2)
    expect(active && 'Unknown' in active).toBe(false)
  })
})
