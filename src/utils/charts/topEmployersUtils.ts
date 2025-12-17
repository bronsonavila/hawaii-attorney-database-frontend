import { DatasetType } from '@mui/x-charts/internals'
import { getTopLawSchools } from '@/utils/charts/commonUtils'
import { Row } from '@/types/row'
import { ViewType } from '@/types/chart'

// Constants

const EMPLOYER_NAME_PATTERNS: Record<string, string[]> = {
  'Cades Schutte': ['cades', 'schutte'],
  'Goodsill Anderson Quinn & Stifel': ['goodsill', 'anderson', 'quinn', 'stifel'],
  'Carlsmith Ball': ['carlsmith', 'ball'],
  'Kobayashi Sugita & Goda': ['kobayashi', 'sugita', 'goda'],
  'McCorriston Miller Mukai MacKinnon': ['mccorriston', 'miller', 'mukai', 'mackinnon'],
  'Hawaiian Electric': ['hawaii', 'electric'],
  'Legal Aid Society of Hawaii': ['legal', 'aid', 'society', 'hawaii'],
  'Damon Key Leong Kupchak Hastert': ['damon', 'key', 'leong', 'kupchak', 'hastert'],
  'Dentons US': ['dentons', 'us'],
  "Starn O'Toole Marcus & Fisher": ['starn', "o'toole", 'marcus', 'fisher'],
  'Lung Rose Voss & Wagnild': ['lung', 'rose', 'voss', 'wagnild'],
  'Watanabe Ing': ['watanabe', 'ing'],
  'Ashford & Wriston': ['ashford', 'wriston'],
  'Case Lombardi': ['case', 'lombardi'],
  'Chun Kerr': ['chun', 'kerr'],
  'Torkildson Katz': ['torkildson', 'katz'],
  'Kamehameha Schools': ['kamehameha', 'schools'],
  'First Hawaiian Bank': ['first', 'hawaiian', 'bank'],
  'Rush Moore': ['rush', 'moore'],
  'Clay Iwamura Pulice & Nervell': ['clay', 'iwamura', 'pulice', 'nervell'],
  'Bronster Fujichaku Robbins': ['bronster', 'fujichaku', 'robbins'],
  'Schlack Ito': ['schlack', 'ito'],
  'Gordon Rees Scully Mansukhani': ['gordon', 'rees', 'scully', 'mansukhani'],
  'Chong Nishimoto Sia Nakamura & Goya': ['chong', 'nishimoto', 'sia', 'nakamura', 'goya'],
  'Imanaka Asato': ['imanaka', 'asato'],
  'Porter Kiakona Kopper': ['porter', 'kiakona', 'kopper'],
  'Deeley King Pang & Van Etten': ['deeley', 'king', 'pang', 'van', 'etten'],
  'Marr Jones & Wang': ['marr', 'jones', 'wang'],
  'Roeca Luria Shin': ['roeca', 'luria', 'shin'],
  'Bank of Hawaii': ['bank', 'of', 'hawaii']
}

// Functions

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

          const trimmedLawSchool = row.lawSchool?.trim()
          const lawSchool = trimmedLawSchool && topLawSchools.includes(trimmedLawSchool) ? trimmedLawSchool : 'Other'

          result[employerName][lawSchool] = (result[employerName][lawSchool] || 0) + 1

          return result
        }, {} as Record<string, Record<string, number>>)

      return Object.entries(firms)
        .map(([firm, data]) => ({
          count: data.count,
          label: firm,
          ...topLawSchools.reduce((result, school) => ({ ...result, [school]: data[school] || 0 }), {}),
          Other: data['Other'] || 0
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
  const normalizedName = name.toLowerCase().replace(/[.,&]/g, ' ').replace(/\s+/g, ' ').trim()

  for (const [standardName, patterns] of Object.entries(EMPLOYER_NAME_PATTERNS)) {
    if (patterns.every(pattern => normalizedName.includes(pattern))) return standardName
  }

  return name.trim()
}
