<script setup lang="ts">
import { JOB_STATUSES } from '~/types/job'
import { useJobsStore } from '~/stores/jobs'

const store = useJobsStore()

const colStyles: Record<string, { dot: string; count: string }> = {
  wishlist:  { dot: 'bg-slate-400',  count: 'bg-slate-800  text-slate-300' },
  applied:   { dot: 'bg-blue-400',   count: 'bg-blue-900/60  text-blue-300' },
  interview: { dot: 'bg-yellow-400', count: 'bg-yellow-900/60 text-yellow-300' },
  offer:     { dot: 'bg-emerald-400',count: 'bg-emerald-900/60 text-emerald-300' },
  rejected:  { dot: 'bg-red-400',    count: 'bg-red-900/60  text-red-300' },
}
</script>

<template>
  <div class="flex gap-4 overflow-x-auto pb-4">
    <div
      v-for="col in JOB_STATUSES"
      :key="col.value"
      class="flex w-72 shrink-0 flex-col rounded-xl border border-white/10 bg-slate-900/60 p-4"
    >
      <!-- Column header -->
      <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="h-2 w-2 rounded-full" :class="colStyles[col.value].dot" />
          <h2 class="text-sm font-semibold text-slate-200 uppercase tracking-wider">{{ col.label }}</h2>
        </div>
        <span
          class="rounded-full px-2 py-0.5 text-xs font-semibold"
          :class="colStyles[col.value].count"
        >
          {{ store.jobsByStatus(col.value).length }}
        </span>
      </div>

      <!-- Cards -->
      <div class="flex flex-col gap-2.5">
        <JobCard
          v-for="job in store.jobsByStatus(col.value)"
          :key="job.id"
          :job="job"
        />

        <!-- Empty state -->
        <div
          v-if="store.jobsByStatus(col.value).length === 0"
          class="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/10 py-10 text-center"
        >
          <span class="text-2xl mb-1">·  ·  ·</span>
          <p class="text-xs text-slate-500">No jobs here yet</p>
        </div>
      </div>
    </div>
  </div>
</template>
