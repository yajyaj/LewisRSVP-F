import { useCallback, useEffect, useRef, useState } from 'react'
import type { BabyPhoto } from './BabyPhotoCarousel'

// Selection commits only after loading; stale requests never replace newer ones.
export function usePhotoTransition(photos: readonly BabyPhoto[], reducedMotion: boolean, viewerOpen: boolean) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [request, setRequest] = useState({ index: 0, manual: false, version: 0 })
  const requestedIndex = useRef(0)
  const [outgoing, setOutgoing] = useState<BabyPhoto | null>(null)
  const [error, setError] = useState('')
  const [announcement, setAnnouncement] = useState('')
  const selectedIndex = photos.length ? activeIndex % photos.length : 0

  const select = useCallback((index: number, manual = true) => {
    if (!photos.length) return
    const wrapped = ((index % photos.length) + photos.length) % photos.length
    requestedIndex.current = wrapped
    setRequest((previous) => ({ index: wrapped, manual, version: previous.version + 1 }))
    setError('')
  }, [photos.length])

  useEffect(() => {
    setOutgoing(null)
    setError('')
    setActiveIndex((index) => photos.length ? index % photos.length : 0)
    requestedIndex.current = selectedIndex
    setRequest((previous) => ({ index: selectedIndex, manual: false, version: previous.version + 1 }))
  }, [photos])

  useEffect(() => {
    if (!viewerOpen) return
    requestedIndex.current = selectedIndex
    setRequest((previous) => ({ ...previous, index: selectedIndex }))
  }, [viewerOpen, selectedIndex])

  useEffect(() => {
    if (!outgoing) return
    if (reducedMotion || viewerOpen) {
      setOutgoing(null)
      return
    }
    const timer = window.setTimeout(() => setOutgoing(null), 560)
    return () => window.clearTimeout(timer)
  }, [outgoing, reducedMotion, viewerOpen])

  useEffect(() => {
    if (viewerOpen) return
    if (outgoing || !photos.length) return
    const index = request.index % photos.length
    const target = photos[index]
    if (index === selectedIndex) return
    let cancelled = false
    const image = new Image()
    const fail = () => {
      if (!cancelled) setError('This photo could not be loaded. Try another photo or retry.')
    }
    image.onload = async () => {
      try { await image.decode() } catch { /* A loaded image can still be displayed if decode rejects. */ }
      if (cancelled) return
      setOutgoing(reducedMotion ? null : photos[selectedIndex])
      setActiveIndex(index)
      setError('')
      if (request.manual) setAnnouncement(`${target.alt}, photo ${index + 1} of ${photos.length}`)
    }
    image.onerror = fail
    image.src = target.src
    return () => {
      cancelled = true
      image.onload = null
      image.onerror = null
    }
  }, [photos, request, selectedIndex, outgoing, reducedMotion, viewerOpen])

  // Modal navigation is immediate; its own image component handles loading/errors.
  function selectInViewer(index: number) {
    if (!photos.length) return
    const wrapped = ((index % photos.length) + photos.length) % photos.length
    requestedIndex.current = wrapped
    setActiveIndex(wrapped)
  }

  return { selectedIndex, outgoing, error, announcement, requestedIndex, select, selectInViewer,
    finishTransition: () => setOutgoing(null) }
}
