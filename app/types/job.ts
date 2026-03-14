export type JobStatus = 'wishlist' | 'applied' | 'interview' | 'offer' | 'rejected'

export interface Job {
  id: string
  company: string
  position: string
  url?: string
  salary?: string
  status: JobStatus
  notes: string
  deadline?: string  // ISO date YYYY-MM-DD
  createdAt: string
  updatedAt: string
}

export type JobFormData = Omit<Job, 'id' | 'createdAt' | 'updatedAt'>

export const JOB_STATUSES: { value: JobStatus; label: string; color: string }[] = [
  { value: 'wishlist',  label: 'Wishlist',   color: 'gray'   },
  { value: 'applied',   label: 'Applied',    color: 'blue'   },
  { value: 'interview', label: 'Interview',  color: 'yellow' },
  { value: 'offer',     label: 'Offer',      color: 'green'  },
  { value: 'rejected',  label: 'Rejected',   color: 'red'    },
]
