<script setup lang="ts">
import type { JobStatus } from '~/types/job'

const props = defineProps<{ status: JobStatus }>()

const styles: Record<JobStatus, string> = {
  wishlist:  'bg-slate-700   text-slate-300  border-slate-600',
  applied:   'bg-blue-900/60 text-blue-300   border-blue-700',
  interview: 'bg-yellow-900/60 text-yellow-300 border-yellow-700',
  offer:     'bg-emerald-900/60 text-emerald-300 border-emerald-700',
  rejected:  'bg-red-900/60  text-red-300    border-red-700',
}

const labels: Record<JobStatus, string> = {
  wishlist:  'Wishlist',
  applied:   'Applied',
  interview: 'Interview',
  offer:     'Offer',
  rejected:  'Rejected',
}
</script>

<template>
  <span
    class="inline-block rounded-full border px-2 py-0.5 text-xs font-medium"
    :class="styles[props.status]"
  >
    {{ labels[props.status] }}
  </span>
</template>
