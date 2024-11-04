import { Row } from '../../src/App'
import fs from 'fs'
import Papa from 'papaparse'
import path from 'path'

export const loadTestRows = (): Row[] => {
  const csvPath = path.join(__dirname, '../../public/processed-member-records.csv')
  const csvString = fs.readFileSync(csvPath, 'utf-8')

  const { data } = Papa.parse<Row>(csvString, { header: true })

  return data.filter(row => row.jdNumber) // Omit blank rows.
}
