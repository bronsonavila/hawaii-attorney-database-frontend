import { countByRowPresence, sortByPrevalence } from '@/utils/rows/prevalence'
import { getUniqueLicenseTypes } from '@/utils/charts/commonUtils'
import { HsbaCsvRow, mapHsbaCsvRowToRow } from '@/utils/rows/hsbaCsv'
import { Row } from '@/types/row'
import { useEffect, useState } from 'react'
import { useLoadingContext } from '@/hooks/useLoadingContext'
import Papa from 'papaparse'

interface AttorneyData {
  rows: Row[]
  licenseTypes: string[]
  membershipSectionOptions: string[]
  otherLicenseOptions: string[]
}

export const useAttorneyData = (): AttorneyData => {
  const { setIsLoading } = useLoadingContext()
  const [rows, setRows] = useState<Row[]>([])
  const [licenseTypes, setLicenseTypes] = useState<string[]>([])
  const [membershipSectionOptions, setMembershipSectionOptions] = useState<string[]>([])
  const [otherLicenseOptions, setOtherLicenseOptions] = useState<string[]>([])

  useEffect(() => {
    fetch('/hsba-member-records.csv')
      .then(response => response.text())
      .then(csvString => {
        const { data: rawRows } = Papa.parse<HsbaCsvRow>(csvString, { header: true, skipEmptyLines: 'greedy' })
        const mappedRows = rawRows
          .filter(row => row && row.jd_number)
          .map(mapHsbaCsvRowToRow)
          .filter(row => row.jdNumber) // Omit blank rows.

        const membershipSectionsCounts = countByRowPresence(mappedRows, row => row.membershipSections)
        const otherLicensesCounts = countByRowPresence(mappedRows, row => row.otherLicenses)

        const sortedRows = mappedRows.map(row => ({
          ...row,
          membershipSections: sortByPrevalence(row.membershipSections, membershipSectionsCounts),
          otherLicenses: sortByPrevalence(row.otherLicenses, otherLicensesCounts)
        }))

        setRows(sortedRows)

        setLicenseTypes(getUniqueLicenseTypes(sortedRows))

        // Populate dropdown options sorted alphabetically
        setMembershipSectionOptions(Object.keys(membershipSectionsCounts).sort((a, b) => a.localeCompare(b)))
        setOtherLicenseOptions(Object.keys(otherLicensesCounts).sort((a, b) => a.localeCompare(b)))
      })
      // Prevent flicker of "Total Rows: 0" on initial load. See: https://github.com/mui/mui-x/issues/12504
      .finally(() => setTimeout(() => setIsLoading(false)))
  }, [setIsLoading])

  return { rows, licenseTypes, membershipSectionOptions, otherLicenseOptions }
}
