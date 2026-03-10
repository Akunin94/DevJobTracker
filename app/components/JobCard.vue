<script setup lang="ts">
import { JOB_STATUSES } from '~/types/job'
import type { Job, JobStatus } from '~/types/job'

const props = defineProps<{ job: Job }>()
const emit = defineEmits<{
  edit: []
  delete: []
  move: [status: JobStatus]
}>()

const confirming = ref(false)
const movingOpen = ref(false)

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
  <div class="group relative rounded-lg border border-white/10 bg-slate-800/80 p-3.5 transition-all hover:border-white/20 hover:bg-slate-800">
    <!-- Company + position -->
    <NuxtLink :to="`/jobs/${job.id}`" class="block truncate text-sm font-semibold text-white hover:text-blue-300 transition-colors">{{ job.company }}</NuxtLink>
    <p class="mt-0.5 truncate text-xs text-slate-400">{{ job.position }}</p>

    <!-- Salary -->
    <p v-if="job.salary" class="mt-2 text-xs font-medium text-emerald-400">{{ job.salary }}</p>

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
      <span class="text-xs text-slate-500">
        {{ new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
      </span>

      <!-- Normal actions (shown on hover) -->
      <div v-if="!confirming" class="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
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
