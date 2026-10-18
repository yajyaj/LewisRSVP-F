import { useEffect, useRef } from 'react'
import treasure from '../assets/images/underwater/treasure-chest.webp'

export default function RsvpSuccess({ message, onChange }: { message: string; onChange: () => void }) {
  const confirmation = useRef<HTMLDivElement>(null)
  useEffect(() => { confirmation.current?.focus({ preventScroll: true }) }, [])
  return (
    <div className="success-message ocean-rsvp-success" ref={confirmation} tabIndex={-1} role="status">
      <img src={treasure} alt="" width={1536} height={1024} decoding="async" />
      <p>{message}</p>
      <small>You can submit again later to update your response.</small>
      <button type="button" className="text-link" onClick={onChange}>Change my response</button>
    </div>
  )
}
