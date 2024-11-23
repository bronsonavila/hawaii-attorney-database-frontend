export enum ChartTestId {
  BAR_ADMISSIONS_BY_LAW_SCHOOL = 'bar-admissions-by-law-school-chart',
  BAR_ADMISSIONS_BY_LICENSE_TYPE = 'bar-admissions-by-license-type-chart',
  BAR_ADMISSIONS_TOTAL = 'bar-admissions-total-chart',
  LICENSE_DISTRIBUTION_BY_ADMISSION_DATE = 'license-distribution-by-admission-date-chart',
  LICENSE_DISTRIBUTION_BY_LAW_SCHOOL = 'license-distribution-by-law-school-chart',
  LICENSE_DISTRIBUTION_TOTAL = 'license-distribution-total-chart',
  TOP_EMPLOYERS_BY_ADMISSION_DATE = 'top-employers-by-admission-date-chart',
  TOP_EMPLOYERS_BY_LAW_SCHOOL = 'top-employers-by-law-school-chart',
  TOP_EMPLOYERS_TOTAL = 'top-employers-total-chart'
}

export enum ChartType {
  BAR_ADMISSIONS = 'barAdmissions',
  LICENSE_DISTRIBUTION = 'licenseDistribution',
  TOP_EMPLOYERS = 'topEmployers'
}

export enum ViewType {
  TOTAL = 'total',
  BY_LAW_SCHOOL = 'byLawSchool',
  BY_ADMISSION_DATE = 'byAdmissionDate',
  BY_LICENSE_TYPE = 'byLicenseType'
}
