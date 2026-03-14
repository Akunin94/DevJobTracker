import { defineStore } from 'pinia'
import type { Job, JobStatus, JobFormData } from '~/types/job'

// Map Supabase row (snake_case) → Job (camelCase)
function rowToJob(row: Record<string, unknown>): Job {
  return {
    id: row.id as string,
    company: row.company as string,
    position: row.position as string,
    url: (row.url as string) || undefined,
    salary: (row.salary as string) || undefined,
    status: row.status as JobStatus,
    notes: (row.notes as string) ?? '',
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export const useJobsStore = defineStore('jobs', () => {
  const supabase = useSupabaseClient()

  const jobs = ref<Job[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  const jobsByStatus = computed(() =>
    (status: JobStatus) => jobs.value.filter(j => j.status === status)
  )

  async function fetchJobs() {
    loading.value = true
    error.value = null
    const { data, error: err } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) {
      error.value = err.message
    } else {
      jobs.value = (data ?? []).map(rowToJob)
    }
    loading.value = false
  }

  async function subscribeToJobs() {
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    if (!userId) return () => {}

    const channel = supabase
      .channel('jobs-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'jobs', filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newJob = rowToJob(payload.new as Record<string, unknown>)
            if (!jobs.value.find(j => j.id === newJob.id)) {
              jobs.value.unshift(newJob)
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = rowToJob(payload.new as Record<string, unknown>)
            const idx = jobs.value.findIndex(j => j.id === updated.id)
            if (idx !== -1) jobs.value[idx] = updated
          } else if (payload.eventType === 'DELETE') {
            jobs.value = jobs.value.filter(j => j.id !== payload.old.id)
          }
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }

  async function addJob(data: JobFormData) {
    const { data: { session } } = await supabase.auth.getSession()
    const { data: row, error: err } = await supabase
      .from('jobs')
      .insert({
        company: data.company,
        position: data.position,
        url: data.url || null,
        salary: data.salary || null,
        status: data.status,
        notes: data.notes,
        user_id: session?.user?.id ?? null,
      })
      .select()
      .single()
    if (err) { error.value = err.message; return }
    jobs.value.unshift(rowToJob(row))
  }

  async function updateJob(id: string, patch: Partial<JobFormData>) {
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (patch.company !== undefined) update.company = patch.company
    if (patch.position !== undefined) update.position = patch.position
    if (patch.url !== undefined) update.url = patch.url || null
    if (patch.salary !== undefined) update.salary = patch.salary || null
    if (patch.status !== undefined) update.status = patch.status
    if (patch.notes !== undefined) update.notes = patch.notes

    const { data: row, error: err } = await supabase
      .from('jobs')
      .update(update)
      .eq('id', id)
      .select()
      .single()
    if (err) { error.value = err.message; return }
    const idx = jobs.value.findIndex(j => j.id === id)
    if (idx !== -1) jobs.value[idx] = rowToJob(row)
  }

  async function deleteJob(id: string) {
    const { error: err } = await supabase.from('jobs').delete().eq('id', id)
    if (err) { error.value = err.message; return }
    jobs.value = jobs.value.filter(j => j.id !== id)
  }

  async function moveJob(id: string, status: JobStatus) {
    // Optimistic update — move card instantly, revert on error
    const job = jobs.value.find(j => j.id === id)
    const prevStatus = job?.status
    if (job) job.status = status

    const { error: err } = await supabase
      .from('jobs')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (err) {
      error.value = err.message
      if (job && prevStatus) job.status = prevStatus // revert
    }
  }

  return { jobs, loading, error, jobsByStatus, fetchJobs, subscribeToJobs, addJob, updateJob, deleteJob, moveJob }
})
