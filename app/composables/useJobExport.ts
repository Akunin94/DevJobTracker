import type { Job } from '~/types/job'

export const CSV_HEADERS = ['Company', 'Position', 'Status', 'Salary', 'URL', 'Deadline', 'Notes', 'Added', 'Updated']

export function escapeCell(value: string | undefined): string {
  const s = value ?? ''
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function jobToRow(job: Job): string {
  return [
    job.company,
    job.position,
    job.status,
    job.salary,
    job.url,
    job.deadline,
    job.notes,
    job.createdAt.slice(0, 10),
    job.updatedAt.slice(0, 10),
  ].map(escapeCell).join(',')
}

export function buildCsv(jobs: Job[]): string {
  return [CSV_HEADERS.join(','), ...jobs.map(jobToRow)].join('\n')
}

export function useJobExport() {
  function exportToCsv(jobs: Job[]) {
    const csv = buildCsv(jobs)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `jobs-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return { exportToCsv }
}
