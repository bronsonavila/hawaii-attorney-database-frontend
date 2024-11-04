import { BarAdmissionsChart } from './BarAdmissionsChart'
import {
  BarAdmissionsViewType,
  ChartType,
  LicenseDistributionViewType,
  TopEmployersViewType
} from '../../types/chartTypes'
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
import { calculateBarAdmissions, calculateLicenseDistribution, calculateTopEmployers } from '../../utils/chartUtils'
import { FC, useMemo, useState } from 'react'
import { LicenseDistributionChart } from './LicenseDistributionChart'
import { Row } from '../../App'
import { TopEmployersChart } from './TopEmployersChart'

interface ChartModalProps {
  isOpen: boolean
  onClose: () => void
  paletteMode: PaletteMode
  rows: Row[]
}

export const ChartModal: FC<ChartModalProps> = ({ isOpen, onClose, paletteMode, rows }) => {
  const [chartType, setChartType] = useState<ChartType>(ChartType.BAR_ADMISSIONS)

  const [barAdmissionsViewType, setBarAdmissionsViewType] = useState<BarAdmissionsViewType>(BarAdmissionsViewType.TOTAL)
  const [licenseDistributionViewType, setLicenseDistributionViewType] = useState<LicenseDistributionViewType>(
    LicenseDistributionViewType.TOTAL
  )
  const [topEmployersViewType, setTopEmployersViewType] = useState<TopEmployersViewType>(TopEmployersViewType.TOTAL)

  const data = useMemo(() => {
    switch (chartType) {
      case ChartType.BAR_ADMISSIONS:
        return calculateBarAdmissions(rows, barAdmissionsViewType)

      case ChartType.LICENSE_DISTRIBUTION:
        return calculateLicenseDistribution(rows, licenseDistributionViewType)

      case ChartType.TOP_EMPLOYERS:
        return calculateTopEmployers(rows, topEmployersViewType)
    }
  }, [barAdmissionsViewType, chartType, licenseDistributionViewType, rows, topEmployersViewType])

  const chartElement = useMemo(() => {
    switch (chartType) {
      case ChartType.BAR_ADMISSIONS:
        return <BarAdmissionsChart data={data} rows={rows} viewType={barAdmissionsViewType} />

      case ChartType.LICENSE_DISTRIBUTION:
        return <LicenseDistributionChart data={data} rows={rows} viewType={licenseDistributionViewType} />

      case ChartType.TOP_EMPLOYERS:
        return <TopEmployersChart data={data} viewType={topEmployersViewType} />
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
          <Box sx={{ alignItems: 'end', display: 'flex', gap: 4 }}>
            <FormControl sx={{ width: 360 }}>
              <FormLabel sx={{ fontSize: 12, mb: 1 }}>Select Chart</FormLabel>

              <Select onChange={handleChartTypeChange} size="small" value={chartType}>
                <MenuItem value={ChartType.BAR_ADMISSIONS}>Bar Admissions Over Time</MenuItem>

                <MenuItem value={ChartType.LICENSE_DISTRIBUTION}>License Type Distribution</MenuItem>

                <MenuItem value={ChartType.TOP_EMPLOYERS}>Top 25 Employers (Non-Government)</MenuItem>
              </Select>
            </FormControl>

            <FormControl component="fieldset" sx={{ ml: 4, pb: '1px' }}>
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

              {chartType === ChartType.BAR_ADMISSIONS && (
                <RadioGroup
                  onChange={event => setBarAdmissionsViewType(event.target.value as BarAdmissionsViewType)}
                  row
                  sx={{ gap: 2 }}
                  value={barAdmissionsViewType}
                >
                  <FormControlLabel
                    value={BarAdmissionsViewType.TOTAL}
                    control={<Radio size="small" />}
                    label="Total Count"
                  />

                  <FormControlLabel
                    value={BarAdmissionsViewType.BY_LICENSE_TYPE}
                    control={<Radio size="small" />}
                    label="License Type"
                  />

                  <FormControlLabel
                    value={BarAdmissionsViewType.BY_LAW_SCHOOL}
                    control={<Radio size="small" />}
                    label="Law School"
                  />
                </RadioGroup>
              )}

              {chartType === ChartType.LICENSE_DISTRIBUTION && (
                <RadioGroup
                  onChange={event => setLicenseDistributionViewType(event.target.value as LicenseDistributionViewType)}
                  row
                  sx={{ gap: 2 }}
                  value={licenseDistributionViewType}
                >
                  <FormControlLabel
                    value={LicenseDistributionViewType.TOTAL}
                    control={<Radio size="small" />}
                    label="Total Count"
                  />

                  <FormControlLabel
                    value={LicenseDistributionViewType.BY_ADMISSION_DATE}
                    control={<Radio size="small" />}
                    label="Admission Date"
                  />

                  <FormControlLabel
                    value={LicenseDistributionViewType.BY_LAW_SCHOOL}
                    control={<Radio size="small" />}
                    label="Law School"
                  />
                </RadioGroup>
              )}

              {chartType === ChartType.TOP_EMPLOYERS && (
                <RadioGroup
                  onChange={event => setTopEmployersViewType(event.target.value as TopEmployersViewType)}
                  row
                  sx={{ gap: 2 }}
                  value={topEmployersViewType}
                >
                  <FormControlLabel
                    value={TopEmployersViewType.TOTAL}
                    control={<Radio size="small" />}
                    label="Total Count"
                  />

                  <FormControlLabel
                    value={TopEmployersViewType.BY_ADMISSION_DATE}
                    control={<Radio size="small" />}
                    label="Admission Date"
                  />

                  <FormControlLabel
                    value={TopEmployersViewType.BY_LAW_SCHOOL}
                    control={<Radio size="small" />}
                    label="Law School"
                  />
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
