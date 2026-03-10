import type { Job, JobStatus } from '~/types/job'

export function useJobFilters(jobs: Ref<Job[]>) {
  const query = ref('')

  const filtered = computed(() => {
    const q = query.value.trim().toLowerCase()
    if (!q) return jobs.value
    return jobs.value.filter(j =>
      j.company.toLowerCase().includes(q) ||
      j.position.toLowerCase().includes(q)
    )
  })

  function filteredByStatus(status: JobStatus) {
    return filtered.value.filter(j => j.status === status)
  }

  return { query, filteredByStatus }
}
