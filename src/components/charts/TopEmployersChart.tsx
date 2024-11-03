import { FC } from 'react'
import { BarChart } from '@mui/x-charts'
import { LAW_SCHOOL_COLOR_PALETTE } from '../../constants/chartConstants'
import { TEAL_NAVY } from '../../constants/colors'

interface TopEmployersChartProps {
  data: any[]
  viewType: 'total' | 'byLawSchool' | 'byAdmissionDate'
}

export const TopEmployersChart: FC<TopEmployersChartProps> = ({ data, viewType }) => {
  if (viewType === 'total') {
    return (
      <BarChart
        dataset={data}
        grid={{ vertical: true }}
        layout="horizontal"
        margin={{ left: 253 }}
        series={[{ dataKey: 'value', label: 'Active Attorneys', color: TEAL_NAVY[1][0] }]}
        slotProps={{ legend: { hidden: true } }}
        title="Top Employers: Total"
        yAxis={[{ dataKey: 'label', scaleType: 'band' }]}
      />
    )
  }

  if (viewType === 'byLawSchool') {
    if (!data.length) return null

    const categories = Object.keys(data[0]).filter(key => key !== 'label' && key !== 'total')

    const lawSchoolColors = Object.fromEntries(
      categories.map((school, index) => [school, LAW_SCHOOL_COLOR_PALETTE[index % LAW_SCHOOL_COLOR_PALETTE.length]])
    )

    return (
      <BarChart
        dataset={data}
        grid={{ vertical: true }}
        layout="horizontal"
        margin={{ left: 253 }}
        series={categories.map(school => ({
          color: lawSchoolColors[school],
          dataKey: school,
          label: school,
          stack: 'total'
        }))}
        slotProps={{ legend: { hidden: true } }}
        title="Top Employers: By Law School"
        yAxis={[{ dataKey: 'label', scaleType: 'band' }]}
      />
    )
  }

  if (viewType === 'byAdmissionDate') {
    if (!data.length) return null

    const categoryColorPalette = [...TEAL_NAVY[7]]

    const decades = Object.keys(data[0]).filter(key => key !== 'label' && key !== 'total')

    const decadeColors = decades.reduce((acc, decade, index) => {
      acc[decade] = categoryColorPalette[index % categoryColorPalette.length]

      return acc
    }, {} as Record<string, string>)

    return (
      <BarChart
        dataset={data}
        grid={{ vertical: true }}
        layout="horizontal"
        margin={{ left: 253 }}
        series={decades.map(decade => ({
          color: decadeColors[decade],
          dataKey: decade,
          label: decade,
          stack: 'total'
        }))}
        slotProps={{ legend: { hidden: true } }}
        title="Top Employers: By Admission Date"
        yAxis={[{ dataKey: 'label', scaleType: 'band' }]}
      />
    )
  }

  return null
}
