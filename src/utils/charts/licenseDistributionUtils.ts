import { DatasetType } from '@mui/x-charts/internals'
import { getTopLawSchools } from '@/utils/charts/commonUtils'
import { Row } from '@/types/row'
import { ViewType } from '@/enums/chartEnums'

export const calculateLicenseDistribution = (rows: Row[], viewType: ViewType): DatasetType => {
  const topLawSchools = getTopLawSchools(rows)

  const distribution = rows.reduce((result, row) => {
    if (!result[row.licenseType]) {
      result[row.licenseType] = { count: 0 }
    }

    result[row.licenseType].count += 1

    switch (viewType) {
      case ViewType.TOTAL:
        return result

      case ViewType.BY_ADMISSION_DATE: {
        if (row.licenseType === 'Pro Hac Vice') {
          result[row.licenseType]['No Admission Date'] = (result[row.licenseType]['No Admission Date'] || 0) + 1
        } else if (row.barAdmissionDate) {
          const admissionDate = new Date(row.barAdmissionDate)
          const decade = Math.floor(admissionDate.getFullYear() / 10) * 10
          const decadeLabel = `${decade}s`

          result[row.licenseType][decadeLabel] = (result[row.licenseType][decadeLabel] || 0) + 1
        } else {
          result[row.licenseType]['Unknown'] = (result[row.licenseType]['Unknown'] || 0) + 1
        }

        return result
      }

      case ViewType.BY_LAW_SCHOOL: {
        const trimmedLawSchool = row.lawSchool?.trim()
        const lawSchool = trimmedLawSchool && topLawSchools.includes(trimmedLawSchool) ? trimmedLawSchool : 'Other'

        result[row.licenseType][lawSchool] = (result[row.licenseType][lawSchool] || 0) + 1

        return result
      }

      default:
        throw new Error(`Unhandled view type: ${viewType}`)
    }
  }, {} as Record<string, Record<string, number>>)

  switch (viewType) {
    case ViewType.TOTAL: {
      return Object.entries(distribution)
        .map(([licenseType, { count }]) => ({ licenseType, value: count }))
        .sort((a, b) => b.value - a.value)
    }

    case ViewType.BY_LAW_SCHOOL: {
      const schools = [...topLawSchools, 'Other']

      return Object.entries(distribution)
        .map(([licenseType, data]) => ({
          licenseType,
          count: data.count,
          ...schools.reduce((result, school) => ({ ...result, [school]: data[school] || 0 }), {})
        }))
        .sort((a, b) => b.count - a.count)
    }

    case ViewType.BY_ADMISSION_DATE: {
      const categories = new Set<string>()

      Object.values(distribution).forEach(data => {
        Object.keys(data).forEach(key => {
          if (key !== 'count') categories.add(key)
        })
      })

      const sortedCategories = Array.from(categories).sort((a, b) => {
        if (a === 'Unknown' || a === 'No Admission Date') return -1
        if (b === 'Unknown' || b === 'No Admission Date') return 1

        return a.localeCompare(b)
      })

      return Object.entries(distribution)
        .map(([licenseType, data]) => ({
          count: data.count,
          licenseType,
          ...sortedCategories.reduce((result, category) => ({ ...result, [category]: data[category] || 0 }), {})
        }))
        .sort((a, b) => b.count - a.count)
    }

    default:
      throw new Error(`Unhandled view type: ${viewType}`)
  }
}
