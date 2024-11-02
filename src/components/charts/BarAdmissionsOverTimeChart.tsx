import { BarChart } from '@mui/x-charts'
import { FC } from 'react'
import { getTopLawSchools } from '../../utils/chartUtils'
import { LICENSE_TYPE_ORDER, LAW_SCHOOL_COLOR_PALETTE } from '../../constants/chartConstants'
import { Row } from '../../App'
import { ROSE_VIOLET, AMBER_BROWN, TEAL_NAVY } from '../../constants/colors'

interface BarAdmissionsOverTimeChartProps {
  data: { year: string; total: number; [key: string]: number | string | undefined }[]
  rows: Row[]
  viewType: 'total' | 'byLicenseType' | 'byLawSchool'
}

const LICENSE_TYPE_COLOR_PALETTE = [...TEAL_NAVY[4], ...AMBER_BROWN[3], ...ROSE_VIOLET[6]]

const LICENSE_TYPE_COLORS = Object.fromEntries(
  LICENSE_TYPE_ORDER.map((type, index) => [type, LICENSE_TYPE_COLOR_PALETTE[index % LICENSE_TYPE_COLOR_PALETTE.length]])
)

export const BarAdmissionsOverTimeChart: FC<BarAdmissionsOverTimeChartProps> = ({ data, rows, viewType }) => {
  if (viewType === 'byLawSchool') {
    const attorneyData = data as { year: string; total: number; [key: string]: number | string | undefined }[]

    if (!attorneyData.length) return null

    const topLawSchools = getTopLawSchools(rows)

    const schools = [...topLawSchools, 'Other', 'Unknown']

    const lawSchoolColors = Object.fromEntries(
      schools.map((school, index) => [school, LAW_SCHOOL_COLOR_PALETTE[index % LAW_SCHOOL_COLOR_PALETTE.length]])
    )

    return (
      <BarChart
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

  if (viewType === 'total') {
    const attorneyData = data as { year: string; total: number }[]

    if (!attorneyData.length) return null

    return (
      <BarChart
        grid={{ horizontal: true }}
        series={[{ color: TEAL_NAVY[1][0], data: attorneyData.map(d => d.total), label: 'Count' }]}
        slotProps={{ legend: { hidden: true } }}
        xAxis={[{ data: attorneyData.map(d => d.year), scaleType: 'band', valueFormatter: v => v.toString() }]}
      />
    )
  }

  if (viewType === 'byLicenseType') {
    const attorneyData = data as { year: string; total: number; [key: string]: number | string | undefined }[]

    const licenseTypes = Object.keys(attorneyData[0])
      .filter(key => key !== 'year' && key !== 'total')
      .sort((a, b) => LICENSE_TYPE_ORDER.indexOf(a) - LICENSE_TYPE_ORDER.indexOf(b))

    return (
      <BarChart
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
