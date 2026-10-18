import type { CelebrationStop } from '../eventVenues'
import { stopTime, venueLinks } from '../eventVenues'
import coralLeft from '../assets/images/underwater/coral-left.webp'
import coralRight from '../assets/images/underwater/coral-right.webp'

export default function EventVenues({ stops, date, timezone }: { stops: CelebrationStop[]; date: string; timezone: string }) {
  return (
    <section className="venue-section" aria-labelledby="venue-heading">
      <div className="venue-card ocean-venue-card">
        <div className="venue-copy">
          <p className="eyebrow">FIND YOUR WAY TO THE CELEBRATION</p>
          <h2 id="venue-heading">Find Your Way to the Celebration</h2>
          <p className="venue-description">We&rsquo;re gathering with our favorite people, and we hope you&rsquo;ll join us for the day.</p>
        </div>
        <div className="venue-stops">
          {stops.map((stop, index) => {
            const links = venueLinks(stop)
            return (
              <article className="venue-details" key={stop.label} aria-labelledby={`venue-stop-${index}`}>
                <h3 id={`venue-stop-${index}`}>{stop.label}</h3>
                <p className="venue-name">{stop.name || 'Venue to be announced'}</p>
                <p>{stop.address || 'The venue address will be shared soon.'}</p>
                <p>{date} · {stopTime(stop)}{timezone ? ` · ${timezone.replaceAll('_', ' ')}` : ''}</p>
                {(links.search || links.directions) && <div className="maps-actions">
                  {links.search && <a className="button button-light" href={links.search} target="_blank" rel="noreferrer" aria-label={`Open map for ${stop.label}`}>Open Google Maps</a>}
                  {links.directions && <a className="button button-outline" href={links.directions} target="_blank" rel="noreferrer" aria-label={`Get directions to ${stop.label}`}>Get Directions</a>}
                </div>}
              </article>
            )
          })}
        </div>
      </div>
      <div className="section-art-scatter venue-art-scatter" aria-hidden="true">
        <img className="scatter-castle" src={coralLeft} alt="" loading="lazy" decoding="async" width={1254} height={1254} />
        <img className="scatter-corals" src={coralRight} alt="" loading="lazy" decoding="async" width={1254} height={1254} />
      </div>
    </section>
  )
}
