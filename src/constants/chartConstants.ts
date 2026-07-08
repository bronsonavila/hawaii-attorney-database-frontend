import { AMBER_BROWN, ROSE_VIOLET, TEAL_NAVY } from '@/constants/colors'

export const LAW_SCHOOL_COLOR_PALETTE = [...TEAL_NAVY[3], ...AMBER_BROWN[4], ...ROSE_VIOLET[5]]

export const LICENSE_TYPE_ORDER = [
  'Active',
  'Government',
  'Judge',
  'Retired Judge Per Diem',
  'RLSA',
  'RMSA',
  'LLPE',
  'Foreign Law Consultant',
  'Inactive',
  'Suspended',
  'Resigned / Restrained / Disbarred',
  'Deceased',
  'Unknown'
]

export const LICENSE_TYPE_COLOR_PALETTE = [...TEAL_NAVY[4], ...AMBER_BROWN[4], ...ROSE_VIOLET[5]]

export const getLicenseTypeColor = (licenseType: string): string => {
  const orderIndex = LICENSE_TYPE_ORDER.indexOf(licenseType)

  return orderIndex === -1
    ? LICENSE_TYPE_COLOR_PALETTE[LICENSE_TYPE_COLOR_PALETTE.length - 1]
    : LICENSE_TYPE_COLOR_PALETTE[orderIndex]
}
