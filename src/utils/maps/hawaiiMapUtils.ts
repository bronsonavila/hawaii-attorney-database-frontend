import { RETIREMENT_RISK_PALETTE, TEAL_NAVY } from '@/constants/colors'

export const RETIREMENT_RISK_BUCKETS = [
  { label: '< 25%', min: 0 },
  { label: '25-49%', min: 25 },
  { label: '50-74%', min: 50 },
  { label: '75%+', min: 75 }
]

export const DENSITY_BUCKETS = [
  { label: '< 1.0', min: 0 },
  { label: '1.0-2.4', min: 1 },
  { label: '2.5-4.4', min: 2.5 },
  { label: '4.5+', min: 4.5 }
]

/**
 * Maps the percentage of attorneys over 60 to a heat color (RETIREMENT_RISK_PALETTE).
 * 0 is green (low risk), 3 is deep red (high risk).
 */
export const getColorForRetirementRisk = (percentOver60: number): string => {
  if (percentOver60 >= 75) return RETIREMENT_RISK_PALETTE[3]
  if (percentOver60 >= 50) return RETIREMENT_RISK_PALETTE[2]
  if (percentOver60 >= 25) return RETIREMENT_RISK_PALETTE[1]

  return RETIREMENT_RISK_PALETTE[0]
}

/**
 * Maps the ratio of attorneys per 1k population to a density color (TEAL_NAVY).
 */
export const getColorForDensity = (attorneysPer1kPopulation: number): string => {
  if (attorneysPer1kPopulation >= 4.5) return TEAL_NAVY[4][3]
  if (attorneysPer1kPopulation >= 2.5) return TEAL_NAVY[4][2]
  if (attorneysPer1kPopulation >= 1) return TEAL_NAVY[4][1]

  return TEAL_NAVY[4][0]
}

/**
 * Maps the percentage of attorneys over 60 to a high-contrast text color
 * corresponding to the background hue (Green, Yellow, Red) for use on white backgrounds.
 */
export const getTextColorForRetirementRisk = (percentOver60: number): string => {
  if (percentOver60 >= 75) return '#b71c1c' // Dark Red for Red backgrounds
  if (percentOver60 >= 50) return '#c84e00' // Dark Orange for Orange backgrounds
  if (percentOver60 >= 25) return '#8c6b00' // Dark Goldenrod for Yellow backgrounds
  return '#2e7d32' // Dark Green for Green backgrounds
}
