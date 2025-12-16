import { Row } from '../../types/row'

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
