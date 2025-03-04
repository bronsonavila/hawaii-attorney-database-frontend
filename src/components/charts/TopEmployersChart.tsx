import { BarChart } from '@mui/x-charts'
import { ChartTestId, ViewType } from '../../enums/chartEnums'
import { DatasetType } from '@mui/x-charts/internals'
import { FC } from 'react'
import { LAW_SCHOOL_COLOR_PALETTE } from '../../constants/chartConstants'
import { TEAL_NAVY } from '../../constants/colors'

const COMMON_CHART_PROPS = {
  grid: { vertical: true },
  layout: 'horizontal' as const,
  margin: { left: 253 },
  slotProps: { legend: { hidden: true } },
  yAxis: [{ dataKey: 'label', scaleType: 'band' as const }]
}

interface TopEmployersChartProps {
  data: DatasetType
  viewType: ViewType
}

export const TopEmployersChart: FC<TopEmployersChartProps> = ({ data, viewType }) => {
  if (viewType === ViewType.TOTAL) {
    return (
      <BarChart
        {...COMMON_CHART_PROPS}
        data-testid={ChartTestId.TOP_EMPLOYERS_TOTAL}
        dataset={data}
        series={[{ dataKey: 'value', label: 'Active Attorneys', color: TEAL_NAVY[1][0] }]}
      />
    )
  }

  if (viewType === ViewType.BY_ADMISSION_DATE) {
    const categoryColorPalette = [...TEAL_NAVY[7]]

    const decades = Object.keys(data[0]).filter(key => key !== 'label' && key !== 'count')

    const decadeColors = decades.reduce((acc, decade, index) => {
      acc[decade] = categoryColorPalette[index % categoryColorPalette.length]

      return acc
    }, {} as Record<string, string>)

    return (
      <BarChart
        {...COMMON_CHART_PROPS}
        data-testid={ChartTestId.TOP_EMPLOYERS_BY_ADMISSION_DATE}
        dataset={data}
        series={decades.map(decade => ({
          color: decadeColors[decade],
          dataKey: decade,
          label: decade,
          stack: 'count'
        }))}
      />
    )
  }

  if (viewType === ViewType.BY_LAW_SCHOOL) {
    const categories = Object.keys(data[0]).filter(key => key !== 'label' && key !== 'count')

    const lawSchoolColors = Object.fromEntries(
      categories.map((school, index) => [school, LAW_SCHOOL_COLOR_PALETTE[index % LAW_SCHOOL_COLOR_PALETTE.length]])
    )

    return (
      <BarChart
        {...COMMON_CHART_PROPS}
        data-testid={ChartTestId.TOP_EMPLOYERS_BY_LAW_SCHOOL}
        dataset={data}
        series={categories.map(school => ({
          color: lawSchoolColors[school],
          dataKey: school,
          label: school,
          stack: 'count'
        }))}
      />
    )
  }
}
