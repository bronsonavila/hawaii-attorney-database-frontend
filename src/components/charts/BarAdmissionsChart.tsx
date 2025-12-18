import { BarChart } from '@mui/x-charts'
import { ChartTestId, ViewType } from '@/types/chart'
import { DatasetType } from '@mui/x-charts/internals'
import { getTopLawSchools } from '@/utils/charts/commonUtils'
import { LICENSE_TYPE_COLOR_PALETTE, LICENSE_TYPE_ORDER, LAW_SCHOOL_COLOR_PALETTE } from '@/constants/chartConstants'
import { TEAL_NAVY } from '@/constants/colors'
import { Row } from '@/types/row'

const COMMON_CHART_PROPS = { grid: { horizontal: true }, slotProps: { legend: { hidden: true } } }

interface BarAdmissionsChartProps {
  data: DatasetType
  rows: Row[]
  viewType: ViewType
}

export const BarAdmissionsChart = ({ data, rows, viewType }: BarAdmissionsChartProps) => {
  if (viewType === ViewType.TOTAL) {
    const attorneyData = data as { year: string; count: number }[]

    return (
      <BarChart
        {...COMMON_CHART_PROPS}
        data-testid={ChartTestId.BAR_ADMISSIONS_TOTAL}
        series={[{ color: TEAL_NAVY[1][0], data: attorneyData.map(d => d.count), label: 'Count' }]}
        xAxis={[{ data: attorneyData.map(d => d.year), scaleType: 'band', valueFormatter: v => v.toString() }]}
      />
    )
  }

  if (viewType === ViewType.BY_LICENSE_TYPE) {
    const attorneyData = data as { year: string; count: number; [key: string]: number | string | undefined }[]

    const licenseTypes = Object.keys(attorneyData[0])
      .filter(key => key !== 'year' && key !== 'count')
      .sort((a, b) => {
        const indexA = LICENSE_TYPE_ORDER.indexOf(a)
        const indexB = LICENSE_TYPE_ORDER.indexOf(b)

        const effectiveIndexA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA
        const effectiveIndexB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB

        if (effectiveIndexA !== effectiveIndexB) return effectiveIndexA - effectiveIndexB

        return a.localeCompare(b)
      })

    const licenseTypeColors = Object.fromEntries(
      licenseTypes.map((type, index) => [type, LICENSE_TYPE_COLOR_PALETTE[index % LICENSE_TYPE_COLOR_PALETTE.length]])
    )

    return (
      <BarChart
        {...COMMON_CHART_PROPS}
        data-testid={ChartTestId.BAR_ADMISSIONS_BY_LICENSE_TYPE}
        series={licenseTypes.map(type => ({
          color: licenseTypeColors[type],
          data: attorneyData.map(d => d[type] as number),
          label: type,
          stack: 'count'
        }))}
        xAxis={[{ data: attorneyData.map(d => d.year), scaleType: 'band', valueFormatter: v => v.toString() }]}
      />
    )
  }

  if (viewType === ViewType.BY_LAW_SCHOOL) {
    const attorneyData = data as { year: string; count: number; [key: string]: number | string | undefined }[]

    const topLawSchools = getTopLawSchools(rows)

    const schools = [...topLawSchools, 'Other']

    const lawSchoolColors = Object.fromEntries(
      schools.map((school, index) => [school, LAW_SCHOOL_COLOR_PALETTE[index % LAW_SCHOOL_COLOR_PALETTE.length]])
    )

    return (
      <BarChart
        {...COMMON_CHART_PROPS}
        data-testid={ChartTestId.BAR_ADMISSIONS_BY_LAW_SCHOOL}
        series={schools.map(school => ({
          color: lawSchoolColors[school],
          data: attorneyData.map(d => d[school] as number),
          label: school,
          stack: 'count'
        }))}
        xAxis={[{ data: attorneyData.map(d => d.year), scaleType: 'band', valueFormatter: v => v.toString() }]}
      />
    )
  }
}
