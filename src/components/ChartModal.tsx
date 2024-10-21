import { FC, useMemo, useState } from 'react'
import { BarChart } from '@mui/x-charts'
import {
  Box,
  Button,
  Modal,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material'
import { Row } from '../App'
import { AMBER_BROWN, ROSE_VIOLET, TEAL_NAVY } from '../constants/colors'

// Types

interface ChartModalProps {
  isOpen: boolean
  onClose: () => void
  rows: Row[]
}

type ChartType = 'attorneysByYearAndType' | 'licenseDistribution' | 'topEmployers'
type AttorneysViewType = 'total' | 'byLicenseType' | 'byLawSchool'
type LicenseDistributionViewType = 'total' | 'byLawSchool' | 'byAdmissionDecade'
type TopEmployersViewType = 'total' | 'byLawSchool' | 'byAdmissionDecade'

// Constants

const LAW_SCHOOL_COLOR_PALETTE = [...TEAL_NAVY[3], ...AMBER_BROWN[3], ...ROSE_VIOLET[5]]

const LICENSE_TYPE_COLOR_PALETTE = [...TEAL_NAVY[4], ...AMBER_BROWN[3], ...ROSE_VIOLET[6]]

const LICENSE_TYPE_ORDER = [
  'Active',
  'Government',
  'Judge',
  'Retired Judge Per Diem',
  'RLSA',
  'RMSA',
  'Foreign Law Consultant',
  'Inactive',
  'Suspended',
  'Resign',
  'Disbarred',
  'Criminal Conviction',
  'Deceased'
]

const LICENSE_TYPE_COLORS = Object.fromEntries(
  LICENSE_TYPE_ORDER.map((type, index) => [type, LICENSE_TYPE_COLOR_PALETTE[index % LICENSE_TYPE_COLOR_PALETTE.length]])
)

// Functions

const calculateAttorneysByYearAndType = (
  rows: Row[],
  viewType: AttorneysViewType
): { year: string; total: number; [key: string]: number | string | undefined }[] => {
  const topLawSchools = getTopLawSchools(rows)

  const attorneysByYearAndType = rows.reduce((result, row) => {
    if (row.barAdmissionDate && row.licenseType !== 'Pro Hac Vice') {
      const year = new Date(row.barAdmissionDate).getFullYear().toString()

      if (!result[year]) {
        result[year] = { total: 0 }
      }

      result[year]['total'] += 1

      if (viewType === 'byLawSchool') {
        let lawSchool = row.lawSchool?.trim() || 'Other'

        if (lawSchool === 'Unknown' || !topLawSchools.includes(lawSchool)) {
          lawSchool = 'Other'
        }

        result[year][lawSchool] = (result[year][lawSchool] || 0) + 1
      } else if (viewType === 'byLicenseType') {
        let licenseType = row.licenseType

        // Consolidate the variations of Inactive, Resign, and Suspended license types into a single category.
        if (licenseType.startsWith('Inactive')) licenseType = 'Inactive'
        if (licenseType.startsWith('Resign')) licenseType = 'Resign'
        if (licenseType.startsWith('Suspended')) licenseType = 'Suspended'

        result[year][licenseType] = (result[year][licenseType] || 0) + 1
      }
    }

    return result
  }, {} as Record<string, Record<string, number>>)

  return Object.entries(attorneysByYearAndType)
    .map(([year, types]) => {
      if (viewType === 'byLawSchool') {
        const schools = [...topLawSchools, 'Other']

        return {
          total: types['total'],
          year,
          ...schools.reduce((result, school) => ({ ...result, [school]: types[school] || 0 }), {})
        }
      } else if (viewType === 'byLicenseType') {
        return {
          total: types['total'],
          year,
          ...LICENSE_TYPE_ORDER.reduce((result, type) => ({ ...result, [type]: types[type] || 0 }), {})
        }
      } else {
        return { total: types['total'], year }
      }
    })
    .sort((a, b) => a.year.localeCompare(b.year))
}

const calculateLicenseDistribution = (rows: Row[], viewType: LicenseDistributionViewType): any[] => {
  const topLawSchools = getTopLawSchools(rows)

  const distribution = rows.reduce((result, row) => {
    if (!result[row.licenseType]) {
      result[row.licenseType] = { total: 0 }
    }
    result[row.licenseType].total += 1

    if (viewType === 'byLawSchool') {
      let lawSchool = row.lawSchool?.trim() || 'Other'
      if (lawSchool === 'Unknown' || !topLawSchools.includes(lawSchool)) {
        lawSchool = 'Other'
      }
      result[row.licenseType][lawSchool] = (result[row.licenseType][lawSchool] || 0) + 1
    } else if (viewType === 'byAdmissionDecade') {
      if (row.licenseType === 'Pro Hac Vice') {
        result[row.licenseType]['No Admission Date'] = (result[row.licenseType]['No Admission Date'] || 0) + 1
      } else if (row.barAdmissionDate) {
        const admissionDate = new Date(row.barAdmissionDate)
        const decade = Math.floor(admissionDate.getFullYear() / 10) * 10
        const decadeLabel = `${decade}s`
        result[row.licenseType][decadeLabel] = (result[row.licenseType][decadeLabel] || 0) + 1
      } else {
        result[row.licenseType]['Unknown'] = (result[row.licenseType]['Unknown'] || 0) + 1
      }
    }

    return result
  }, {} as Record<string, Record<string, number>>)

  if (viewType === 'total') {
    return Object.entries(distribution)
      .map(([licenseType, { total }]) => ({ licenseType, value: total }))
      .sort((a, b) => b.value - a.value)
  } else if (viewType === 'byLawSchool') {
    const schools = [...topLawSchools, 'Other']
    return Object.entries(distribution)
      .map(([licenseType, data]) => ({
        licenseType,
        total: data.total,
        ...schools.reduce((acc, school) => ({ ...acc, [school]: data[school] || 0 }), {})
      }))
      .sort((a, b) => b.total - a.total)
  } else {
    const categories = new Set<string>()
    Object.values(distribution).forEach(data => {
      Object.keys(data).forEach(key => {
        if (key !== 'total') categories.add(key)
      })
    })

    const sortedCategories = Array.from(categories).sort((a, b) => {
      if (a === 'Unknown' || a === 'No Admission Date') return -1
      if (b === 'Unknown' || b === 'No Admission Date') return 1
      return a.localeCompare(b)
    })

    return Object.entries(distribution)
      .map(([licenseType, data]) => ({
        licenseType,
        total: data.total,
        ...sortedCategories.reduce((acc, category) => ({ ...acc, [category]: data[category] || 0 }), {})
      }))
      .sort((a, b) => b.total - a.total)
  }
}

const calculatetopEmployers = (rows: Row[], viewType: TopEmployersViewType): any[] => {
  const suffixes = ['A Law Corporation', 'A Law Corp.', 'A Law Corp', 'AAL', 'ALC', 'LLLC', 'LLLP', 'LLP', '& Pettit']

  const stripSuffixes = (name: string) => {
    suffixes.forEach(suffix => {
      const suffixRegex = new RegExp(`\\s*${suffix}\\s*`, 'gi')
      name = name.replace(suffixRegex, ' ')
    })
    name = name.trim().replace(/(?<!Inc)[.,\s]+$/, '')
    return name
  }

  if (viewType === 'total') {
    const firms = rows
      .filter(
        row => row.licenseType === 'Active' && row.employer && !row.employer.toLowerCase().includes('attorney at law')
      )
      .reduce((result, row) => {
        const employerName = stripSuffixes(row.employer)

        result[employerName] = (result[employerName] || 0) + 1

        return result
      }, {} as Record<string, number>)

    return Object.entries(firms)
      .map(([firm, count]) => ({ id: firm, value: count, label: firm }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 25)
  } else if (viewType === 'byLawSchool') {
    const topLawSchools = getTopLawSchools(rows)
    const firms = rows
      .filter(
        row => row.licenseType === 'Active' && row.employer && !row.employer.toLowerCase().includes('attorney at law')
      )
      .reduce((result, row) => {
        const employerName = stripSuffixes(row.employer)

        if (!result[employerName]) {
          result[employerName] = { total: 0 }
        }
        result[employerName].total += 1

        let lawSchool = row.lawSchool?.trim() || 'Other'
        if (lawSchool === 'Unknown' || !topLawSchools.includes(lawSchool)) {
          lawSchool = 'Other'
        }

        result[employerName][lawSchool] = (result[employerName][lawSchool] || 0) + 1

        return result
      }, {} as Record<string, Record<string, number>>)

    return Object.entries(firms)
      .map(([firm, data]) => ({
        label: firm,
        total: data.total,
        ...topLawSchools.reduce((acc, school) => ({ ...acc, [school]: data[school] || 0 }), {}),
        Other:
          Object.entries(data)
            .filter(([key]) => key !== 'total' && !topLawSchools.includes(key))
            .reduce((sum, [, value]) => sum + value, 0) || 0
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 25)
  } else if (viewType === 'byAdmissionDecade') {
    const firms = rows
      .filter(
        row => row.licenseType === 'Active' && row.employer && !row.employer.toLowerCase().includes('attorney at law')
      )
      .reduce((result, row) => {
        const employerName = stripSuffixes(row.employer)
        const admissionDate = row.barAdmissionDate ? new Date(row.barAdmissionDate) : null

        if (admissionDate) {
          const decade = Math.floor(admissionDate.getFullYear() / 10) * 10
          const decadeLabel = `${decade}s`

          if (!result[employerName]) {
            result[employerName] = { total: 0 }
          }

          result[employerName].total += 1
          result[employerName][decadeLabel] = (result[employerName][decadeLabel] || 0) + 1
        }

        return result
      }, {} as Record<string, Record<string, number>>)

    return Object.entries(firms)
      .map(([firm, data]) => ({
        label: firm,
        total: data.total,
        ...Object.keys(data)
          .filter(key => key !== 'total')
          .reduce((acc, decade) => ({ ...acc, [decade]: data[decade] }), {})
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 25)
  }

  return []
}

const getTopLawSchools = (rows: Row[], topN: number = 10): string[] => {
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

// Component

export const ChartModal: FC<ChartModalProps> = ({ isOpen, onClose, rows }) => {
  const [attorneysViewType, setAttorneysViewType] = useState<AttorneysViewType>('total')
  const [chartType, setChartType] = useState<ChartType>('attorneysByYearAndType')
  const [licenseDistributionViewType, setLicenseDistributionViewType] = useState<LicenseDistributionViewType>('total')
  const [topEmployersViewType, setTopEmployersViewType] = useState<TopEmployersViewType>('total')

  const data = useMemo(() => {
    switch (chartType) {
      case 'attorneysByYearAndType':
        return calculateAttorneysByYearAndType(rows, attorneysViewType)

      case 'licenseDistribution':
        return calculateLicenseDistribution(rows, licenseDistributionViewType)

      case 'topEmployers':
        return calculatetopEmployers(rows, topEmployersViewType)

      default:
        return []
    }
  }, [chartType, rows, attorneysViewType, licenseDistributionViewType, topEmployersViewType])

  const chartElement = useMemo(() => {
    if (chartType === 'attorneysByYearAndType' && attorneysViewType === 'byLawSchool') {
      const attorneyData = data as { year: string; total: number; [key: string]: number | string | undefined }[]

      if (!attorneyData.length) return null

      const topLawSchools = getTopLawSchools(rows)
      const schools = [...topLawSchools, 'Other']

      const LAW_SCHOOL_COLORS = Object.fromEntries(
        schools.map((school, index) => [school, LAW_SCHOOL_COLOR_PALETTE[index % LAW_SCHOOL_COLOR_PALETTE.length]])
      )

      return (
        <BarChart
          grid={{ horizontal: true }}
          series={schools.map(school => ({
            color: LAW_SCHOOL_COLORS[school],
            data: attorneyData.map(d => d[school] as number),
            label: school,
            stack: 'total'
          }))}
          slotProps={{ legend: { hidden: true } }}
          xAxis={[{ data: attorneyData.map(d => d.year), scaleType: 'band', valueFormatter: v => v.toString() }]}
        />
      )
    }

    switch (chartType) {
      case 'attorneysByYearAndType': {
        const attorneyData = data as { year: string; total: number; [key: string]: number | string | undefined }[]

        if (!attorneyData.length) return null

        if (attorneysViewType === 'total') {
          return (
            <BarChart
              grid={{ horizontal: true }}
              series={[{ color: TEAL_NAVY[1][0], data: attorneyData.map(d => d.total as number), label: 'Count' }]}
              slotProps={{ legend: { hidden: true } }}
              xAxis={[{ data: attorneyData.map(d => d.year), scaleType: 'band', valueFormatter: v => v.toString() }]}
            />
          )
        } else if (attorneysViewType === 'byLicenseType') {
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
        } else if (attorneysViewType === 'byLawSchool') {
          const topLawSchools = getTopLawSchools(rows)

          const LAW_SCHOOL_COLORS = Object.fromEntries(
            topLawSchools.map((school, index) => [
              school,
              LICENSE_TYPE_COLOR_PALETTE[index % LICENSE_TYPE_COLOR_PALETTE.length]
            ])
          )

          return (
            <BarChart
              grid={{ horizontal: true }}
              xAxis={[{ data: attorneyData.map(d => d.year), scaleType: 'band', valueFormatter: v => v.toString() }]}
              series={topLawSchools.map(school => ({
                color: LAW_SCHOOL_COLORS[school],
                data: attorneyData.map(d => d[school] as number),
                label: school,
                stack: 'total'
              }))}
              slotProps={{ legend: { hidden: true } }}
            />
          )
        } else {
          return null
        }
      }

      case 'licenseDistribution': {
        if (licenseDistributionViewType === 'total') {
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
        } else if (licenseDistributionViewType === 'byLawSchool') {
          const topLawSchools = getTopLawSchools(rows)
          const schools = [...topLawSchools, 'Other']
          const LAW_SCHOOL_COLORS = Object.fromEntries(
            schools.map((school, index) => [school, LAW_SCHOOL_COLOR_PALETTE[index % LAW_SCHOOL_COLOR_PALETTE.length]])
          )

          return (
            <BarChart
              dataset={data}
              grid={{ vertical: true }}
              layout="horizontal"
              margin={{ left: 236 }}
              series={schools.map(school => ({
                dataKey: school,
                label: school,
                stack: 'total',
                color: LAW_SCHOOL_COLORS[school]
              }))}
              slotProps={{ legend: { hidden: true } }}
              yAxis={[{ dataKey: 'licenseType', scaleType: 'band' }]}
            />
          )
        } else {
          const categories = Object.keys(data[0])
            .filter(key => key !== 'licenseType' && key !== 'total')
            .sort((a, b) => {
              if (a === 'Unknown' || a === 'No Admission Date') return -1
              if (b === 'Unknown' || b === 'No Admission Date') return 1
              return a.localeCompare(b)
            })

          const CATEGORY_COLOR_PALETTE = [...ROSE_VIOLET[2], ...TEAL_NAVY[12]]
          const categoryColors = categories.reduce((acc, category, index) => {
            acc[category] = CATEGORY_COLOR_PALETTE[index % CATEGORY_COLOR_PALETTE.length]
            return acc
          }, {} as Record<string, string>)

          return (
            <BarChart
              dataset={data}
              grid={{ vertical: true }}
              layout="horizontal"
              margin={{ left: 236 }}
              series={categories.map(category => ({
                dataKey: category,
                label: category,
                stack: 'total',
                color: categoryColors[category]
              }))}
              slotProps={{ legend: { hidden: true } }}
              yAxis={[{ dataKey: 'licenseType', scaleType: 'band' }]}
            />
          )
        }
      }

      case 'topEmployers':
        if (topEmployersViewType === 'total') {
          return (
            <BarChart
              dataset={data}
              grid={{ vertical: true }}
              layout="horizontal"
              margin={{ left: 253 }}
              series={[{ dataKey: 'value', label: 'Active Attorneys', color: TEAL_NAVY[1][0] }]}
              slotProps={{ legend: { hidden: true } }}
              yAxis={[{ dataKey: 'label', scaleType: 'band' }]}
            />
          )
        } else if (topEmployersViewType === 'byLawSchool') {
          if (!data.length) return null

          const categories = Object.keys(data[0]).filter(key => key !== 'label' && key !== 'total')
          const LAW_SCHOOL_COLORS = Object.fromEntries(
            categories.map((school, index) => [
              school,
              LAW_SCHOOL_COLOR_PALETTE[index % LAW_SCHOOL_COLOR_PALETTE.length]
            ])
          )

          return (
            <BarChart
              dataset={data}
              grid={{ vertical: true }}
              layout="horizontal"
              margin={{ left: 253 }}
              series={categories.map(school => ({
                dataKey: school,
                label: school,
                stack: 'total',
                color: LAW_SCHOOL_COLORS[school]
              }))}
              slotProps={{ legend: { hidden: true } }}
              yAxis={[{ dataKey: 'label', scaleType: 'band' }]}
            />
          )
        } else if (topEmployersViewType === 'byAdmissionDecade') {
          if (!data.length) return null

          const decades = Object.keys(data[0]).filter(key => key !== 'label' && key !== 'total')
          const DECADE_COLOR_PALETTE = [...TEAL_NAVY[7]]
          const decadeColors = decades.reduce((acc, decade, index) => {
            acc[decade] = DECADE_COLOR_PALETTE[index % DECADE_COLOR_PALETTE.length]
            return acc
          }, {} as Record<string, string>)

          return (
            <BarChart
              dataset={data}
              grid={{ vertical: true }}
              layout="horizontal"
              margin={{ left: 253 }}
              series={decades.map(decade => ({
                dataKey: decade,
                label: decade,
                stack: 'total',
                color: decadeColors[decade]
              }))}
              slotProps={{ legend: { hidden: true } }}
              yAxis={[{ dataKey: 'label', scaleType: 'band' }]}
            />
          )
        } else {
          return null
        }

      default:
        return null
    }
  }, [chartType, data, attorneysViewType, licenseDistributionViewType, topEmployersViewType, rows])

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          left: '50%',
          position: 'absolute',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <Box sx={{ pt: 4, pl: 4, pr: 6 }}>
          <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
            <FormControl sx={{ width: 400 }}>
              <InputLabel id="chart-type-label">Chart</InputLabel>

              <Select
                label="Chart"
                labelId="chart-type-label"
                onChange={event => {
                  const newChartType = event.target.value as ChartType
                  setChartType(newChartType)

                  // Reset viewType to the first option for each chart type
                  switch (newChartType) {
                    case 'attorneysByYearAndType':
                      setAttorneysViewType('total')
                      break
                    case 'licenseDistribution':
                      setLicenseDistributionViewType('total')
                      break
                    case 'topEmployers':
                      setTopEmployersViewType('total')
                      break
                  }
                }}
                size="small"
                value={chartType}
              >
                <MenuItem value="attorneysByYearAndType">Attorneys by Admission Year</MenuItem>
                <MenuItem value="licenseDistribution">License Type Distribution</MenuItem>
                <MenuItem value="topEmployers">Top 25 Employers (Non-Government)</MenuItem>
              </Select>
            </FormControl>

            {chartType === 'attorneysByYearAndType' && (
              <FormControl component="fieldset" sx={{ ml: 4 }}>
                <RadioGroup
                  onChange={event => setAttorneysViewType(event.target.value as AttorneysViewType)}
                  row
                  sx={{ gap: 2 }}
                  value={attorneysViewType}
                >
                  <FormControlLabel value="total" control={<Radio size="small" />} label="Total Count" />

                  <FormControlLabel value="byLicenseType" control={<Radio size="small" />} label="By License Type" />

                  <FormControlLabel value="byLawSchool" control={<Radio size="small" />} label="By Law School" />
                </RadioGroup>
              </FormControl>
            )}

            {chartType === 'licenseDistribution' && (
              <FormControl component="fieldset" sx={{ ml: 4 }}>
                <RadioGroup
                  onChange={event => setLicenseDistributionViewType(event.target.value as LicenseDistributionViewType)}
                  row
                  sx={{ gap: 2 }}
                  value={licenseDistributionViewType}
                >
                  <FormControlLabel value="total" control={<Radio size="small" />} label="Total Count" />
                  <FormControlLabel
                    value="byAdmissionDecade"
                    control={<Radio size="small" />}
                    label="By Admission Decade"
                  />
                  <FormControlLabel value="byLawSchool" control={<Radio size="small" />} label="By Law School" />
                </RadioGroup>
              </FormControl>
            )}

            {chartType === 'topEmployers' && (
              <FormControl component="fieldset" sx={{ ml: 4 }}>
                <RadioGroup
                  onChange={event => setTopEmployersViewType(event.target.value as TopEmployersViewType)}
                  row
                  sx={{ gap: 2 }}
                  value={topEmployersViewType}
                >
                  <FormControlLabel value="total" control={<Radio size="small" />} label="Total Count" />
                  <FormControlLabel
                    value="byAdmissionDecade"
                    control={<Radio size="small" />}
                    label="By Admission Decade"
                  />
                  <FormControlLabel value="byLawSchool" control={<Radio size="small" />} label="By Law School" />
                </RadioGroup>
              </FormControl>
            )}
          </Box>
        </Box>

        <Box sx={{ height: '70dvh', maxWidth: 1536, px: 2, width: '90dvw' }}>{chartElement}</Box>

        <Button onClick={onClose} sx={{ display: 'block', ml: 'auto', mb: 2, mr: 2 }}>
          Close
        </Button>
      </Box>
    </Modal>
  )
}
