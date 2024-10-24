import { BarChart } from '@mui/x-charts'
import { FC } from 'react'
import { getTopLawSchools } from '../../utils/chartUtils'
import { LAW_SCHOOL_COLOR_PALETTE } from '../../constants/chartConstants'
import { Row } from '../../App'
import { TEAL_NAVY, ROSE_VIOLET } from '../../constants/colors'

interface LicenseDistributionChartProps {
  data: any[]
  rows: Row[]
  viewType: 'total' | 'byLawSchool' | 'byAdmissionDate'
}

export const LicenseDistributionChart: FC<LicenseDistributionChartProps> = ({ data, rows, viewType }) => {
  if (viewType === 'total') {
    return (
      <BarChart
        dataset={data}
        grid={{ vertical: true }}
        layout="horizontal"
        margin={{ left: 236 }}
        series={[{ dataKey: 'value', label: 'Count', color: TEAL_NAVY[1][0] }]}
        slotProps={{ legend: { hidden: true } }}
        yAxis={[{ dataKey: 'licenseType', scaleType: 'band' }]}
      />
    )
  }

  if (viewType === 'byLawSchool') {
    const topLawSchools = getTopLawSchools(rows)

    const schools = [...topLawSchools, 'Other']

    const lawSchoolColors = Object.fromEntries(
      schools.map((school, index) => [school, LAW_SCHOOL_COLOR_PALETTE[index % LAW_SCHOOL_COLOR_PALETTE.length]])
    )

    return (
      <BarChart
        dataset={data}
        grid={{ vertical: true }}
        layout="horizontal"
        margin={{ left: 236 }}
        series={schools.map(school => ({
          color: lawSchoolColors[school],
          dataKey: school,
          label: school,
          stack: 'total'
        }))}
        slotProps={{ legend: { hidden: true } }}
        yAxis={[{ dataKey: 'licenseType', scaleType: 'band' }]}
      />
    )
  }

  if (viewType === 'byAdmissionDate') {
    const categories = Object.keys(data[0])
      .filter(key => key !== 'licenseType' && key !== 'total')
      .sort((a, b) => {
        if (a === 'Unknown' || a === 'No Admission Date') return -1
        if (b === 'Unknown' || b === 'No Admission Date') return 1

        return a.localeCompare(b)
      })

    const categoryColorPalette = [...ROSE_VIOLET[2], ...TEAL_NAVY[12]]

    const categoryColors = categories.reduce((acc, category, index) => {
      acc[category] = categoryColorPalette[index % categoryColorPalette.length]

      return acc
    }, {} as Record<string, string>)

    return (
      <BarChart
        dataset={data}
        grid={{ vertical: true }}
        layout="horizontal"
        margin={{ left: 236 }}
        series={categories.map(category => ({
          color: categoryColors[category],
          dataKey: category,
          label: category,
          stack: 'total'
        }))}
        slotProps={{ legend: { hidden: true } }}
        yAxis={[{ dataKey: 'licenseType', scaleType: 'band' }]}
      />
    )
  }

  return null
}
