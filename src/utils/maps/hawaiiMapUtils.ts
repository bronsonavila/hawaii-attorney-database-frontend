import { RETIREMENT_RISK_PALETTE } from '@/constants/colors'

export const RETIREMENT_RISK_BUCKETS = [
  { label: '< 20%', min: 0 },
  { label: '20-30%', min: 20 },
  { label: '30-40%', min: 30 },
  { label: '40-50%', min: 40 },
  { label: '50-60%', min: 50 },
  { label: '60%+', min: 60 }
]

/**
 * Maps the percentage of attorneys over 60 to a heat color (RETIREMENT_RISK_PALETTE).
 * 0 is pale green (low risk), 5 is deep red (high risk).
 */
export const getColorForRetirementRisk = (percentOver60: number): string => {
  if (percentOver60 >= 60) return RETIREMENT_RISK_PALETTE[5]
  if (percentOver60 >= 50) return RETIREMENT_RISK_PALETTE[4]
  if (percentOver60 >= 40) return RETIREMENT_RISK_PALETTE[3]
  if (percentOver60 >= 30) return RETIREMENT_RISK_PALETTE[2]
  if (percentOver60 >= 20) return RETIREMENT_RISK_PALETTE[1]

  return RETIREMENT_RISK_PALETTE[0]
}

/**
 * Maps the percentage of attorneys over 60 to a high-contrast text color
 * corresponding to the background hue (Green, Yellow, Red) for use on white backgrounds.
 */
export const getTextColorForRetirementRisk = (percentOver60: number): string => {
  if (percentOver60 >= 50) return '#b71c1c' // Dark Red for Red backgrounds
  if (percentOver60 >= 40) return '#c84e00' // Dark Orange for Orange backgrounds
  if (percentOver60 >= 30) return '#8c6b00' // Dark Goldenrod for Yellow backgrounds
  return '#2e7d32' // Dark Green for Green backgrounds
}
