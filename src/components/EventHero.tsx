import type { PublicEvent } from '../types'
import babyWhale from '../assets/carousel/destiny_baby.png'

export default function EventHero({ event, formattedDate }: { event: PublicEvent; formattedDate: string }) {
  return (
    <section className="hero ocean-hero" aria-labelledby="event-title">
      <div className="ocean-hero-layout">
        <div className="hero-content">
          <p className="eyebrow">TOGETHER IS A BEAUTIFUL PLACE TO BE</p>
          <h1 id="event-title">{event.combined_title}</h1>
          <div className="occasion-list">
            {event.occasion_labels.map((label) => <span key={label}>{label}</span>)}
          </div>
          <p className="hero-date">{formattedDate}</p>
          <p className="ocean-hero-caption">A DAY MADE FOR MAKING MEMORIES</p>
        </div>
        <div className={`ocean-hero-art${event.cover_image_url ? ' has-event-cover' : ''}`}>
          <img src={event.cover_image_url || babyWhale} alt={event.cover_image_url ? 'Event cover' : ''}
            width={1264} height={1264} decoding="async" fetchPriority="high" />
        </div>
      </div>
    </section>
  )
}
