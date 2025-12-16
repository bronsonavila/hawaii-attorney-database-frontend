import { DatasetType } from '@mui/x-charts/internals'
import { getTopLawSchools } from './commonUtils'
import { LICENSE_TYPE_ORDER } from '../../constants/chartConstants'
import { Row } from '../../types/row'
import { ViewType } from '../../enums/chartEnums'

const normalizeBarAdmissionsLicenseType = (licenseType: string): string => {
  if (licenseType === 'Inactive Pro Bono' || licenseType === 'Inactive Voluntary') return 'Inactive'
  if (licenseType === 'Suspended - Disciplined' || licenseType === 'Suspended - Non-Payment') return 'Suspended'

  return licenseType
}

export const calculateBarAdmissions = (rows: Row[], viewType: ViewType): DatasetType => {
  const topLawSchools = getTopLawSchools(rows)

  const barAdmissions = rows.reduce((result, row) => {
    // Exclude Pro Hac Vice from all Bar Admissions charts.
    if (row.licenseType === 'Pro Hac Vice') return result

    if (row.barAdmissionDate) {
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
