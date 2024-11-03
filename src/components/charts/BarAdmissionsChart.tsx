import { BarAdmissionsViewType, ChartTestId } from '../../types/chartTypes'
import { BarChart } from '@mui/x-charts'
import { FC } from 'react'
import { getTopLawSchools } from '../../utils/chartUtils'
import { LICENSE_TYPE_ORDER, LAW_SCHOOL_COLOR_PALETTE } from '../../constants/chartConstants'
import { ROSE_VIOLET, AMBER_BROWN, TEAL_NAVY } from '../../constants/colors'
import { Row } from '../../App'

interface BarAdmissionsChartProps {
  data: { year: string; total: number; [key: string]: number | string | undefined }[]
  rows: Row[]
  viewType: BarAdmissionsViewType
}

const LICENSE_TYPE_COLOR_PALETTE = [...TEAL_NAVY[4], ...AMBER_BROWN[3], ...ROSE_VIOLET[6]]

const LICENSE_TYPE_COLORS = Object.fromEntries(
  LICENSE_TYPE_ORDER.map((type, index) => [type, LICENSE_TYPE_COLOR_PALETTE[index % LICENSE_TYPE_COLOR_PALETTE.length]])
)

export const BarAdmissionsChart: FC<BarAdmissionsChartProps> = ({ data, rows, viewType }) => {
  if (viewType === BarAdmissionsViewType.BY_LAW_SCHOOL) {
    const attorneyData = data as { year: string; total: number; [key: string]: number | string | undefined }[]

    if (!attorneyData.length) return null

    const topLawSchools = getTopLawSchools(rows)

    const schools = [...topLawSchools, 'Other', 'Unknown']

    const lawSchoolColors = Object.fromEntries(
      schools.map((school, index) => [school, LAW_SCHOOL_COLOR_PALETTE[index % LAW_SCHOOL_COLOR_PALETTE.length]])
    )

    return (
      <BarChart
        data-testid={ChartTestId.BAR_ADMISSIONS_BY_LAW_SCHOOL}
        grid={{ horizontal: true }}
        series={schools.map(school => ({
          color: lawSchoolColors[school],
          data: attorneyData.map(d => d[school] as number),
          label: school,
          stack: 'total'
        }))}
        slotProps={{ legend: { hidden: true } }}
        xAxis={[{ data: attorneyData.map(d => d.year), scaleType: 'band', valueFormatter: v => v.toString() }]}
      />
    )
  }

  if (viewType === BarAdmissionsViewType.TOTAL) {
    const attorneyData = data as { year: string; total: number }[]

    if (!attorneyData.length) return null

    return (
      <BarChart
        data-testid={ChartTestId.BAR_ADMISSIONS_TOTAL}
        grid={{ horizontal: true }}
        series={[{ color: TEAL_NAVY[1][0], data: attorneyData.map(d => d.total), label: 'Count' }]}
        slotProps={{ legend: { hidden: true } }}
        xAxis={[{ data: attorneyData.map(d => d.year), scaleType: 'band', valueFormatter: v => v.toString() }]}
      />
    )
  }

  if (viewType === BarAdmissionsViewType.BY_LICENSE_TYPE) {
    const attorneyData = data as { year: string; total: number; [key: string]: number | string | undefined }[]

    const licenseTypes = Object.keys(attorneyData[0])
      .filter(key => key !== 'year' && key !== 'total')
      .sort((a, b) => LICENSE_TYPE_ORDER.indexOf(a) - LICENSE_TYPE_ORDER.indexOf(b))

    return (
      <BarChart
        data-testid={ChartTestId.BAR_ADMISSIONS_BY_LICENSE_TYPE}
        grid={{ horizontal: true }}
        series={licenseTypes.map(type => ({
          color: LICENSE_TYPE_COLORS[type],
          data: attorneyData.map(d => d[type] as number),
          label: type,
          stack: 'total'
        }))}
        slotProps={{ legend: { hidden: true } }}
        xAxis={[{ data: attorneyData.map(d => d.year), scaleType: 'band', valueFormatter: v => v.toString() }]}
      />
    )
  }

  return null
}
