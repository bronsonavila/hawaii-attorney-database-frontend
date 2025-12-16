import { useEffect, useId } from 'react'

interface UseSingletonOpenOptions {
  eventName: string // Global event name. When any instance becomes open, it dispatches this event and all other instances close.
  isOpen: boolean // Whether this instance is currently open.
  onClose: () => void // Called when another instance broadcasts that it opened.
}

export const useSingletonOpen = ({ eventName, isOpen, onClose }: UseSingletonOpenOptions) => {
  const instanceId = useId()

  useEffect(() => {
    const handleOpenElsewhere = (event: Event) => {
      const customEvent = event as CustomEvent<{ instanceId?: string }>

      if (!customEvent.detail?.instanceId) return
      if (customEvent.detail.instanceId === instanceId) return

      onClose()
    }

    window.addEventListener(eventName, handleOpenElsewhere as EventListener)

    return () => window.removeEventListener(eventName, handleOpenElsewhere as EventListener)
  }, [eventName, instanceId, onClose])

  useEffect(() => {
    if (!isOpen) return

    window.dispatchEvent(new CustomEvent(eventName, { detail: { instanceId } }))
  }, [eventName, instanceId, isOpen])
}
