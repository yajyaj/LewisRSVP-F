import { useEffect, useMemo, useState } from 'react'
import type { PublicEvent } from '../types'
import { countdownParts, eventStartTimestamp } from '../eventCountdown'

export default function EventCountdown({ event }: { event: PublicEvent }) {
  const target = useMemo(() => eventStartTimestamp(event.event_date, event.start_time, event.timezone),
    [event.event_date, event.start_time, event.timezone])
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    setNow(Date.now())
    if (target === null || target <= Date.now()) return
    const timer = window.setInterval(() => {
      const instant = Date.now()
      setNow(instant)
      if (instant >= target) window.clearInterval(timer)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [target])
  const parts = target === null ? null : countdownParts(target - now)

  return (
    <section className="countdown-section" aria-labelledby="countdown-heading">
      <div className="countdown-shell">
        <p className="eyebrow">THE OCEAN ADVENTURE BEGINS IN…</p>
        <h2 id="countdown-heading">{parts?.isComplete ? 'The celebration has arrived.' : 'The Ocean Adventure Begins In…'}</h2>
        {!parts ? <p className="countdown-celebration">The celebration date is above. A countdown will appear when a valid event start time and timezone are available.</p>
          : parts.isComplete ? <p className="countdown-celebration" role="status">We can&rsquo;t wait to celebrate with you beneath the waves.</p>
          : (
            <div className="countdown-grid" role="timer" aria-live="off" aria-label={`Time until the celebration in ${event.timezone}`}>
              {(['days', 'hours', 'minutes', 'seconds'] as const).map((unit) => (
                <div className="countdown-card" key={unit}>
                  <span>{String(parts[unit]).padStart(2, '0')}</span><small>{unit}</small>
                </div>
              ))}
            </div>
          )}
      </div>
    </section>
  )
}
