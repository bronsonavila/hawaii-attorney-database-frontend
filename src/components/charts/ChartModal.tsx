import { AttorneysByYearChart } from './AttorneysByYearChart'
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Modal,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent
} from '@mui/material'
import {
  calculateAttorneysByYearAndType,
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
  rows: Row[]
}

export type AttorneysViewType = 'total' | 'byLicenseType' | 'byLawSchool'
export type ChartType = 'attorneysByYearAndType' | 'licenseDistribution' | 'topEmployers'
export type LicenseDistributionViewType = 'total' | 'byLawSchool' | 'byAdmissionDecade'
export type TopEmployersViewType = 'total' | 'byLawSchool' | 'byAdmissionDecade'

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
        return calculateTopEmployers(rows, topEmployersViewType)

      default:
        return []
    }
  }, [chartType, rows, attorneysViewType, licenseDistributionViewType, topEmployersViewType])

  const chartElement = useMemo(() => {
    switch (chartType) {
      case 'attorneysByYearAndType':
        return <AttorneysByYearChart data={data} rows={rows} viewType={attorneysViewType} />

      case 'licenseDistribution':
        return <LicenseDistributionChart data={data} rows={rows} viewType={licenseDistributionViewType} />

      case 'topEmployers':
        return <TopEmployersChart data={data} viewType={topEmployersViewType} />

      default:
        return null
    }
  }, [chartType, data, attorneysViewType, licenseDistributionViewType, topEmployersViewType, rows])

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
          <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
            <FormControl sx={{ width: 400 }}>
              <InputLabel id="chart-type-label">Chart</InputLabel>

              <Select
                label="Chart"
                labelId="chart-type-label"
                onChange={handleChartTypeChange}
                size="small"
                value={chartType}
              >
                <MenuItem value="attorneysByYearAndType">Attorneys by Admission Year</MenuItem>

                <MenuItem value="licenseDistribution">License Type Distribution</MenuItem>

                <MenuItem value="topEmployers">Top 25 Employers (Non-Government)</MenuItem>
              </Select>
            </FormControl>

            <FormControl component="fieldset" sx={{ ml: 4 }}>
              {chartType === 'attorneysByYearAndType' && (
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
                    label="By Admission Decade"
                  />

                  <FormControlLabel value="byLawSchool" control={<Radio size="small" />} label="By Law School" />
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
                    label="By Admission Decade"
                  />

                  <FormControlLabel value="byLawSchool" control={<Radio size="small" />} label="By Law School" />
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
