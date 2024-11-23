import { DatasetType } from '@mui/x-charts/internals'
import { getTopLawSchools } from './commonUtils'
import { LICENSE_TYPE_ORDER } from '../../constants/chartConstants'
import { Row } from '../../App'
import { ViewType } from '../../types/chartTypes'

export const calculateBarAdmissions = (rows: Row[], viewType: ViewType): DatasetType => {
  const topLawSchools = getTopLawSchools(rows)

  const barAdmissions = rows.reduce((result, row) => {
    if (row.barAdmissionDate && row.licenseType !== 'Pro Hac Vice') {
      const year = new Date(row.barAdmissionDate).getFullYear().toString()

      if (!result[year]) {
        result[year] = { count: 0 }
      }

      result[year].count += 1

      switch (viewType) {
        case ViewType.BY_LAW_SCHOOL: {
          let lawSchool = row.lawSchool?.trim() || 'Unknown'

          if (!topLawSchools.includes(lawSchool) && lawSchool !== 'Unknown') {
            lawSchool = 'Other'
          }

          result[year][lawSchool] = (result[year][lawSchool] || 0) + 1

          break
        }

        case ViewType.BY_LICENSE_TYPE: {
          let licenseType = row.licenseType

          // Consolidate the variations of Inactive, Resign, and Suspended license types into a single category.
          if (licenseType.startsWith('Inactive')) licenseType = 'Inactive'
          if (licenseType.startsWith('Resign')) licenseType = 'Resign'
          if (licenseType.startsWith('Suspended')) licenseType = 'Suspended'

          result[year][licenseType] = (result[year][licenseType] || 0) + 1
        }
      }
    }

    return result
  }, {} as Record<string, Record<string, number>>)

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
            ...LICENSE_TYPE_ORDER.reduce((result, type) => ({ ...result, [type]: types[type] || 0 }), {})
          }
        }

        case ViewType.BY_LAW_SCHOOL: {
          const schools = [...topLawSchools, 'Other', 'Unknown']

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
