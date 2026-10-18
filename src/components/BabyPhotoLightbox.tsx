import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { RefObject } from 'react'
import type { BabyPhoto } from './BabyPhotoCarousel'

interface BabyPhotoLightboxProps {
  photos: readonly BabyPhoto[]
  selectedIndex: number
  onSelect: (index: number) => void
  onClose: () => void
  returnFocusRef: RefObject<HTMLButtonElement | null>
}

export default function BabyPhotoLightbox({ photos, selectedIndex, onSelect, onClose, returnFocusRef }: BabyPhotoLightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const backdropPointerDown = useRef(false)
  const titleId = useId()
  const photo = photos[selectedIndex]

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const trigger = returnFocusRef.current
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      if (trigger?.isConnected) trigger.focus({ preventScroll: true })
    }
  }, [returnFocusRef])

  if (!photo) return null

  // Keep the dialog outside invitation-wide positioning and reveal styles.
  return createPortal(
    <dialog
      ref={dialogRef}
      className="baby-lightbox"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onKeyDown={(event) => {
        event.stopPropagation()
        if (event.key === 'Tab') {
          const controls = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'))
          const first = controls[0]
          const last = controls[controls.length - 1]
          if (first && last && ((event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last))) {
            event.preventDefault()
            ;(event.shiftKey ? last : first).focus()
          }
          return
        }
        if (photos.length <= 1) return
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault()
          onSelect(selectedIndex + (event.key === 'ArrowLeft' ? -1 : 1))
        }
      }}
      onPointerDown={(event) => {
        backdropPointerDown.current = event.target === event.currentTarget
      }}
      onClick={(event) => {
        if (backdropPointerDown.current && event.target === event.currentTarget) onClose()
        backdropPointerDown.current = false
      }}
    >
      <div className="baby-lightbox-panel">
        <div className="baby-lightbox-toolbar">
          <h2 id={titleId}>Our Little Ocean Star — photos</h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close photo viewer">✕</button>
        </div>
        <FullPhoto key={photo.src} photo={photo} />
        <div className="baby-lightbox-navigation">
          {photos.length > 1 && (
            <button type="button" onClick={() => onSelect(selectedIndex - 1)} aria-label="Show previous full photo">←</button>
          )}
          <p role="status" aria-atomic="true">Photo {selectedIndex + 1} of {photos.length}</p>
          {photos.length > 1 && (
            <button type="button" onClick={() => onSelect(selectedIndex + 1)} aria-label="Show next full photo">→</button>
          )}
        </div>
      </div>
    </dialog>,
    document.body,
  )
}

function FullPhoto({ photo }: { photo: BabyPhoto }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  return (
    <div className="baby-lightbox-image-area" aria-busy={status === 'loading'}>
      {status !== 'error' && (
        <img
          src={photo.src}
          alt={photo.alt}
          decoding="async"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}
      {status === 'loading' && <p className="baby-lightbox-message" role="status">Loading photo…</p>}
      {status === 'error' && <p className="baby-lightbox-message" role="status">This photo could not be loaded. You can browse other photos or close the viewer.</p>}
    </div>
  )
}
