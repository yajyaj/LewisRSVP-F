import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import test from 'node:test'
import ts from 'typescript'

const source = readFileSync(new URL('../src/eventCountdown.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } })
const { eventStartTimestamp: start, countdownParts } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)

test('uses event timezone and seconds, independent of visitor timezone', () => {
  assert.equal(start('2027-01-09', '11:30', 'Asia/Manila'), Date.parse('2027-01-09T03:30:00Z'))
  assert.equal(start('2027-06-12', '11:30', 'Asia/Manila'), Date.parse('2027-06-12T03:30:00Z'))
  assert.equal(start('2027-06-12', '11:30:45', 'Asia/Singapore'), Date.parse('2027-06-12T03:30:45Z'))
  assert.equal(start('2027-06-12', '00:00', 'Asia/Kathmandu'), Date.parse('2027-06-11T18:15:00Z'))
})
test('handles daylight saving offsets, gaps, and overlaps', () => {
  assert.equal(start('2027-01-12', '11:30', 'America/New_York'), Date.parse('2027-01-12T16:30:00Z'))
  assert.equal(start('2027-06-12', '11:30', 'America/New_York'), Date.parse('2027-06-12T15:30:00Z'))
  assert.equal(start('2027-03-14', '02:30', 'America/New_York'), null)
  assert.equal(start('2027-11-07', '01:30', 'America/New_York'), Date.parse('2027-11-07T05:30:00Z'))
})
test('rejects missing and invalid event data instead of inventing a target', () => {
  for (const args of [['2027-06-12', null, 'UTC'], ['2027-02-29', '12:00', 'UTC'], ['2027-06-12', '24:00', 'UTC'],
    ['2027-06-12', '12:60', 'UTC'], ['2027-06-12', '12:00', 'Invalid/Zone'], ['bad', '12:00', 'UTC']]) {
    assert.equal(start(...args), null)
  }
  assert.equal(start('2028-02-29', '12:00', 'UTC'), Date.parse('2028-02-29T12:00:00Z'))
})
test('countdown handles rollover, fractional seconds, and expiration', () => {
  assert.deepEqual(countdownParts(90061000), { days: 1, hours: 1, minutes: 1, seconds: 1, isComplete: false })
  assert.equal(countdownParts(1).isComplete, false)
  assert.deepEqual(countdownParts(-1000), { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true })
})
