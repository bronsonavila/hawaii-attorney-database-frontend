import { DatasetType } from '@mui/x-charts/internals'
import { getTopLawSchools } from '@/utils/charts/commonUtils'
import {
  LICENSE_TYPE_ORDER,
  SLIDESHOW_BAR_ADMISSIONS_START_YEAR,
  SLIDESHOW_LAW_SCHOOL_ORDER,
  SLIDESHOW_LICENSE_TYPE_ORDER
} from '@/constants/chartConstants'
import { Row } from '@/types/row'
import { ViewType } from '@/types/chart'

const ELIGIBLE_TO_PRACTICE = 'Eligible to practice'
const LIMITED_ELIGIBILITY_TO_PRACTICE = 'Limited eligibility to practice'
const NOT_ELIGIBLE_TO_PRACTICE = 'Not eligible to practice'

const EXCLUDED_BAR_ADMISSIONS_LICENSE_TYPES = new Set(['Pro Hac Vice'])

const ELIGIBLE_TO_PRACTICE_LICENSE_TYPES = new Set(['Active', 'Government', 'Judge'])

// Pro Hac Vice is excluded from all bar-admissions aggregations before this runs.
const LIMITED_ELIGIBILITY_LICENSE_TYPES = new Set([
  'Foreign Law Consultant',
  'Inactive - Pro Bono',
  'LLPE',
  'Retired Judge Per Diem',
  'RLSA',
  'RMSA'
])

const normalizeBarAdmissionsLicenseType = (licenseType: string): string => {
  if (
    licenseType === 'Inactive - Pro Bono' ||
    licenseType === 'Inactive - Voluntary' ||
    licenseType === 'Inactive - Emeritus' ||
    licenseType === 'Inactive - Medical'
  )
    return 'Inactive'
  if (
    licenseType === 'Suspended - CLE' ||
    licenseType === 'Suspended - Disciplined' ||
    licenseType === 'Suspended - Non-Payment'
  )
    return 'Suspended'
  if (
    licenseType === 'Resigned - Discipline' ||
    licenseType === 'Resigned - Voluntary' ||
    licenseType === 'Restrained from Practice' ||
    licenseType === 'Disbarred'
  )
    return 'Resigned / Restrained / Disbarred'

  return licenseType
}

const getBarAdmissionYear = (barAdmissionDate: string): number | null => {
  if (!barAdmissionDate) return null

  const year = new Date(barAdmissionDate).getFullYear()

  return Number.isNaN(year) ? null : year
}

const normalizeSlideshowBarAdmissionsLicenseType = (licenseType: string): string => {
  if (ELIGIBLE_TO_PRACTICE_LICENSE_TYPES.has(licenseType)) return ELIGIBLE_TO_PRACTICE
  if (LIMITED_ELIGIBILITY_LICENSE_TYPES.has(licenseType)) return LIMITED_ELIGIBILITY_TO_PRACTICE

  return NOT_ELIGIBLE_TO_PRACTICE
}

export const calculateBarAdmissions = (rows: Row[], viewType: ViewType): DatasetType => {
  const topLawSchools = getTopLawSchools(rows)

  const barAdmissions = rows.reduce((result, row) => {
    // Exclude Pro Hac Vice from all Bar Admissions charts.
    if (EXCLUDED_BAR_ADMISSIONS_LICENSE_TYPES.has(row.licenseType)) return result

    const yearValue = getBarAdmissionYear(row.barAdmissionDate)

    if (yearValue !== null) {
      const year = yearValue.toString()

      if (!result[year]) {
        result[year] = { count: 0 }
      }

      result[year].count += 1

      switch (viewType) {
        case ViewType.BY_LAW_SCHOOL: {
          const trimmedLawSchool = row.lawSchool?.trim()
          const lawSchool = trimmedLawSchool && topLawSchools.includes(trimmedLawSchool) ? trimmedLawSchool : 'Other'

          result[year][lawSchool] = (result[year][lawSchool] || 0) + 1

          break
        }

        case ViewType.BY_LICENSE_TYPE: {
          const licenseType = normalizeBarAdmissionsLicenseType(row.licenseType)

          result[year][licenseType] = (result[year][licenseType] || 0) + 1
        }
      }
    }

    return result
  }, {} as Record<string, Record<string, number>>)

  const licenseTypesInDataset =
    viewType === ViewType.BY_LICENSE_TYPE
      ? (() => {
          const presentTypes = new Set<string>()

          Object.values(barAdmissions).forEach(types => {
            Object.keys(types).forEach(key => {
              if (key !== 'count') presentTypes.add(key)
            })
          })

          const orderedKnownTypes = LICENSE_TYPE_ORDER.filter(type => presentTypes.has(type))
          const orderedUnknownTypes = [...presentTypes]
            .filter(type => !LICENSE_TYPE_ORDER.includes(type))
            .sort((a, b) => a.localeCompare(b))

          return [...orderedKnownTypes, ...orderedUnknownTypes]
        })()
      : []

  return Object.entries(barAdmissions)
    .map(([year, types]) => {
      switch (viewType) {
        case ViewType.TOTAL: {
          return { count: types.count, year }
        }

        case ViewType.BY_LICENSE_TYPE: {
          return {
            count: types.count,
            year,
            ...licenseTypesInDataset.reduce((result, type) => ({ ...result, [type]: types[type] || 0 }), {})
          }
        }

        case ViewType.BY_LAW_SCHOOL: {
          const schools = [...topLawSchools, 'Other']

          return {
            count: types.count,
            year,
            ...schools.reduce((result, school) => ({ ...result, [school]: types[school] || 0 }), {})
          }
        }

        default:
          throw new Error(`Unhandled view type: ${viewType}`)
      }
    })
    .sort((a, b) => a.year.localeCompare(b.year))
}

export const calculateSlideshowBarAdmissions = (rows: Row[], viewType: ViewType): DatasetType => {
  const barAdmissions = rows.reduce((result, row) => {
    if (EXCLUDED_BAR_ADMISSIONS_LICENSE_TYPES.has(row.licenseType)) return result

    const yearValue = getBarAdmissionYear(row.barAdmissionDate)

    if (yearValue === null || yearValue < SLIDESHOW_BAR_ADMISSIONS_START_YEAR) return result

    const year = yearValue.toString()

    if (!result[year]) {
      result[year] = { count: 0 }
    }

    result[year].count += 1

    switch (viewType) {
      case ViewType.BY_LAW_SCHOOL: {
        const lawSchool = row.lawSchool?.trim() === 'William S. Richardson' ? 'William S. Richardson' : 'Other'

        result[year][lawSchool] = (result[year][lawSchool] || 0) + 1

        break
      }

      case ViewType.BY_LICENSE_TYPE: {
        const licenseType = normalizeSlideshowBarAdmissionsLicenseType(row.licenseType)

        result[year][licenseType] = (result[year][licenseType] || 0) + 1

        break
      }
    }

    return result
  }, {} as Record<string, Record<string, number>>)

  return Object.entries(barAdmissions)
    .map(([year, groups]) => {
      switch (viewType) {
        case ViewType.TOTAL: {
          return { count: groups.count, year }
        }

        case ViewType.BY_LICENSE_TYPE: {
          return {
            count: groups.count,
            year,
            ...SLIDESHOW_LICENSE_TYPE_ORDER.reduce(
              (result, licenseType) => ({ ...result, [licenseType]: groups[licenseType] || 0 }),
              {}
            )
          }
        }

        case ViewType.BY_LAW_SCHOOL: {
          return {
            count: groups.count,
            year,
            ...SLIDESHOW_LAW_SCHOOL_ORDER.reduce(
              (result, lawSchool) => ({ ...result, [lawSchool]: groups[lawSchool] || 0 }),
              {}
            )
          }
        }

        default:
          throw new Error(`Unhandled view type: ${viewType}`)
      }
    })
    .sort((a, b) => a.year.localeCompare(b.year))
}
