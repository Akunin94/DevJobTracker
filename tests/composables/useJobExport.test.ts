import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { escapeCell, jobToRow, buildCsv, CSV_HEADERS, useJobExport } from '~/composables/useJobExport'
import type { Job } from '~/types/job'

function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: '1',
    company: 'Acme',
    position: 'Engineer',
    status: 'applied',
    notes: '',
    createdAt: '2024-06-01T10:00:00.000Z',
    updatedAt: '2024-06-02T10:00:00.000Z',
    ...overrides,
  }
}

// ─── Pure CSV logic ───────────────────────────────────────────────────────────

describe('escapeCell', () => {
  it('returns the value as-is when no special chars', () => {
    expect(escapeCell('Google')).toBe('Google')
  })

  it('wraps values containing commas in double quotes', () => {
    expect(escapeCell('Acme, Inc.')).toBe('"Acme, Inc."')
  })

  it('wraps values containing double quotes and escapes them', () => {
    expect(escapeCell('He said "hello"')).toBe('"He said ""hello"""')
  })

  it('wraps values containing newlines in double quotes', () => {
    expect(escapeCell('line1\nline2')).toBe('"line1\nline2"')
  })

  it('returns empty string for undefined', () => {
    expect(escapeCell(undefined)).toBe('')
  })

  it('returns empty string for empty string', () => {
    expect(escapeCell('')).toBe('')
  })
})

describe('jobToRow', () => {
  it('produces a comma-separated row with all fields', () => {
    const job = makeJob({ company: 'Stripe', position: 'Staff Eng', status: 'interview', salary: '$200k' })
    const row = jobToRow(job)
    expect(row).toContain('Stripe')
    expect(row).toContain('Staff Eng')
    expect(row).toContain('interview')
    expect(row).toContain('$200k')
  })

  it('truncates ISO timestamps to YYYY-MM-DD for Added and Updated', () => {
    const row = jobToRow(makeJob())
    expect(row).toContain('2024-06-01')
    expect(row).toContain('2024-06-02')
    expect(row).not.toContain('T10:00:00')
  })

  it('leaves optional fields empty when undefined', () => {
    const row = jobToRow(makeJob({ salary: undefined, url: undefined, deadline: undefined }))
    const cells = row.split(',')
    // salary is index 3, url is index 4, deadline is index 5
    expect(cells[3]).toBe('')
    expect(cells[4]).toBe('')
    expect(cells[5]).toBe('')
  })
})

describe('buildCsv', () => {
  it('first line is the header row', () => {
    const csv = buildCsv([])
    expect(csv.split('\n')[0]).toBe(CSV_HEADERS.join(','))
  })

  it('produces N+1 lines for N jobs (header + data rows)', () => {
    const csv = buildCsv([makeJob(), makeJob({ id: '2' })])
    expect(csv.split('\n')).toHaveLength(3)
  })

  it('produces only the header line for an empty jobs array', () => {
    const csv = buildCsv([])
    expect(csv.split('\n')).toHaveLength(1)
  })
})

// ─── Browser trigger (download anchor) ───────────────────────────────────────

describe('useJobExport — download trigger', () => {
  let anchor: HTMLAnchorElement
  const clickSpy = vi.fn()
  const revokeObjectURL = vi.fn()

  beforeEach(() => {
    anchor = document.createElement('a')
    vi.spyOn(anchor, 'click').mockImplementation(clickSpy)
    vi.spyOn(document, 'createElement').mockReturnValue(anchor as any)
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock')
    globalThis.URL.revokeObjectURL = revokeObjectURL
  })

  afterEach(() => {
    vi.restoreAllMocks()
    clickSpy.mockClear()
    revokeObjectURL.mockClear()
  })

  it('clicks the anchor to trigger download', () => {
    const { exportToCsv } = useJobExport()
    exportToCsv([makeJob()])
    expect(clickSpy).toHaveBeenCalledOnce()
  })

  it('sets filename with today\'s date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-15'))
    const { exportToCsv } = useJobExport()
    exportToCsv([makeJob()])
    expect(anchor.download).toBe('jobs-2024-06-15.csv')
    vi.useRealTimers()
  })

  it('revokes the object URL after download', () => {
    const { exportToCsv } = useJobExport()
    exportToCsv([makeJob()])
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock')
  })
})
