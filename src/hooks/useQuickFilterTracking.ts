import { debounce } from '@mui/material'
import { useCallback, useEffect, useRef } from 'react'
import posthog from 'posthog-js'

export const useQuickFilterTracking = () => {
  const quickFilterRef = useRef<HTMLDivElement>(null)
  const lastFilterValueRef = useRef<string>('')

  const debouncedPosthogCapture = useCallback(
    debounce((value: string) => {
      if (value && value !== lastFilterValueRef.current) {
        posthog.capture('quick_filter_used', { filter_value: value })

        lastFilterValueRef.current = value
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
          const newValue = inputElement.value

          debouncedPosthogCapture(newValue)
        }
      }
    })

    const inputElement = quickFilterRef.current.querySelector('input')

    if (inputElement) observer.observe(inputElement, { attributes: true, attributeFilter: ['value'] })

    return () => {
      observer.disconnect()

      debouncedPosthogCapture.clear()
    }
  }, [debouncedPosthogCapture])

  return quickFilterRef
}
