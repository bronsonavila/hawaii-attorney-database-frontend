import { Row } from '../../App'
import { TopGovernmentEmployersViewType } from '../../types/chartTypes'
import { getTopLawSchools, stripEmployerSuffixes } from './'

// Constants

const COUNTY_EMPLOYER_MAPPING = {
  'Corporation Counsel': 'Dept. of the Corporation Counsel',
  'Council Services': 'Off. of Council Services',
  'County Attorney': 'Off. of the County Attorney',
  'Prosecuting Attorney': 'Dept. of the Prosecuting Attorney'
} as const

const FEDERAL_EMPLOYER_KEYWORDS = [
  'Air Force',
  'Army',
  'Defense',
  'Federal',
  'Homeland',
  'National',
  'Navy',
  'Social Security',
  'U.S.',
  'US'
]

// Functions

export const calculateTopGovernmentEmployers = (rows: Row[], viewType: TopGovernmentEmployersViewType): any[] => {
  switch (viewType) {
    case TopGovernmentEmployersViewType.TOTAL: {
      const employers = rows
        .filter(row => row.licenseType === 'Government' && row.employer && !isFederalEmployer(row.employer))
        .reduce((result, row) => {
          const employerName = stripEmployerSuffixes(row.employer)
          const normalizedName = normalizeEmployerName(employerName, row.location, row.emailDomain)

          result[normalizedName] = (result[normalizedName] || 0) + 1

          return result
        }, {} as Record<string, number>)

      return Object.entries(employers)
        .map(([employer, count]) => ({ id: employer, value: count, label: employer }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 25)
    }

    case TopGovernmentEmployersViewType.BY_ADMISSION_DATE: {
      const employers = rows
        .filter(row => row.licenseType === 'Government' && row.employer && !isFederalEmployer(row.employer))
        .reduce((result, row) => {
          const employerName = stripEmployerSuffixes(row.employer)
          const normalizedName = normalizeEmployerName(employerName, row.location, row.emailDomain)
          const admissionDate = row.barAdmissionDate ? new Date(row.barAdmissionDate) : null

          if (admissionDate) {
            const decade = Math.floor(admissionDate.getFullYear() / 10) * 10
            const decadeLabel = `${decade}s`

            if (!result[normalizedName]) {
              result[normalizedName] = { count: 0 }
            }

            result[normalizedName].count += 1
            result[normalizedName][decadeLabel] = (result[normalizedName][decadeLabel] || 0) + 1
          }

          return result
        }, {} as Record<string, Record<string, number>>)

      return Object.entries(employers)
        .map(([employer, data]) => ({
          count: data.count,
          label: employer,
          ...Object.keys(data)
            .filter(key => key !== 'count')
            .reduce((result, decade) => ({ ...result, [decade]: data[decade] }), {})
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 25)
    }

    case TopGovernmentEmployersViewType.BY_LAW_SCHOOL: {
      const topLawSchools = getTopLawSchools(rows)
      const employers = rows
        .filter(row => row.licenseType === 'Government' && row.employer && !isFederalEmployer(row.employer))
        .reduce((result, row) => {
          const employerName = stripEmployerSuffixes(row.employer)
          const normalizedName = normalizeEmployerName(employerName, row.location, row.emailDomain)

          if (!result[normalizedName]) {
            result[normalizedName] = { count: 0 }
          }

          result[normalizedName].count += 1

          let lawSchool = row.lawSchool?.trim() || 'Unknown'
          if (!topLawSchools.includes(lawSchool) && lawSchool !== 'Unknown') {
            lawSchool = 'Other'
          }

          result[normalizedName][lawSchool] = (result[normalizedName][lawSchool] || 0) + 1

          return result
        }, {} as Record<string, Record<string, number>>)

      return Object.entries(employers)
        .map(([employer, data]) => ({
          count: data.count,
          label: employer,
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
  }
}

const getCountyFromLocation = (location: string): string => {
  const parts = location?.split('|').map(part => part.trim())
  const county = parts?.[2] || 'Unknown County'

  return county
}

const getStateFromLocation = (location: string): string | null =>
  location?.split('|').map(part => part.trim())?.[1] || null

const isFederalEmployer = (employerName: string): boolean =>
  FEDERAL_EMPLOYER_KEYWORDS.some(keyword => employerName.toLowerCase().includes(keyword.toLowerCase()))

const normalizeEmployerName = (employerName: string, location: string, emailDomain?: string): string => {
  if (employerName.includes('DCCA') || emailDomain === 'dcca.hawaii.gov') return 'DCCA'

  if (
    employerName.toLowerCase().includes('public defender') &&
    !employerName.toLowerCase().includes('federal') &&
    getStateFromLocation(location) === 'Hawaii'
  ) {
    return 'Off. of the Public Defender'
  }

  if (employerName.toLowerCase().includes('public utilities comm')) return 'Public Utilities Comm.'

  for (const [keyPhrase, normalizedName] of Object.entries(COUNTY_EMPLOYER_MAPPING)) {
    if (employerName.toLowerCase().includes(keyPhrase.toLowerCase())) {
      const county = getCountyFromLocation(location)

      return `${normalizedName} (${county})`
    }
  }

  return employerName
}
