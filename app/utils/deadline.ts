export interface DeadlineInfo {
  label: string
  text: string
  overdue: boolean
  urgent: boolean
}

export function getDeadlineInfo(deadline: string | undefined): DeadlineInfo | null {
  if (!deadline) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dl = new Date(deadline + 'T00:00:00')
  const diffDays = Math.round((dl.getTime() - today.getTime()) / 86_400_000)
  const label = dl.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (diffDays < 0)  return { label, text: `${Math.abs(diffDays)}d overdue`, overdue: true,  urgent: true  }
  if (diffDays === 0) return { label, text: 'Today',              overdue: false, urgent: true  }
  if (diffDays <= 3)  return { label, text: `${diffDays}d left`,  overdue: false, urgent: true  }
  return                     { label, text: `${diffDays}d left`,  overdue: false, urgent: false }
}
