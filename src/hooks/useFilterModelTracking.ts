import { debounce } from '@mui/material'
import { format } from 'date-fns'
import { GridFilterModel } from '@mui/x-data-grid-pro'
import { useCallback, useRef } from 'react'
import * as Sentry from '@sentry/react'

interface FilterItem {
  field: string
  operator: string
  value: unknown
}

const formatTitleValue = (value: unknown): string =>
  value instanceof Date
    ? format(value, 'MM/dd/yyyy')
    : Array.isArray(value)
    ? value.map(formatTitleValue).join(', ')
    : String(value).toLowerCase()

const formatValue = (value: unknown): unknown =>
  value instanceof Date ? format(value, 'MM/dd/yyyy') : typeof value === 'string' ? value.toLowerCase() : value

export const useFilterModelTracking = () => {
  const filterHistoryRef = useRef<Set<string>>(new Set())

  const debouncedSentryCapture = useCallback(
    debounce((items: FilterItem[]) => {
      items.forEach(item => {
        const { field, operator, value } = item

        if (!value && operator !== 'isEmpty' && operator !== 'isNotEmpty') return

        let extraData: { field: string; operator: string; value?: unknown }
        let filterDetails: string

        if (value) {
          const sentryFormattedValue = formatValue(value)
          const titleFormattedValue = formatTitleValue(value)

          extraData = { field, operator, value: sentryFormattedValue }
          filterDetails = `${field} ${operator} ${titleFormattedValue}`
        } else {
          // Special case for isEmpty and isNotEmpty operators.
          extraData = { field, operator }
          filterDetails = `${field} ${operator}`
        }

        if (!filterHistoryRef.current.has(filterDetails)) {
          const title = `Filter: ${filterDetails}`

          Sentry.captureMessage(title, { extra: extraData, tags: { type: 'filter' } })

          filterHistoryRef.current.add(filterDetails)
        }
      })
    }, 5000),
    []
  )

  const handleFilterModelChange = useCallback(
    (model: GridFilterModel) => {
      const { items } = model

      if (items.length > 0) {
        const filteredItems = items.map(({ field, operator, value }) => ({ field, operator, value }))

        debouncedSentryCapture(filteredItems)
      }
    },
    [debouncedSentryCapture]
  )

  return handleFilterModelChange
}
