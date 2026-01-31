import type { Row } from '@/types/row'

export interface HsbaCsvRow {
  first_name?: string
  last_name?: string
  full_name?: string
  organization?: string
  licenses?: string
  membership_section?: string
  membership_status?: string
  id?: string
  jd_number?: string
  email_domain?: string
  law_school?: string
  admitted_hi_bar?: string
  location?: string
  is_missing_from_source?: string
}

export const splitSemicolonList = (value: string | null | undefined): string[] =>
  (value || '')
    .split(';')
    .map(item => item.trim())
    .filter(Boolean)

export const mapHsbaCsvRowToRow = (raw: HsbaCsvRow): Row => ({
  barAdmissionDate: raw.admitted_hi_bar || '',
  emailDomain: raw.email_domain || '',
  employer: raw.organization || '',
  id: raw.id || raw.jd_number || `${raw.full_name || ''}-${raw.organization || ''}`.trim(),
  jdNumber: raw.jd_number || '',
  lawSchool: raw.law_school || '',
  licenseType: raw.membership_status?.trim() || 'Unknown',
  location: raw.location || '',
  membershipSections: splitSemicolonList(raw.membership_section),
  name: raw.full_name || '',
  otherLicenses: splitSemicolonList(raw.licenses),
  isMissingFromSource: raw.is_missing_from_source === 'true'
})
