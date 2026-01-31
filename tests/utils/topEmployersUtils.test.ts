import { calculateTopEmployers } from '@/utils/charts/topEmployersUtils'
import { ViewType } from '@/types/chart'
import { Row } from '@/types/row'

const makeRow = (overrides: Partial<Row>): Row => ({
  barAdmissionDate: '',
  emailDomain: '',
  employer: 'Test Firm',
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

describe('calculateTopEmployers (Top Employers)', () => {
  it('consolidates unknown law schools into Other for the Law School view', () => {
    const rows: Row[] = [
      makeRow({ id: 'a', employer: 'Firm A', lawSchool: 'Top School' }),
      makeRow({ id: 'b', employer: 'Firm A', lawSchool: '' }),
      makeRow({ id: 'c', employer: 'Firm A', lawSchool: 'Unknown' })
    ]

    const data = calculateTopEmployers(rows, ViewType.BY_LAW_SCHOOL) as Array<Record<string, unknown>>
    const firmA = data.find(d => d.label === 'Firm A') as Record<string, number | string> | undefined

    expect(firmA).toBeTruthy()
    expect(firmA?.count).toBe(3)
    expect(firmA?.['Top School']).toBe(1)
    expect(firmA?.Other).toBe(2)
    expect(firmA && 'Unknown' in firmA).toBe(false)
  })
})
