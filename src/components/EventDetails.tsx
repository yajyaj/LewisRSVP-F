import type { PublicEvent } from '../types'
import type { CSSProperties } from 'react'
import type { CelebrationStop } from '../eventVenues'
import { stopTime, venueLinks } from '../eventVenues'

interface EventDetailsProps {
  event: PublicEvent
  date: string
  stops: CelebrationStop[]
}

export default function EventDetails({ event, date, stops }: EventDetailsProps) {
  return (
    <section className="details-section ocean-details" aria-labelledby="details-heading">
      <div className="details-intro">
        <p className="eyebrow">SAVE THE DATE</p>
        <h2 id="details-heading">All the little details</h2>
        <p>One joyful gathering, shared with the people we love.</p>
      </div>
      <div className="detail-grid ocean-detail-grid" style={{ '--detail-rows': stops.length + 2 } as CSSProperties}>
        <article className="detail-card ocean-detail-card">
          <DetailIcon kind="date" />
          <h3>Date</h3>
          <p><time dateTime={event.event_date}>{date}</time></p>
        </article>
        <article className="detail-card ocean-detail-card">
          <DetailIcon kind="venue" />
          <h3>{stops.length > 1 ? 'Venues' : 'Venue'}</h3>
          {stops.map((stop) => <div className="detail-stop" key={stop.label}>
            {stops.length > 1 && <h4>{stop.label}</h4>}
            <p className="detail-primary">{stop.name || 'Venue to be announced'}</p>
            <p>{stop.address || 'We will share the location soon.'}</p>
            {venueLinks(stop).search && <a className="text-link" href={venueLinks(stop).search!} target="_blank" rel="noreferrer" aria-label={`Open map for ${stop.label}`}>Open map <span aria-hidden="true">↗</span></a>}
          </div>)}
        </article>
        <article className="detail-card ocean-detail-card">
          <DetailIcon kind="time" />
          <h3>Time</h3>
          {stops.map((stop, index) => <div className="detail-stop" key={stop.label}>
            {stops.length > 1 && <h4>{stop.label}</h4>}
            <p>{stopTime(stop)}</p>
            {index === stops.length - 1 && event.timezone && <p>{event.timezone.replaceAll('_', ' ')}</p>}
          </div>)}
        </article>
      </div>
      {event.cover_image_url && <img className="cover-image" src={event.cover_image_url} alt="Event cover" loading="lazy" decoding="async" />}
      {event.gallery_urls.length > 0 && <div className="gallery">{event.gallery_urls.map((url) => <img key={url} src={url} alt="A moment from the celebration" loading="lazy" decoding="async" />)}</div>}
    </section>
  )
}

function DetailIcon({ kind }: { kind: 'date' | 'venue' | 'time' }) {
  return (
    <span className="ocean-detail-symbol" aria-hidden="true">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" focusable="false">
        {kind === 'date' && <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v4m10-4v4M3 11h18m-13 4h2m4 0h2m-8 3h2" /></>}
        {kind === 'venue' && <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>}
        {kind === 'time' && <><circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 2" /></>}
      </svg>
    </span>
  )
}
