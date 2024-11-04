import { BarChart } from '@mui/x-charts'
import { FC } from 'react'
import { LAW_SCHOOL_COLOR_PALETTE } from '../../constants/chartConstants'
import { TEAL_NAVY } from '../../constants/colors'
import { ChartTestId, TopEmployersViewType } from '../../types/chartTypes'

interface TopEmployersChartProps {
  data: any[]
  viewType: TopEmployersViewType
}

export const TopEmployersChart: FC<TopEmployersChartProps> = ({ data, viewType }) => {
  if (viewType === TopEmployersViewType.TOTAL) {
    return (
      <BarChart
        data-testid={ChartTestId.TOP_EMPLOYERS_TOTAL}
        dataset={data}
        grid={{ vertical: true }}
        layout="horizontal"
        margin={{ left: 253 }}
        series={[{ dataKey: 'value', label: 'Active Attorneys', color: TEAL_NAVY[1][0] }]}
        slotProps={{ legend: { hidden: true } }}
        yAxis={[{ dataKey: 'label', scaleType: 'band' }]}
      />
    )
  }

  if (viewType === TopEmployersViewType.BY_LAW_SCHOOL) {
    const categories = Object.keys(data[0]).filter(key => key !== 'label' && key !== 'count')

    const lawSchoolColors = Object.fromEntries(
      categories.map((school, index) => [school, LAW_SCHOOL_COLOR_PALETTE[index % LAW_SCHOOL_COLOR_PALETTE.length]])
    )

    return (
      <BarChart
        data-testid={ChartTestId.TOP_EMPLOYERS_BY_LAW_SCHOOL}
        dataset={data}
        grid={{ vertical: true }}
        layout="horizontal"
        margin={{ left: 253 }}
        series={categories.map(school => ({
          color: lawSchoolColors[school],
          dataKey: school,
          label: school,
          stack: 'count'
        }))}
        slotProps={{ legend: { hidden: true } }}
        yAxis={[{ dataKey: 'label', scaleType: 'band' }]}
      />
    )
  }

  if (viewType === TopEmployersViewType.BY_ADMISSION_DATE) {
    const categoryColorPalette = [...TEAL_NAVY[7]]

    const decades = Object.keys(data[0]).filter(key => key !== 'label' && key !== 'count')

    const decadeColors = decades.reduce((acc, decade, index) => {
      acc[decade] = categoryColorPalette[index % categoryColorPalette.length]

      return acc
    }, {} as Record<string, string>)

    return (
      <BarChart
        data-testid={ChartTestId.TOP_EMPLOYERS_BY_ADMISSION_DATE}
        dataset={data}
        grid={{ vertical: true }}
        layout="horizontal"
        margin={{ left: 253 }}
        series={decades.map(decade => ({
          color: decadeColors[decade],
          dataKey: decade,
          label: decade,
          stack: 'count'
        }))}
        slotProps={{ legend: { hidden: true } }}
        yAxis={[{ dataKey: 'label', scaleType: 'band' }]}
      />
    )
  }
}
