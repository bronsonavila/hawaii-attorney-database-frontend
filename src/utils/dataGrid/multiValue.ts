import { getGridSingleSelectOperators } from '@mui/x-data-grid-pro'
import type { GridFilterModel, GridFilterOperator } from '@mui/x-data-grid-pro'
import type { Row } from '../../types/row'

// Uses a dropdown like singleSelect but matches if the cell's multi-value content contains the selected value.
// Note: This currently operates on the joined string returned by the column's valueGetter.
export const getMultiValueFilterOperators = (): GridFilterOperator<Row, string>[] => {
  const singleSelectOperators = getGridSingleSelectOperators()

  return singleSelectOperators.map(operator => ({
    ...operator,
    getApplyFilterFn: (filterItem, column) => {
      if (!filterItem.value) return null

      const filterValue = String(filterItem.value)

      // "is" operator: check if any value in the array matches
      if (operator.value === 'is') {
        return (cellValue: string) => {
          if (!cellValue) return false

          const values = cellValue.split('; ').map(value => value.trim())

          return values.some(value => value.toLowerCase() === filterValue.toLowerCase())
        }
      }

      // "not" operator: check if no value in the array matches
      if (operator.value === 'not') {
        return (cellValue: string) => {
          if (!cellValue) return true

          const values = cellValue.split('; ').map(value => value.trim())

          return !values.some(value => value.toLowerCase() === filterValue.toLowerCase())
        }
      }

      // "isAnyOf" operator: check if any value in the array matches any filter value
      if (operator.value === 'isAnyOf') {
        const filterValues = Array.isArray(filterItem.value)
          ? filterItem.value.map((value: string) => value.toLowerCase())
          : [filterValue.toLowerCase()]

        return (cellValue: string) => {
          if (!cellValue) return false

          const values = cellValue.split('; ').map(value => value.trim().toLowerCase())

          return values.some(value => filterValues.includes(value))
        }
      }

      // Fallback to original operator
      return singleSelectOperators.find(op => op.value === operator.value)?.getApplyFilterFn(filterItem, column) ?? null
    }
  }))
}

// Reorder values for display based on active filter. When filtering with "is" or "isAnyOf",
// move the filtered value(s) to the front so the visible chip matches what the user filtered for.
export const getValuesForDisplay = (values: string[], filterModel: GridFilterModel, field: string): string[] => {
  if (values.length <= 1) return values

  const activeFilter = filterModel.items.find(item => item.field === field)

  if (!activeFilter || !activeFilter.value) return values

  const operator = activeFilter.operator

  if (operator === 'is') {
    const filterValue = String(activeFilter.value).toLowerCase()
    const matchIndex = values.findIndex(value => value.toLowerCase() === filterValue)

    if (matchIndex > 0) {
      const reordered = [...values]
      const [matched] = reordered.splice(matchIndex, 1)

      return [matched, ...reordered]
    }
  }

  if (operator === 'isAnyOf' && Array.isArray(activeFilter.value)) {
    const filterValues = activeFilter.value.map((value: string) => value.toLowerCase())

    const matched: string[] = []
    const unmatched: string[] = []

    // First, find matches in the order they appear in the filter selection
    for (const filterValue of filterValues) {
      const matchIndex = values.findIndex(
        value => value.toLowerCase() === filterValue && !matched.some(m => m.toLowerCase() === filterValue)
      )

      if (matchIndex !== -1) {
        matched.push(values[matchIndex])
      }
    }

    // Then add unmatched values
    for (const value of values) {
      if (!matched.some(m => m.toLowerCase() === value.toLowerCase())) {
        unmatched.push(value)
      }
    }

    if (matched.length > 0) {
      return [...matched, ...unmatched]
    }
  }

  return values
}

export const compareMultiValueCells = (_a: unknown, _b: unknown, aRow: string[], bRow: string[]): number => {
  const aFirst = aRow[0] || ''
  const bFirst = bRow[0] || ''

  const firstCompare = aFirst.localeCompare(bFirst, undefined, { sensitivity: 'base' })
  if (firstCompare !== 0) return firstCompare

  const aCount = aRow.length
  const bCount = bRow.length

  if (aCount !== bCount) return aCount - bCount

  return aRow.join('; ').localeCompare(bRow.join('; '), undefined, { sensitivity: 'base' })
}
