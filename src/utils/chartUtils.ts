import { BarAdmissionsViewType, LicenseDistributionViewType, TopEmployersViewType } from '../types/chartTypes'
import { LICENSE_TYPE_ORDER } from '../constants/chartConstants'
import { Row } from '../App'

export const calculateBarAdmissions = (
  rows: Row[],
  viewType: BarAdmissionsViewType
): { count: number; year: string; [key: string]: number | string | undefined }[] => {
  const topLawSchools = getTopLawSchools(rows)

  const barAdmissions = rows.reduce((result, row) => {
    if (row.barAdmissionDate && row.licenseType !== 'Pro Hac Vice') {
      const year = new Date(row.barAdmissionDate).getFullYear().toString()

      if (!result[year]) {
        result[year] = { count: 0 }
      }

      result[year].count += 1

      switch (viewType) {
        case BarAdmissionsViewType.BY_LAW_SCHOOL: {
          let lawSchool = row.lawSchool?.trim() || 'Unknown'

          if (!topLawSchools.includes(lawSchool) && lawSchool !== 'Unknown') {
            lawSchool = 'Other'
          }

          result[year][lawSchool] = (result[year][lawSchool] || 0) + 1

          break
        }

        case BarAdmissionsViewType.BY_LICENSE_TYPE: {
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
        case BarAdmissionsViewType.TOTAL: {
          return { count: types.count, year }
        }

        case BarAdmissionsViewType.BY_LICENSE_TYPE: {
          return {
            count: types.count,
            year,
            ...LICENSE_TYPE_ORDER.reduce((result, type) => ({ ...result, [type]: types[type] || 0 }), {})
          }
        }

        case BarAdmissionsViewType.BY_LAW_SCHOOL: {
          const schools = [...topLawSchools, 'Other', 'Unknown']

          return {
            count: types.count,
            year,
            ...schools.reduce((result, school) => ({ ...result, [school]: types[school] || 0 }), {})
          }
        }
      }
    })
    .sort((a, b) => a.year.localeCompare(b.year))
}

export const calculateLicenseDistribution = (rows: Row[], viewType: LicenseDistributionViewType): any[] => {
  const topLawSchools = getTopLawSchools(rows)

  const distribution = rows.reduce((result, row) => {
    if (!result[row.licenseType]) {
      result[row.licenseType] = { count: 0 }
    }

    result[row.licenseType].count += 1

    switch (viewType) {
      case LicenseDistributionViewType.TOTAL: {
        return result
      }

      case LicenseDistributionViewType.BY_ADMISSION_DATE: {
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

      case LicenseDistributionViewType.BY_LAW_SCHOOL: {
        let lawSchool = row.lawSchool?.trim() || 'Unknown'

        if (!topLawSchools.includes(lawSchool) && lawSchool !== 'Unknown') {
          lawSchool = 'Other'
        }

        result[row.licenseType][lawSchool] = (result[row.licenseType][lawSchool] || 0) + 1

        return result
      }
    }
  }, {} as Record<string, Record<string, number>>)

  switch (viewType) {
    case LicenseDistributionViewType.TOTAL: {
      return Object.entries(distribution)
        .map(([licenseType, { count }]) => ({ licenseType, value: count }))
        .sort((a, b) => b.value - a.value)
    }

    case LicenseDistributionViewType.BY_LAW_SCHOOL: {
      const schools = [...topLawSchools, 'Other', 'Unknown']

      return Object.entries(distribution)
        .map(([licenseType, data]) => ({
          licenseType,
          count: data.count,
          ...schools.reduce((result, school) => ({ ...result, [school]: data[school] || 0 }), {})
        }))
        .sort((a, b) => b.count - a.count)
    }

    case LicenseDistributionViewType.BY_ADMISSION_DATE: {
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
  }
}

export const calculateTopEmployers = (rows: Row[], viewType: TopEmployersViewType): any[] => {
  switch (viewType) {
    case TopEmployersViewType.TOTAL: {
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

    case TopEmployersViewType.BY_ADMISSION_DATE: {
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

    case TopEmployersViewType.BY_LAW_SCHOOL: {
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
  }
}

export const getTopLawSchools = (rows: Row[], topN: number = 10): string[] => {
  const lawSchoolCount = rows.reduce((result, row) => {
    const lawSchool = row.lawSchool?.trim()

    if (lawSchool && lawSchool !== 'Unknown') {
      result[lawSchool] = (result[lawSchool] || 0) + 1
    }

    return result
  }, {} as Record<string, number>)

  return Object.entries(lawSchoolCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([school]) => school)
}

export const getUniqueLicenseTypes = (rows: Row[]): string[] =>
  [...new Set(rows.map(record => record.licenseType))]
    .filter((type): type is string => type !== undefined && type !== '')
    .sort()

export const isEmployedAsAttorneyAtLaw = (employer: string | undefined): boolean =>
  employer ? employer.toLowerCase().replace(/\s+/g, ' ').includes('attorney at law') : false

export const processEmployerName = (name: string): string => {
  // Strip common employer suffixes.
  const employerSuffixes = ['A Law Corporation', 'A Law Corp.', 'A Law Corp', 'AAL', 'ALC', 'LLLC', 'LLLP', 'LLP']
  const suffixPattern = new RegExp(`\\s*(${employerSuffixes.join('|')})\\s*`, 'gi')

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
