import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import test from 'node:test'
import ts from 'typescript'
const transpile = path => ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
const countdownUrl = `data:text/javascript;base64,${Buffer.from(transpile('../src/eventCountdown.ts')).toString('base64')}`
const source = transpile('../src/eventPresentation.ts').replace("'./eventCountdown'", JSON.stringify(countdownUrl))
const { countdownTarget, eventStops, deadlineDate } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
const event = { event_date: '2027-01-09', timezone: 'Asia/Manila', start_time: '15:00', end_time: '17:00', occasion_labels: ['Birthday'], venue_name: 'Legacy venue', rsvp_deadline: '2027-01-08T16:30:00Z' }
test('countdown uses earliest occasion, not legacy time or array order', () => {
 assert.equal(countdownTarget({ ...event, event_stops: [{ start_time: '11:30' }, { start_time: '10:00' }] }), Date.parse('2027-01-09T02:00:00Z'))
 assert.equal(countdownTarget({ ...event, event_stops: [{ start_time: null }] }), null)
 assert.equal(countdownTarget(event), Date.parse('2027-01-09T07:00:00Z'))
})
test('legacy venues and saved occasion names remain paired', () => {
 assert.equal(eventStops(event)[0].name, 'Legacy venue')
 assert.equal(eventStops({ ...event, event_stops: [{ label: 'Christening', venue_name: 'Church' }, { label: 'Birthday', venue_name: 'Restaurant' }] })[1].name, 'Restaurant')
})
test('deadline stays on the event local calendar date', () => {
 assert.equal(deadlineDate(event), 'January 9, 2027')
})
