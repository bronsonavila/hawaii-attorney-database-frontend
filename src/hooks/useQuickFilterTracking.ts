import { captureMessage } from '@sentry/react'
import { debounce } from '@mui/material'
import { useCallback, useEffect, useRef } from 'react'

export const useQuickFilterTracking = () => {
  const quickFilterRef = useRef<HTMLDivElement>(null)
  const quickFilterHistoryRef = useRef<Set<string>>(new Set())

  const debouncedSentryCapture = useCallback(
    debounce((value: string) => {
      if (value && !quickFilterHistoryRef.current.has(value)) {
        captureMessage(`QuickFilter: ${value}`, { extra: { value }, tags: { type: 'quick_filter' } })

        quickFilterHistoryRef.current.add(value)
      }
    }, 5000),
    []
  )

  useEffect(() => {
    if (!quickFilterRef.current) return

    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
          const inputElement = mutation.target as HTMLInputElement
          const newValue = inputElement.value.toLowerCase()

          debouncedSentryCapture(newValue)
        }
      }
    })

    const inputElement = quickFilterRef.current.querySelector('input')

    if (inputElement) observer.observe(inputElement, { attributes: true, attributeFilter: ['value'] })

    return () => {
      observer.disconnect()

      debouncedSentryCapture.clear()
    }
  }, [debouncedSentryCapture])

  return quickFilterRef
}
