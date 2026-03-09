import { defineStore } from 'pinia'
import type { Job, JobStatus, JobFormData } from '~/types/job'

const STORAGE_KEY = 'devjobtracker:jobs'

export const useJobsStore = defineStore('jobs', () => {
  const jobs = ref<Job[]>([])

  // Load from localStorage on init
  if (import.meta.client) {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        jobs.value = JSON.parse(stored)
      } catch {
        jobs.value = []
      }
    }
  }

  // Persist to localStorage on every change
  watch(jobs, val => {
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    }
  }, { deep: true })

  const jobsByStatus = computed(() =>
    (status: JobStatus) => jobs.value.filter(j => j.status === status)
  )

  function addJob(data: JobFormData) {
    const now = new Date().toISOString()
    jobs.value.push({
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    })
  }

  function updateJob(id: string, patch: Partial<JobFormData>) {
    const job = jobs.value.find(j => j.id === id)
    if (!job) return
    Object.assign(job, patch, { updatedAt: new Date().toISOString() })
  }

  function deleteJob(id: string) {
    jobs.value = jobs.value.filter(j => j.id !== id)
  }

  function moveJob(id: string, status: JobStatus) {
    updateJob(id, { status })
  }

  return { jobs, jobsByStatus, addJob, updateJob, deleteJob, moveJob }
})
