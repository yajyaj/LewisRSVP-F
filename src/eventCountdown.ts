/** Resolve an event's wall-clock time without assuming the visitor's timezone.
 * Missing/invalid times and DST gaps have no target; DST overlaps use the earlier instant.
 */
export function eventStartTimestamp(date: string, time: string | null, timezone: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !time || !/^\d{2}:\d{2}(:\d{2})?$/.test(time) || !timezone) return null
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute, second = 0] = time.split(':').map(Number)
  if (year < 100 || month < 1 || month > 12 || day < 1 || hour > 23 || minute > 59 || second > 59) return null
  const wallTime = Date.UTC(year, month - 1, day, hour, minute, second)
  const calendar = new Date(wallTime)
  if (calendar.getUTCFullYear() !== year || calendar.getUTCMonth() !== month - 1 || calendar.getUTCDate() !== day) return null
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone, calendar: 'gregory', numberingSystem: 'latn', hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
    const localTimestamp = (instant: number) => {
      const parts = Object.fromEntries(formatter.formatToParts(instant).map((part) => [part.type, part.value]))
      return Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute), Number(parts.second))
    }
    const candidates = new Set<number>()
    // Sample both sides of nearby timezone changes, including half-hour DST shifts.
    for (let hours = -36; hours <= 36; hours += 6) {
      const probe = wallTime + hours * 3600000
      candidates.add(wallTime - (localTimestamp(probe) - probe))
    }
    const matches = [...candidates].filter((candidate) => localTimestamp(candidate) === wallTime)
    return matches.length ? Math.min(...matches) : null
  } catch {
    return null
  }
}

export function countdownParts(remaining: number) {
  const seconds = Math.max(0, Math.ceil(remaining / 1000))
  return { days: Math.floor(seconds / 86400), hours: Math.floor(seconds % 86400 / 3600),
    minutes: Math.floor(seconds % 3600 / 60), seconds: seconds % 60, isComplete: seconds === 0 }
}
