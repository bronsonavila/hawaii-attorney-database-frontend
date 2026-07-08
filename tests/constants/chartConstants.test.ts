import { getLicenseTypeColor, LICENSE_TYPE_COLOR_PALETTE, LICENSE_TYPE_ORDER } from '@/constants/chartConstants'

describe('getLicenseTypeColor', () => {
  it('assigns colors by LICENSE_TYPE_ORDER index, not present-status position', () => {
    expect(getLicenseTypeColor('Active')).toBe(LICENSE_TYPE_COLOR_PALETTE[0])
    expect(getLicenseTypeColor('Inactive')).toBe(LICENSE_TYPE_COLOR_PALETTE[LICENSE_TYPE_ORDER.indexOf('Inactive')])
    expect(getLicenseTypeColor('Deceased')).toBe(LICENSE_TYPE_COLOR_PALETTE[LICENSE_TYPE_ORDER.indexOf('Deceased')])
  })

  it('uses the last palette color for unknown statuses', () => {
    expect(getLicenseTypeColor('Not A Real Status')).toBe(LICENSE_TYPE_COLOR_PALETTE[LICENSE_TYPE_COLOR_PALETTE.length - 1])
  })
})
