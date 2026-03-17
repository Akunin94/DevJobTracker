import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getDeadlineInfo } from '~/utils/deadline'

// Pin "today" to 2024-06-15 for all tests
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2024-06-15T10:00:00'))
})
afterEach(() => vi.useRealTimers())

describe('getDeadlineInfo', () => {
  it('returns null for undefined deadline', () => {
    expect(getDeadlineInfo(undefined)).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(getDeadlineInfo('')).toBeNull()
  })

  it('marks a past deadline as overdue', () => {
    const info = getDeadlineInfo('2024-06-10')
    expect(info).not.toBeNull()
    expect(info!.overdue).toBe(true)
    expect(info!.urgent).toBe(true)
    expect(info!.text).toBe('5d overdue')
  })

  it('marks yesterday as 1d overdue', () => {
    const info = getDeadlineInfo('2024-06-14')
    expect(info!.overdue).toBe(true)
    expect(info!.text).toBe('1d overdue')
  })

  it('marks today as urgent and not overdue', () => {
    const info = getDeadlineInfo('2024-06-15')
    expect(info!.overdue).toBe(false)
    expect(info!.urgent).toBe(true)
    expect(info!.text).toBe('Today')
  })

  it('marks tomorrow as urgent (1 day left)', () => {
    const info = getDeadlineInfo('2024-06-16')
    expect(info!.overdue).toBe(false)
    expect(info!.urgent).toBe(true)
    expect(info!.text).toBe('1d left')
  })

  it('marks deadline 3 days away as urgent', () => {
    const info = getDeadlineInfo('2024-06-18')
    expect(info!.overdue).toBe(false)
    expect(info!.urgent).toBe(true)
    expect(info!.text).toBe('3d left')
  })

  it('marks deadline 4 days away as not urgent', () => {
    const info = getDeadlineInfo('2024-06-19')
    expect(info!.overdue).toBe(false)
    expect(info!.urgent).toBe(false)
    expect(info!.text).toBe('4d left')
  })

  it('marks a far-future deadline as not urgent', () => {
    const info = getDeadlineInfo('2024-07-15')
    expect(info!.overdue).toBe(false)
    expect(info!.urgent).toBe(false)
    expect(info!.text).toBe('30d left')
  })

  it('includes a human-readable label', () => {
    const info = getDeadlineInfo('2024-06-15')
    expect(info!.label).toBe('Jun 15')
  })
})
