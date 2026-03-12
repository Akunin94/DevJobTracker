<script setup lang="ts">
import draggable from 'vuedraggable'
import { JOB_STATUSES } from '~/types/job'
import type { Job, JobStatus } from '~/types/job'
import { useJobsStore } from '~/stores/jobs'

const props = defineProps<{
  filteredByStatus: (status: JobStatus) => Job[]
  loading?: boolean
}>()

const emit = defineEmits<{
  edit: [job: Job]
  delete: [id: string]
}>()

const store = useJobsStore()

function handleMove(id: string, status: JobStatus) {
  store.moveJob(id, status)
}

function onDrop(colStatus: JobStatus, evt: { added?: { element: Job }; removed?: unknown }) {
  if (evt.added) {
    store.moveJob(evt.added.element.id, colStatus)
  }
}

const colStyles: Record<string, { dot: string; count: string; drag: string }> = {
  wishlist:  { dot: 'bg-slate-400',   count: 'bg-slate-800 text-slate-300',         drag: 'border-slate-400/40' },
  applied:   { dot: 'bg-blue-400',    count: 'bg-blue-900/60 text-blue-300',         drag: 'border-blue-400/40' },
  interview: { dot: 'bg-yellow-400',  count: 'bg-yellow-900/60 text-yellow-300',     drag: 'border-yellow-400/40' },
  offer:     { dot: 'bg-emerald-400', count: 'bg-emerald-900/60 text-emerald-300',   drag: 'border-emerald-400/40' },
  rejected:  { dot: 'bg-red-400',     count: 'bg-red-900/60 text-red-300',           drag: 'border-red-400/40' },
}
</script>

<template>
  <div class="flex gap-3 overflow-x-auto pb-4 sm:grid sm:grid-cols-5 sm:overflow-visible sm:gap-4">
    <div
      v-for="col in JOB_STATUSES"
      :key="col.value"
      class="flex w-60 shrink-0 flex-col rounded-xl border border-white/10 bg-slate-900/60 p-3 sm:w-auto sm:p-4"
    >
      <!-- Column header -->
      <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="h-2 w-2 rounded-full" :class="colStyles[col.value].dot" />
          <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-200">{{ col.label }}</h2>
        </div>
        <span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="colStyles[col.value].count">
          {{ props.filteredByStatus(col.value).length }}
        </span>
      </div>

      <!-- Skeleton while loading -->
      <div v-if="props.loading" class="flex flex-col gap-2.5">
        <JobCardSkeleton v-for="n in 3" :key="n" />
      </div>

      <!-- Cards -->
      <draggable
        v-else
        :model-value="props.filteredByStatus(col.value)"
        group="jobs"
        item-key="id"
        class="flex flex-1 flex-col gap-2.5"
        ghost-class="opacity-30"
        drag-class="rotate-1 scale-105"
        :class="{ [colStyles[col.value].drag]: true }"
        @change="onDrop(col.value, $event)"
      >
        <template #item="{ element: job }">
          <JobCard
            :job="job"
            @edit="emit('edit', job)"
            @delete="emit('delete', job.id)"
            @move="handleMove(job.id, $event)"
          />
        </template>
        <template #footer>
          <div
            v-if="props.filteredByStatus(col.value).length === 0"
            class="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/10 py-10 text-center"
          >
            <span class="mb-1 text-2xl">· · ·</span>
            <p class="text-xs text-slate-500">No jobs here yet</p>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>
