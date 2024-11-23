import { DatasetType } from '@mui/x-charts/internals'
import { getTopLawSchools } from './commonUtils'
import { Row } from '../../App'
import { ViewType } from '../../types/chartTypes'

export const calculateTopEmployers = (rows: Row[], viewType: ViewType): DatasetType => {
  switch (viewType) {
    case ViewType.TOTAL: {
      const firms = rows
        .filter(row => row.licenseType === 'Active' && row.employer && !isEmployedAsAttorneyAtLaw(row.employer))
        .reduce((result, row) => {
          const employerName = processEmployerName(row.employer)

          result[employerName] = (result[employerName] || 0) + 1

          return result
        }, {} as Record<string, number>)

      return Object.entries(firms)
        .map(([firm, count]) => ({ id: firm, value: count, label: firm }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 25)
    }

    case ViewType.BY_ADMISSION_DATE: {
      const firms = rows
        .filter(row => row.licenseType === 'Active' && row.employer && !isEmployedAsAttorneyAtLaw(row.employer))
        .reduce((result, row) => {
          const employerName = processEmployerName(row.employer)
          const admissionDate = row.barAdmissionDate ? new Date(row.barAdmissionDate) : null

          if (admissionDate) {
            const decade = Math.floor(admissionDate.getFullYear() / 10) * 10
            const decadeLabel = `${decade}s`

            if (!result[employerName]) {
              result[employerName] = { count: 0 }
            }

            result[employerName].count += 1
            result[employerName][decadeLabel] = (result[employerName][decadeLabel] || 0) + 1
          }

          return result
        }, {} as Record<string, Record<string, number>>)

      return Object.entries(firms)
        .map(([firm, data]) => ({
          count: data.count,
          label: firm,
          ...Object.keys(data)
            .filter(key => key !== 'count')
            .reduce((result, decade) => ({ ...result, [decade]: data[decade] }), {})
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 25)
    }

    case ViewType.BY_LAW_SCHOOL: {
      const topLawSchools = getTopLawSchools(rows)
      const firms = rows
        .filter(row => row.licenseType === 'Active' && row.employer && !isEmployedAsAttorneyAtLaw(row.employer))
        .reduce((result, row) => {
          const employerName = processEmployerName(row.employer)

          if (!result[employerName]) {
            result[employerName] = { count: 0 }
          }

          result[employerName].count += 1

          let lawSchool = row.lawSchool?.trim() || 'Unknown'

          if (!topLawSchools.includes(lawSchool) && lawSchool !== 'Unknown') {
            lawSchool = 'Other'
          }

          result[employerName][lawSchool] = (result[employerName][lawSchool] || 0) + 1

          return result
        }, {} as Record<string, Record<string, number>>)

      return Object.entries(firms)
        .map(([firm, data]) => ({
          count: data.count,
          label: firm,
          ...topLawSchools.reduce((result, school) => ({ ...result, [school]: data[school] || 0 }), {}),
          Other:
            Object.entries(data)
              .filter(([key]) => key !== 'count' && !topLawSchools.includes(key) && key !== 'Unknown')
              .reduce((sum, [, value]) => sum + value, 0) || 0,
          Unknown: data['Unknown'] || 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 25)
    }

    default:
      throw new Error(`Unhandled view type: ${viewType}`)
  }
}

export const isEmployedAsAttorneyAtLaw = (employer: string | undefined): boolean =>
  employer ? employer.toLowerCase().replace(/\s+/g, ' ').includes('attorney at law') : false

export const processEmployerName = (name: string): string => {
  const employerSuffixes = ['A Law Corporation', 'A Law Corp.', 'A Law Corp', 'AAL', 'ALC', 'LLLC', 'LLLP', 'LLP']
  const suffixPattern = new RegExp(`\\s*(${employerSuffixes.join('|')})\\s*`, 'gi')

  // Strip common employer suffixes.
  name = name
    .replace(suffixPattern, ' ')
    .trim()
    .replace(/(?<!Inc|Assoc)[.,\s]+$/, '')

  const employerNameMappings: Record<string, string> = {
    'Hawaii Medical Service Association': 'Hawaii Medical Service Assoc.',
    'Porter Kiakona & Kopper': 'Porter Kiakona Kopper'
  }

  // Normalize specific employer names.
  for (const [original, normalized] of Object.entries(employerNameMappings)) {
    if (name.includes(original)) {
      name = name.replace(original, normalized)
    }
  }

  return name
}
