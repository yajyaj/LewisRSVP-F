export interface CelebrationStop {
  label: string
  name: string | null
  address: string | null
  startsAt: string | null
  endsAt: string | null
  mapUrl: string | null
}

export function venueLinks(stop: CelebrationStop) {
  const destination = [stop.name, stop.address].filter(Boolean).join(', ').trim()
  let map: string | null = null
  try {
    const url = new URL(stop.mapUrl || '')
    if (url.protocol === 'https:' || url.protocol === 'http:') map = url.href
  } catch { /* Fall back only to actual venue information. */ }
  return {
    search: map || (destination ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}` : null),
    directions: destination ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}` : null,
  }
}

export function stopTime(stop: CelebrationStop) {
  return stop.startsAt ? `${stop.startsAt}${stop.endsAt ? ` – ${stop.endsAt}` : ''}`
    : stop.endsAt ? `Ends at ${stop.endsAt}` : 'Time to be announced'
}
