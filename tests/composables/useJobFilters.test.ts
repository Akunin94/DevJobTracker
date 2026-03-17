import { ref } from 'vue'
import { describe, it, expect } from 'vitest'
import { useJobFilters } from '~/composables/useJobFilters'
import type { Job } from '~/types/job'

function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: crypto.randomUUID(),
    company: 'Acme',
    position: 'Frontend Engineer',
    status: 'applied',
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('useJobFilters', () => {
  it('returns all jobs when query is empty', () => {
    const jobs = ref([makeJob(), makeJob({ company: 'Google' })])
    const { filteredByStatus } = useJobFilters(jobs)
    expect(filteredByStatus('applied')).toHaveLength(2)
  })

  it('returns all jobs when query is only whitespace', () => {
    const jobs = ref([makeJob(), makeJob()])
    const { query, filteredByStatus } = useJobFilters(jobs)
    query.value = '   '
    expect(filteredByStatus('applied')).toHaveLength(2)
  })

  it('filters by company name (case-insensitive)', () => {
    const jobs = ref([
      makeJob({ company: 'Google' }),
      makeJob({ company: 'Meta' }),
      makeJob({ company: 'Stripe' }),
    ])
    const { query, filteredByStatus } = useJobFilters(jobs)
    query.value = 'goo'
    const result = filteredByStatus('applied')
    expect(result).toHaveLength(1)
    expect(result[0].company).toBe('Google')
  })

  it('filters by position (case-insensitive)', () => {
    const jobs = ref([
      makeJob({ position: 'Frontend Engineer' }),
      makeJob({ position: 'Backend Engineer' }),
      makeJob({ position: 'Product Manager' }),
    ])
    const { query, filteredByStatus } = useJobFilters(jobs)
    query.value = 'frontend'
    expect(filteredByStatus('applied')).toHaveLength(1)
  })

  it('matches both company and position in same query', () => {
    const jobs = ref([
      makeJob({ company: 'Netflix', position: 'Staff Engineer' }),
      makeJob({ company: 'Amazon', position: 'Netflix-like Infra' }),
      makeJob({ company: 'Apple', position: 'iOS Engineer' }),
    ])
    const { query, filteredByStatus } = useJobFilters(jobs)
    query.value = 'netflix'
    expect(filteredByStatus('applied')).toHaveLength(2)
  })

  it('filters by status after applying query', () => {
    const jobs = ref([
      makeJob({ company: 'Google', status: 'applied' }),
      makeJob({ company: 'Google', status: 'interview' }),
      makeJob({ company: 'Meta',   status: 'applied' }),
    ])
    const { query, filteredByStatus } = useJobFilters(jobs)
    query.value = 'google'
    expect(filteredByStatus('applied')).toHaveLength(1)
    expect(filteredByStatus('interview')).toHaveLength(1)
    expect(filteredByStatus('offer')).toHaveLength(0)
  })

  it('returns empty array when query matches nothing', () => {
    const jobs = ref([makeJob({ company: 'Google' })])
    const { query, filteredByStatus } = useJobFilters(jobs)
    query.value = 'zzzzz'
    expect(filteredByStatus('applied')).toHaveLength(0)
  })

  it('is reactive — updates when query changes', () => {
    const jobs = ref([
      makeJob({ company: 'Google' }),
      makeJob({ company: 'Apple' }),
    ])
    const { query, filteredByStatus } = useJobFilters(jobs)

    query.value = 'google'
    expect(filteredByStatus('applied')).toHaveLength(1)

    query.value = ''
    expect(filteredByStatus('applied')).toHaveLength(2)
  })

  it('is reactive — updates when jobs list changes', () => {
    const jobs = ref([makeJob({ company: 'Google' })])
    const { query, filteredByStatus } = useJobFilters(jobs)
    query.value = 'google'
    expect(filteredByStatus('applied')).toHaveLength(1)

    jobs.value = [...jobs.value, makeJob({ company: 'Google Maps', status: 'applied' })]
    expect(filteredByStatus('applied')).toHaveLength(2)
  })
})
