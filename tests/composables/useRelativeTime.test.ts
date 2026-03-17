import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useRelativeTime } from '~/composables/useRelativeTime'

const BASE = new Date('2024-06-15T12:00:00.000Z')

describe('useRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(BASE)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const { relativeTime } = useRelativeTime()

  it('returns "just now" for 0 seconds ago', () => {
    expect(relativeTime(BASE.toISOString())).toBe('just now')
  })

  it('returns "just now" for 59 seconds ago', () => {
    const t = new Date(BASE.getTime() - 59_000)
    expect(relativeTime(t.toISOString())).toBe('just now')
  })

  it('returns "1m ago" for exactly 1 minute ago', () => {
    const t = new Date(BASE.getTime() - 60_000)
    expect(relativeTime(t.toISOString())).toBe('1m ago')
  })

  it('returns "45m ago" for 45 minutes ago', () => {
    const t = new Date(BASE.getTime() - 45 * 60_000)
    expect(relativeTime(t.toISOString())).toBe('45m ago')
  })

  it('returns "1h ago" for exactly 1 hour ago', () => {
    const t = new Date(BASE.getTime() - 3_600_000)
    expect(relativeTime(t.toISOString())).toBe('1h ago')
  })

  it('returns "23h ago" for 23 hours ago', () => {
    const t = new Date(BASE.getTime() - 23 * 3_600_000)
    expect(relativeTime(t.toISOString())).toBe('23h ago')
  })

  it('returns "1d ago" for exactly 1 day ago', () => {
    const t = new Date(BASE.getTime() - 86_400_000)
    expect(relativeTime(t.toISOString())).toBe('1d ago')
  })

  it('returns "6d ago" for 6 days ago', () => {
    const t = new Date(BASE.getTime() - 6 * 86_400_000)
    expect(relativeTime(t.toISOString())).toBe('6d ago')
  })

  it('returns "1w ago" for exactly 7 days ago', () => {
    const t = new Date(BASE.getTime() - 7 * 86_400_000)
    expect(relativeTime(t.toISOString())).toBe('1w ago')
  })

  it('returns "4w ago" for 28 days ago', () => {
    const t = new Date(BASE.getTime() - 28 * 86_400_000)
    expect(relativeTime(t.toISOString())).toBe('4w ago')
  })

  it('returns "1mo ago" for 35 days ago', () => {
    const t = new Date(BASE.getTime() - 35 * 86_400_000)
    expect(relativeTime(t.toISOString())).toBe('1mo ago')
  })

  it('returns "3mo ago" for 90 days ago', () => {
    const t = new Date(BASE.getTime() - 90 * 86_400_000)
    expect(relativeTime(t.toISOString())).toBe('3mo ago')
  })
})
