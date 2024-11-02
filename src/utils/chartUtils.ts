import {
  BarAdmissionsViewType,
  LicenseDistributionViewType,
  TopEmployersViewType
} from '../components/charts/ChartModal'
import { LICENSE_TYPE_ORDER } from '../constants/chartConstants'
import { Row } from '../App'

export const calculateBarAdmissionsOverTime = (
  rows: Row[],
  viewType: BarAdmissionsViewType
): { total: number; year: string; [key: string]: number | string | undefined }[] => {
  const topLawSchools = getTopLawSchools(rows)

  const barAdmissionsOverTime = rows.reduce((result, row) => {
    if (row.barAdmissionDate && row.licenseType !== 'Pro Hac Vice') {
      const year = new Date(row.barAdmissionDate).getFullYear().toString()

      if (!result[year]) {
        result[year] = { total: 0 }
      }

      result[year]['total'] += 1

      if (viewType === 'byLawSchool') {
        let lawSchool = row.lawSchool?.trim() || 'Unknown'

        if (!topLawSchools.includes(lawSchool) && lawSchool !== 'Unknown') {
          lawSchool = 'Other'
        }

        result[year][lawSchool] = (result[year][lawSchool] || 0) + 1
      } else if (viewType === 'byLicenseType') {
        let licenseType = row.licenseType

        // Consolidate the variations of Inactive, Resign, and Suspended license types into a single category.
        if (licenseType.startsWith('Inactive')) licenseType = 'Inactive'
        if (licenseType.startsWith('Resign')) licenseType = 'Resign'
        if (licenseType.startsWith('Suspended')) licenseType = 'Suspended'

        result[year][licenseType] = (result[year][licenseType] || 0) + 1
      }
    }

    return result
  }, {} as Record<string, Record<string, number>>)

  return Object.entries(barAdmissionsOverTime)
    .map(([year, types]) => {
      if (viewType === 'byLawSchool') {
        const schools = [...topLawSchools, 'Other', 'Unknown']

        return {
          total: types['total'],
          year,
          ...schools.reduce((result, school) => ({ ...result, [school]: types[school] || 0 }), {})
        }
      } else if (viewType === 'byLicenseType') {
        return {
          total: types['total'],
          year,
          ...LICENSE_TYPE_ORDER.reduce((result, type) => ({ ...result, [type]: types[type] || 0 }), {})
        }
      } else {
        return { total: types['total'], year }
      }
    })
    .sort((a, b) => a.year.localeCompare(b.year))
}

export const calculateLicenseDistribution = (rows: Row[], viewType: LicenseDistributionViewType): any[] => {
  const topLawSchools = getTopLawSchools(rows)

  const distribution = rows.reduce((result, row) => {
    if (!result[row.licenseType]) {
      result[row.licenseType] = { total: 0 }
    }

    result[row.licenseType].total += 1

    if (viewType === 'byLawSchool') {
      let lawSchool = row.lawSchool?.trim() || 'Unknown'

      if (!topLawSchools.includes(lawSchool) && lawSchool !== 'Unknown') {
        lawSchool = 'Other'
      }

      result[row.licenseType][lawSchool] = (result[row.licenseType][lawSchool] || 0) + 1
    } else if (viewType === 'byAdmissionDate') {
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
    }

    return result
  }, {} as Record<string, Record<string, number>>)

  if (viewType === 'total') {
    return Object.entries(distribution)
      .map(([licenseType, { total }]) => ({ licenseType, value: total }))
      .sort((a, b) => b.value - a.value)
  } else if (viewType === 'byLawSchool') {
    const schools = [...topLawSchools, 'Other', 'Unknown']

    return Object.entries(distribution)
      .map(([licenseType, data]) => ({
        licenseType,
        total: data.total,
        ...schools.reduce((result, school) => ({ ...result, [school]: data[school] || 0 }), {})
      }))
      .sort((a, b) => b.total - a.total)
  } else {
    const categories = new Set<string>()

    Object.values(distribution).forEach(data => {
      Object.keys(data).forEach(key => {
        if (key !== 'total') categories.add(key)
      })
    })

    const sortedCategories = Array.from(categories).sort((a, b) => {
      if (a === 'Unknown' || a === 'No Admission Date') return -1
      if (b === 'Unknown' || b === 'No Admission Date') return 1

      return a.localeCompare(b)
    })

    return Object.entries(distribution)
      .map(([licenseType, data]) => ({
        licenseType,
        total: data.total,
        ...sortedCategories.reduce((result, category) => ({ ...result, [category]: data[category] || 0 }), {})
      }))
      .sort((a, b) => b.total - a.total)
  }
}

export const calculateTopEmployers = (rows: Row[], viewType: TopEmployersViewType): any[] => {
  const suffixes = ['A Law Corporation', 'A Law Corp.', 'A Law Corp', 'AAL', 'ALC', 'LLLC', 'LLLP', 'LLP', '& Pettit']

  const stripSuffixes = (name: string) => {
    suffixes.forEach(suffix => {
      const suffixRegex = new RegExp(`\\s*${suffix}\\s*`, 'gi')

      name = name.replace(suffixRegex, ' ')
    })

    name = name.trim().replace(/(?<!Inc)[.,\s]+$/, '')

    return name
  }

  if (viewType === 'total') {
    const firms = rows
      .filter(
        row => row.licenseType === 'Active' && row.employer && !row.employer.toLowerCase().includes('attorney at law')
      )
      .reduce((result, row) => {
        const employerName = stripSuffixes(row.employer)

        result[employerName] = (result[employerName] || 0) + 1

        return result
      }, {} as Record<string, number>)

    return Object.entries(firms)
      .map(([firm, count]) => ({ id: firm, value: count, label: firm }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 25)
  } else if (viewType === 'byLawSchool') {
    const topLawSchools = getTopLawSchools(rows)
    const firms = rows
      .filter(
        row => row.licenseType === 'Active' && row.employer && !row.employer.toLowerCase().includes('attorney at law')
      )
      .reduce((result, row) => {
        const employerName = stripSuffixes(row.employer)

        if (!result[employerName]) {
          result[employerName] = { total: 0 }
        }

        result[employerName].total += 1

        let lawSchool = row.lawSchool?.trim() || 'Unknown'

        if (!topLawSchools.includes(lawSchool) && lawSchool !== 'Unknown') {
          lawSchool = 'Other'
        }

        result[employerName][lawSchool] = (result[employerName][lawSchool] || 0) + 1

        return result
      }, {} as Record<string, Record<string, number>>)

    return Object.entries(firms)
      .map(([firm, data]) => ({
        label: firm,
        total: data.total,
        ...topLawSchools.reduce((result, school) => ({ ...result, [school]: data[school] || 0 }), {}),
        Unknown: data['Unknown'] || 0,
        Other:
          Object.entries(data)
            .filter(([key]) => key !== 'total' && !topLawSchools.includes(key) && key !== 'Unknown')
            .reduce((sum, [, value]) => sum + value, 0) || 0
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 25)
  } else if (viewType === 'byAdmissionDate') {
    const firms = rows
      .filter(
        row => row.licenseType === 'Active' && row.employer && !row.employer.toLowerCase().includes('attorney at law')
      )
      .reduce((result, row) => {
        const employerName = stripSuffixes(row.employer)
        const admissionDate = row.barAdmissionDate ? new Date(row.barAdmissionDate) : null

        if (admissionDate) {
          const decade = Math.floor(admissionDate.getFullYear() / 10) * 10
          const decadeLabel = `${decade}s`

          if (!result[employerName]) {
            result[employerName] = { total: 0 }
          }

          result[employerName].total += 1
          result[employerName][decadeLabel] = (result[employerName][decadeLabel] || 0) + 1
        }

        return result
      }, {} as Record<string, Record<string, number>>)

    return Object.entries(firms)
      .map(([firm, data]) => ({
        label: firm,
        total: data.total,
        ...Object.keys(data)
          .filter(key => key !== 'total')
          .reduce((result, decade) => ({ ...result, [decade]: data[decade] }), {})
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 25)
  }

  return []
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
