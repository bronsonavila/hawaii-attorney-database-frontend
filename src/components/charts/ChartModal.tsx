import { BarAdmissionsChart } from './BarAdmissionsChart'
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
import { calculateBarAdmissions } from '../../utils/charts/barAdmissionsUtils'
import { calculateLicenseDistribution } from '../../utils/charts/licenseDistributionUtils'
import { calculateTopEmployers } from '../../utils/charts/topEmployersUtils'
import { ChangeEvent, FC, useMemo, useState } from 'react'
import { ChartType, ViewType } from '../../enums/chartEnums'
import { LicenseDistributionChart } from './LicenseDistributionChart'
import { Row } from '../../types/row'
import { TopEmployersChart } from './TopEmployersChart'

// Constants

const FORM_LABEL_SX = { fontSize: 12, mb: 1 }

const MODAL_BOX_SX = {
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  display: { xs: 'none', lg: 'revert' },
  left: '50%',
  position: 'absolute',
  top: '50%',
  transform: 'translate(-50%, -50%)'
}

const VIEW_TYPE_OPTIONS: Record<ChartType, RadioOption[]> = {
  [ChartType.BAR_ADMISSIONS]: [
    { label: 'Total Count', value: ViewType.TOTAL },
    { label: 'License Status', value: ViewType.BY_LICENSE_TYPE },
    { label: 'Law School', value: ViewType.BY_LAW_SCHOOL }
  ],
  [ChartType.LICENSE_DISTRIBUTION]: [
    { label: 'Total Count', value: ViewType.TOTAL },
    { label: 'Admission Date', value: ViewType.BY_ADMISSION_DATE },
    { label: 'Law School', value: ViewType.BY_LAW_SCHOOL }
  ],
  [ChartType.TOP_EMPLOYERS]: [
    { label: 'Total Count', value: ViewType.TOTAL },
    { label: 'Admission Date', value: ViewType.BY_ADMISSION_DATE },
    { label: 'Law School', value: ViewType.BY_LAW_SCHOOL }
  ]
}

// Interfaces

interface ChartModalProps {
  isOpen: boolean
  onClose: () => void
  paletteMode: PaletteMode
  rows: Row[]
}

interface RadioOption {
  label: string
  value: ViewType
}

// Component

export const ChartModal: FC<ChartModalProps> = ({ isOpen, onClose, paletteMode, rows }) => {
  const [chartType, setChartType] = useState<ChartType>(ChartType.BAR_ADMISSIONS)
  const [viewTypes, setViewTypes] = useState<Record<ChartType, ViewType>>({
    [ChartType.BAR_ADMISSIONS]: ViewType.TOTAL,
    [ChartType.LICENSE_DISTRIBUTION]: ViewType.TOTAL,
    [ChartType.TOP_EMPLOYERS]: ViewType.TOTAL
  })

  const chartElement = useMemo(() => {
    const currentViewType = viewTypes[chartType]

    switch (chartType) {
      case ChartType.BAR_ADMISSIONS:
        return (
          <BarAdmissionsChart
            data={calculateBarAdmissions(rows, currentViewType)}
            rows={rows}
            viewType={currentViewType}
          />
        )

      case ChartType.LICENSE_DISTRIBUTION:
        return (
          <LicenseDistributionChart
            data={calculateLicenseDistribution(rows, currentViewType)}
            rows={rows}
            viewType={currentViewType}
          />
        )

      case ChartType.TOP_EMPLOYERS:
        return <TopEmployersChart data={calculateTopEmployers(rows, currentViewType)} viewType={currentViewType} />
    }
  }, [chartType, rows, viewTypes])

  const handleChartTypeChange = (event: SelectChangeEvent<ChartType>) => {
    setChartType(event.target.value as ChartType)
  }

  const handleViewTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setViewTypes(previous => ({ ...previous, [chartType]: event.target.value as ViewType }))
  }

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={MODAL_BOX_SX}>
        <Box sx={{ pt: 4, pl: 4, pr: 6 }}>
          <Box sx={{ alignItems: 'end', display: 'flex', gap: 4 }}>
            <FormControl sx={{ width: 360 }}>
              <FormLabel sx={FORM_LABEL_SX}>Select Chart</FormLabel>

              <Select onChange={handleChartTypeChange} size="small" value={chartType}>
                <MenuItem value={ChartType.BAR_ADMISSIONS}>Bar Admissions Over Time</MenuItem>

                <MenuItem value={ChartType.LICENSE_DISTRIBUTION}>License Status Distribution</MenuItem>

                <MenuItem value={ChartType.TOP_EMPLOYERS}>Top 25 Employers (Non-Government)</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ ml: 4, pb: '1px' }}>
              <FormLabel
                sx={{
                  ...FORM_LABEL_SX,
                  '&.Mui-focused': { color: paletteMode === 'dark' ? '#ffffff99' : '#00000099' }
                }}
              >
                View Attorneys By
              </FormLabel>

              <RadioGroup onChange={handleViewTypeChange} row sx={{ gap: 2 }} value={viewTypes[chartType]}>
                {VIEW_TYPE_OPTIONS[chartType].map(option => (
                  <FormControlLabel
                    control={<Radio size="small" />}
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </RadioGroup>
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
