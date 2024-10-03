import { debounce } from '@mui/material'
import { GridFilterModel } from '@mui/x-data-grid-pro'
import { useCallback } from 'react'
import { useRef } from 'react'
import posthog from 'posthog-js'

interface FilterItem {
  field: string
  operator: string
  value: any
}

export const useFilterModelTracking = () => {
  const filterHistoryRef = useRef<Set<string>>(new Set())

  const debouncedPosthogCapture = useCallback(
    debounce((items: FilterItem[]) => {
      items.forEach(item => {
        const { field, operator, value } = item

        if (value === undefined && operator !== 'isEmpty' && operator !== 'isNotEmpty') return

        const filterKey = `${field}:${operator}:${value}`

        if (!filterHistoryRef.current.has(filterKey)) {
          posthog.capture('filter_applied', { field, operator, value })

          filterHistoryRef.current.add(filterKey)
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

        debouncedPosthogCapture(filteredItems)
      }
    },
    [debouncedPosthogCapture]
  )

  return handleFilterModelChange
}
