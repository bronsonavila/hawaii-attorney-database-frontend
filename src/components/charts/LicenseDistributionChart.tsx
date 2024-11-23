import { BarChart } from '@mui/x-charts'
import { ChartTestId, ViewType } from '../../types/chartTypes'
import { DatasetType } from '@mui/x-charts/internals'
import { FC } from 'react'
import { getTopLawSchools } from '../../utils/charts/commonUtils'
import { LAW_SCHOOL_COLOR_PALETTE } from '../../constants/chartConstants'
import { Row } from '../../App'
import { TEAL_NAVY, ROSE_VIOLET } from '../../constants/colors'

const COMMON_CHART_PROPS = {
  grid: { vertical: true },
  layout: 'horizontal' as const,
  margin: { left: 236 },
  slotProps: { legend: { hidden: true } },
  yAxis: [{ dataKey: 'licenseType', scaleType: 'band' as const }]
}

interface LicenseDistributionChartProps {
  data: DatasetType
  rows: Row[]
  viewType: ViewType
}

export const LicenseDistributionChart: FC<LicenseDistributionChartProps> = ({ data, rows, viewType }) => {
  if (viewType === ViewType.TOTAL) {
    return (
      <BarChart
        {...COMMON_CHART_PROPS}
        data-testid={ChartTestId.LICENSE_DISTRIBUTION_TOTAL}
        dataset={data}
        series={[{ dataKey: 'value', label: 'Count', color: TEAL_NAVY[1][0] }]}
      />
    )
  }

  if (viewType === ViewType.BY_LAW_SCHOOL) {
    const topLawSchools = getTopLawSchools(rows)

    const schools = [...topLawSchools, 'Other', 'Unknown']

    const lawSchoolColors = Object.fromEntries(
      schools.map((school, index) => [school, LAW_SCHOOL_COLOR_PALETTE[index % LAW_SCHOOL_COLOR_PALETTE.length]])
    )

    return (
      <BarChart
        {...COMMON_CHART_PROPS}
        data-testid={ChartTestId.LICENSE_DISTRIBUTION_BY_LAW_SCHOOL}
        dataset={data}
        series={schools.map(school => ({
          color: lawSchoolColors[school],
          dataKey: school,
          label: school,
          stack: 'count'
        }))}
      />
    )
  }

  if (viewType === ViewType.BY_ADMISSION_DATE) {
    const categories = Object.keys(data[0])
      .filter(key => key !== 'licenseType' && key !== 'count')
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
        {...COMMON_CHART_PROPS}
        data-testid={ChartTestId.LICENSE_DISTRIBUTION_BY_ADMISSION_DATE}
        dataset={data}
        layout="horizontal"
        series={categories.map(category => ({
          color: categoryColors[category],
          dataKey: category,
          label: category,
          stack: 'count'
        }))}
      />
    )
  }
}
