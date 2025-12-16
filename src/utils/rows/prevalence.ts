export const countByRowPresence = <R>(rows: R[], getValues: (row: R) => string[]): Record<string, number> =>
  rows.reduce((accumulator, row) => {
    const uniqueValues = new Set(getValues(row))

    uniqueValues.forEach(value => {
      accumulator[value] = (accumulator[value] || 0) + 1
    })

    return accumulator
  }, {} as Record<string, number>)

export const sortByPrevalence = (values: string[], counts: Record<string, number>): string[] =>
  [...values].sort((a, b) => {
    const countA = counts[a] || 0
    const countB = counts[b] || 0

    if (countA !== countB) return countB - countA

    return a.localeCompare(b, undefined, { sensitivity: 'base' })
  })
