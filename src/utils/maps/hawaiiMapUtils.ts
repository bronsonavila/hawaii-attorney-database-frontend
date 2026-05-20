import { TEAL_NAVY } from '@/constants/colors'

export const RETIREMENT_RISK_BUCKETS = [
  { label: '< 20%', min: 0 },
  { label: '20-39%', min: 20 },
  { label: '40-59%', min: 40 },
  { label: '60-79%', min: 60 },
  { label: '80%+', min: 80 }
]

export const DENSITY_BUCKETS = [
  { label: '< 1.0', min: 0 },
  { label: '1.0-1.9', min: 1 },
  { label: '2.0-2.9', min: 2 },
  { label: '3.0-4.9', min: 3 },
  { label: '5.0+', min: 5 }
]

export const getRetirementRiskBucketIndex = (percentOver60: number): number => {
  if (percentOver60 >= 80) return 4
  if (percentOver60 >= 60) return 3
  if (percentOver60 >= 40) return 2
  if (percentOver60 >= 20) return 1
  return 0
}

/**
 * Maps the percentage of attorneys over 60 to a sequential choropleth color.
 */
export const getColorForRetirementRisk = (percentOver60: number): string => {
  if (percentOver60 >= 80) return TEAL_NAVY[5][4]
  if (percentOver60 >= 60) return TEAL_NAVY[5][3]
  if (percentOver60 >= 40) return TEAL_NAVY[5][2]
  if (percentOver60 >= 20) return TEAL_NAVY[5][1]

  return TEAL_NAVY[5][0]
}

export const getDensityBucketIndex = (attorneysPer1kPopulation: number): number => {
  if (attorneysPer1kPopulation >= 5) return 4
  if (attorneysPer1kPopulation >= 3) return 3
  if (attorneysPer1kPopulation >= 2) return 2
  if (attorneysPer1kPopulation >= 1) return 1
  return 0
}

/**
 * Maps the ratio of attorneys per 1k population to a density color (TEAL_NAVY).
 */
export const getColorForDensity = (attorneysPer1kPopulation: number): string => {
  if (attorneysPer1kPopulation >= 5) return TEAL_NAVY[5][4]
  if (attorneysPer1kPopulation >= 3) return TEAL_NAVY[5][3]
  if (attorneysPer1kPopulation >= 2) return TEAL_NAVY[5][2]
  if (attorneysPer1kPopulation >= 1) return TEAL_NAVY[5][1]

  return TEAL_NAVY[5][0]
}

/**
 * Maps the ratio of attorneys per 1k population to a high-contrast text color
 * corresponding to the teal-navy choropleth for use on white backgrounds.
 */
export const getTextColorForDensity = (attorneysPer1kPopulation: number): string => {
  if (attorneysPer1kPopulation >= 5) return '#161f63'
  if (attorneysPer1kPopulation >= 3) return '#264992'
  if (attorneysPer1kPopulation >= 2) return '#25628a'
  if (attorneysPer1kPopulation >= 1) return '#1c798f'
  return '#3a8a65'
}

/**
 * Maps the percentage of attorneys over 60 to a high-contrast text color
 * corresponding to the teal-navy choropleth for use on white backgrounds.
 */
export const getTextColorForRetirementRisk = (percentOver60: number): string => {
  if (percentOver60 >= 80) return '#161f63'
  if (percentOver60 >= 60) return '#264992'
  if (percentOver60 >= 40) return '#25628a'
  if (percentOver60 >= 20) return '#1c798f'
  return '#3a8a65'
}
