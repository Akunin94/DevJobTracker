<script setup lang="ts">
import { JOB_STATUSES } from '~/types/job'
import type { Job, JobStatus } from '~/types/job'
import { useRelativeTime } from '~/composables/useRelativeTime'
import { getDeadlineInfo } from '~/utils/deadline'

const { relativeTime } = useRelativeTime()

const props = defineProps<{ job: Job }>()
const emit = defineEmits<{
  edit: []
  delete: []
  move: [status: JobStatus]
}>()

const confirming = ref(false)
const movingOpen = ref(false)

const deadlineInfo = computed(() => getDeadlineInfo(props.job.deadline))

const otherStatuses = computed(() =>
  JOB_STATUSES.filter(s => s.value !== props.job.status)
)

const dotColor: Record<string, string> = {
  wishlist:  'bg-slate-400',
  applied:   'bg-blue-400',
  interview: 'bg-yellow-400',
  offer:     'bg-emerald-400',
  rejected:  'bg-red-400',
}

function confirmDelete() {
  confirming.value = true
}

function cancelDelete() {
  confirming.value = false
}

function doDelete() {
  emit('delete')
}

function moveTo(status: JobStatus) {
  movingOpen.value = false
  emit('move', status)
}
</script>

<template>
  <div
    class="group relative cursor-grab rounded-lg border p-3.5 transition-all hover:bg-slate-800 active:cursor-grabbing"
    :class="deadlineInfo?.overdue
      ? 'border-red-500/40 bg-red-950/30 hover:border-red-500/60'
      : 'border-white/10 bg-slate-800/80 hover:border-white/20'"
  >
    <!-- Company + position -->
    <NuxtLink :to="`/jobs/${job.id}`" class="block truncate text-sm font-semibold text-white hover:text-blue-300 transition-colors">{{ job.company }}</NuxtLink>
    <p class="mt-0.5 truncate text-xs text-slate-400">{{ job.position }}</p>

    <!-- Salary -->
    <p v-if="job.salary" class="mt-2 text-xs font-medium text-emerald-400">{{ job.salary }}</p>

    <!-- Deadline -->
    <div v-if="deadlineInfo" class="mt-2 flex items-center gap-1.5">
      <svg class="h-3 w-3 shrink-0" :class="deadlineInfo.overdue ? 'text-red-400' : deadlineInfo.urgent ? 'text-amber-400' : 'text-slate-500'" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 6v6l4 2"/>
      </svg>
      <span class="text-xs" :class="deadlineInfo.overdue ? 'text-red-400 font-medium' : deadlineInfo.urgent ? 'text-amber-400' : 'text-slate-500'">
        {{ deadlineInfo.label }} · {{ deadlineInfo.text }}
      </span>
    </div>

    <!-- Move picker (inline, replaces footer) -->
    <div v-if="movingOpen" class="mt-3">
      <div class="mb-1.5 flex items-center justify-between">
        <span class="text-xs text-slate-500">Move to</span>
        <button class="text-xs text-slate-500 hover:text-white transition-colors" @click="movingOpen = false">✕</button>
      </div>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="s in otherStatuses"
          :key="s.value"
          class="flex items-center gap-1.5 rounded-md border border-white/10 bg-slate-700/60 px-2 py-1 text-xs text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
          @click="moveTo(s.value)"
        >
          <span class="h-1.5 w-1.5 shrink-0 rounded-full" :class="dotColor[s.value]" />
          {{ s.label }}
        </button>
      </div>
    </div>

    <!-- Footer -->
    <div v-else class="mt-3 flex items-center justify-between">
      <span class="text-xs text-slate-500" :title="new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })">
        {{ new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
        <span class="text-slate-600">· {{ relativeTime(job.createdAt) }}</span>
      </span>

      <!-- Normal actions (always visible on mobile, hover-only on desktop) -->
      <div v-if="!confirming" class="flex items-center gap-2 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
        <button
          class="text-xs text-slate-400 hover:text-white transition-colors"
          @click="movingOpen = true"
        >
          Move
        </button>
        <span class="text-slate-600">·</span>
        <button
          class="text-xs text-slate-400 hover:text-white transition-colors"
          @click="emit('edit')"
        >
          Edit
        </button>
        <span class="text-slate-600">·</span>
        <button
          class="text-xs text-slate-400 hover:text-red-400 transition-colors"
          @click="confirmDelete"
        >
          Delete
        </button>
      </div>

      <!-- Confirm delete -->
      <div v-else class="flex items-center gap-2">
        <span class="text-xs text-slate-400">Sure?</span>
        <button
          class="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
          @click="doDelete"
        >
          Yes
        </button>
        <button
          class="text-xs text-slate-400 hover:text-white transition-colors"
          @click="cancelDelete"
        >
          No
        </button>
      </div>
    </div>
  </div>
</template>
