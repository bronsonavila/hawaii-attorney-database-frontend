import { BarAdmissionsOverTimeChart } from './BarAdmissionsOverTimeChart'
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Modal,
  PaletteMode,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent
} from '@mui/material'
import {
  calculateBarAdmissionsOverTime,
  calculateLicenseDistribution,
  calculateTopEmployers
} from '../../utils/chartUtils'
import { FC, useMemo, useState } from 'react'
import { LicenseDistributionChart } from './LicenseDistributionChart'
import { Row } from '../../App'
import { TopEmployersChart } from './TopEmployersChart'

// Types

interface ChartModalProps {
  isOpen: boolean
  onClose: () => void
  paletteMode: PaletteMode
  rows: Row[]
}

export type ChartType = 'barAdmissionsOverTime' | 'licenseDistribution' | 'topEmployers'

export type BarAdmissionsViewType = 'total' | 'byLicenseType' | 'byLawSchool'
export type LicenseDistributionViewType = 'total' | 'byLawSchool' | 'byAdmissionDecade'
export type TopEmployersViewType = 'total' | 'byLawSchool' | 'byAdmissionDecade'

// Component

export const ChartModal: FC<ChartModalProps> = ({ isOpen, onClose, paletteMode, rows }) => {
  const [chartType, setChartType] = useState<ChartType>('barAdmissionsOverTime')

  const [barAdmissionsViewType, setBarAdmissionsViewType] = useState<BarAdmissionsViewType>('total')
  const [licenseDistributionViewType, setLicenseDistributionViewType] = useState<LicenseDistributionViewType>('total')
  const [topEmployersViewType, setTopEmployersViewType] = useState<TopEmployersViewType>('total')

  const data = useMemo(() => {
    switch (chartType) {
      case 'barAdmissionsOverTime':
        return calculateBarAdmissionsOverTime(rows, barAdmissionsViewType)

      case 'licenseDistribution':
        return calculateLicenseDistribution(rows, licenseDistributionViewType)

      case 'topEmployers':
        return calculateTopEmployers(rows, topEmployersViewType)

      default:
        return []
    }
  }, [barAdmissionsViewType, chartType, licenseDistributionViewType, rows, topEmployersViewType])

  const chartElement = useMemo(() => {
    switch (chartType) {
      case 'barAdmissionsOverTime':
        return <BarAdmissionsOverTimeChart data={data} rows={rows} viewType={barAdmissionsViewType} />

      case 'licenseDistribution':
        return <LicenseDistributionChart data={data} rows={rows} viewType={licenseDistributionViewType} />

      case 'topEmployers':
        return <TopEmployersChart data={data} viewType={topEmployersViewType} />

      default:
        return null
    }
  }, [barAdmissionsViewType, chartType, data, licenseDistributionViewType, rows, topEmployersViewType])

  const handleChartTypeChange = (event: SelectChangeEvent<ChartType>) => {
    const newChartType = event.target.value as ChartType

    setChartType(newChartType)
  }

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          display: { xs: 'none', lg: 'revert' },
          left: '50%',
          position: 'absolute',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <Box sx={{ pt: 4, pl: 4, pr: 6 }}>
          <Box sx={{ alignItems: 'end', display: 'flex', justifyContent: 'space-between' }}>
            <FormControl sx={{ width: 400 }}>
              <FormLabel sx={{ fontSize: 12, mb: 1 }}>Select Chart</FormLabel>

              <Select onChange={handleChartTypeChange} size="small" value={chartType}>
                <MenuItem value="barAdmissionsOverTime">Bar Admissions Over Time</MenuItem>

                <MenuItem value="licenseDistribution">License Type Distribution</MenuItem>

                <MenuItem value="topEmployers">Top 25 Employers (Non-Government)</MenuItem>
              </Select>
            </FormControl>

            <FormControl component="fieldset" sx={{ ml: 4 }}>
              <FormLabel
                sx={{
                  fontSize: 12,
                  mb: 1,
                  // Prevent MUI's default focus color from flickering in-and-out when clicking radio buttons.
                  '&.Mui-focused': { color: paletteMode === 'dark' ? '#ffffff99' : '#00000099' }
                }}
              >
                View Attorneys By
              </FormLabel>

              {chartType === 'barAdmissionsOverTime' && (
                <RadioGroup
                  onChange={event => setBarAdmissionsViewType(event.target.value as BarAdmissionsViewType)}
                  row
                  sx={{ gap: 2 }}
                  value={barAdmissionsViewType}
                >
                  <FormControlLabel value="total" control={<Radio size="small" />} label="Total Count" />

                  <FormControlLabel value="byLicenseType" control={<Radio size="small" />} label="License Type" />

                  <FormControlLabel value="byLawSchool" control={<Radio size="small" />} label="Law School" />
                </RadioGroup>
              )}

              {chartType === 'licenseDistribution' && (
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
                    label="Admission Decade"
                  />

                  <FormControlLabel value="byLawSchool" control={<Radio size="small" />} label="Law School" />
                </RadioGroup>
              )}

              {chartType === 'topEmployers' && (
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
                    label="Admission Decade"
                  />

                  <FormControlLabel value="byLawSchool" control={<Radio size="small" />} label="Law School" />
                </RadioGroup>
              )}
            </FormControl>
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
