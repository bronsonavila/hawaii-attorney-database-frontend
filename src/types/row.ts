export interface Row {
  id: string
  jdNumber: string
  name: string
  licenseType: string
  employer: string
  location: string
  emailDomain: string
  lawSchool: string
  barAdmissionDate: string
  otherLicenses: string[]
  membershipSections: string[]
  isMissingFromSource: boolean
}
