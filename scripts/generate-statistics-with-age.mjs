import fs from 'node:fs/promises'
import path from 'node:path'
import Papa from 'papaparse'

const projectRoot = path.resolve(import.meta.dirname, '..')
const inputPath = path.join(projectRoot, 'logs', 'member-statistics-report--5-15-26.csv')
const outputPath = path.join(projectRoot, 'logs', 'member-statistics-with-age.csv')

// Month-level age as of 2026-05-15.
const asOfYear = 2026
const asOfMonth = 5

function parseMonthYear(dobValue) {
  if (dobValue === null || dobValue === undefined) {
    return null
  }

  const trimmed = String(dobValue).trim()
  if (!trimmed) {
    return null
  }

  const match = trimmed.match(/^(\d{1,2})\/(\d{4})$/)
  if (!match) {
    return null
  }

  const month = Number.parseInt(match[1], 10)
  const year = Number.parseInt(match[2], 10)

  if (month < 1 || month > 12 || year < 1800 || year > asOfYear) {
    return null
  }

  return { month, year }
}

function calculateAgeFromMonthYear(dobValue) {
  const parsed = parseMonthYear(dobValue)
  if (!parsed) {
    return ''
  }

  let age = asOfYear - parsed.year
  if (parsed.month > asOfMonth) {
    age -= 1
  }

  if (age < 0 || age > 130) {
    return ''
  }

  return String(age)
}

function parseCsv(text, inputName) {
  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: true
  })

  if (result.errors.length > 0) {
    const firstError = result.errors[0]
    throw new Error(`Failed parsing ${inputName}: ${firstError.message}`)
  }

  return {
    rows: result.data,
    fields: result.meta.fields ?? []
  }
}

async function main() {
  const statisticsCsv = await fs.readFile(inputPath, 'utf8')
  const { rows, fields } = parseCsv(statisticsCsv, 'statistics report')

  const outputFields = [...fields, 'age']

  let matchedAges = 0
  let blankAges = 0

  const outputRows = rows.map(row => {
    const age = calculateAgeFromMonthYear(row.DOB)

    if (age) {
      matchedAges += 1
    } else {
      blankAges += 1
    }

    return {
      ...row,
      age
    }
  })

  const outputCsv = Papa.unparse(outputRows, {
    columns: outputFields,
    newline: '\n'
  })

  await fs.writeFile(outputPath, `${outputCsv}\n`, 'utf8')

  console.log('Generated member statistics with age successfully.')
  console.log(`Output file: ${outputPath}`)
  console.log(`Total output rows: ${outputRows.length}`)
  console.log(`Matched ages: ${matchedAges}`)
  console.log(`Blank ages: ${blankAges}`)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
