import Papa from 'papaparse'
import memberStatisticsWithAgeCsv from '../../../logs/member-statistics-with-age.csv?raw'
import {
  SLIDESHOW_ACTIVE_ATTORNEY_AGE_BRACKET_ORDER,
  SLIDESHOW_ACTIVE_ATTORNEY_STATUS_ORDER
} from '@/constants/chartConstants'

type ActiveAttorneyStatus = (typeof SLIDESHOW_ACTIVE_ATTORNEY_STATUS_ORDER)[number]

type AgeBracketLabel = (typeof SLIDESHOW_ACTIVE_ATTORNEY_AGE_BRACKET_ORDER)[number]

const MEMBERSHIP_PLAN_COLUMN = 'Primary Membership ? Plan Name With Level'

interface MemberStatisticsWithAgeRow {
  [MEMBERSHIP_PLAN_COLUMN]?: string
  age?: string
}

export interface ActiveAttorneyAgeBracketRow {
  bracket: AgeBracketLabel
  count: number
  Active: number
  Government: number
  Judge: number
}

const getAgeBracketLabel = (age: number): AgeBracketLabel => {
  if (age >= 80) return '80+'
  if (age >= 70) return '70-79'
  if (age >= 60) return '60-69'
  if (age >= 50) return '50-59'
  if (age >= 40) return '40-49'
  if (age >= 30) return '30-39'

  return 'Under 30'
}

const parseAge = (value: string | undefined): number | null => {
  const trimmedValue = value?.trim() ?? ''
  if (!/^\d+$/.test(trimmedValue)) return null

  const age = Number.parseInt(trimmedValue, 10)
  if (!Number.isFinite(age) || age < 0 || age > 130) return null

  return age
}

const normalizeActiveAttorneyStatus = (planName: string | undefined): ActiveAttorneyStatus | null => {
  const trimmedPlanName = planName?.trim() ?? ''
  if (!trimmedPlanName) return null

  for (const status of SLIDESHOW_ACTIVE_ATTORNEY_STATUS_ORDER) {
    if (trimmedPlanName.startsWith(status)) {
      return status
    }
  }

  return null
}

const createEmptyBracketCounts = (): Record<AgeBracketLabel, ActiveAttorneyAgeBracketRow> =>
  Object.fromEntries(
    SLIDESHOW_ACTIVE_ATTORNEY_AGE_BRACKET_ORDER.map(bracket => [
      bracket,
      {
        bracket,
        count: 0,
        Active: 0,
        Government: 0,
        Judge: 0
      }
    ])
  ) as Record<AgeBracketLabel, ActiveAttorneyAgeBracketRow>

const parseRows = (): MemberStatisticsWithAgeRow[] => {
  const { data, errors } = Papa.parse<MemberStatisticsWithAgeRow>(memberStatisticsWithAgeCsv, {
    header: true,
    skipEmptyLines: 'greedy'
  })

  if (errors.length > 0) {
    throw new Error(`Failed to parse logs/member-statistics-with-age.csv: ${errors[0].message}`)
  }

  return data
}

export const calculateActiveAttorneyAgeBrackets = (): ActiveAttorneyAgeBracketRow[] => {
  const rows = parseRows()
  const countsByBracket = createEmptyBracketCounts()

  rows.forEach(row => {
    const status = normalizeActiveAttorneyStatus(row[MEMBERSHIP_PLAN_COLUMN])
    if (!status) return

    const age = parseAge(row.age)
    if (age === null) return

    const bracket = getAgeBracketLabel(age)
    const bracketCounts = countsByBracket[bracket]
    bracketCounts.count += 1
    bracketCounts[status] += 1
  })

  return SLIDESHOW_ACTIVE_ATTORNEY_AGE_BRACKET_ORDER.map(bracket => countsByBracket[bracket])
}
