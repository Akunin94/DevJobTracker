<script setup lang="ts">
import { toast } from 'vue-sonner'
import { useJobsStore } from '~/stores/jobs'
import { useJobFilters } from '~/composables/useJobFilters'
import type { Job, JobFormData } from '~/types/job'

useHead({ title: 'Dev Job Tracker' })

const store = useJobsStore()

if (import.meta.client) {
  await store.fetchJobs()
}
const { query, filteredByStatus } = useJobFilters(toRef(store, 'jobs'))

const showForm = ref(false)
const editingJob = ref<Job | null>(null)

function openAdd() {
  editingJob.value = null
  showForm.value = true
}

function openEdit(job: Job) {
  editingJob.value = job
  showForm.value = true
}

function handleSubmit(data: JobFormData) {
  if (editingJob.value) {
    store.updateJob(editingJob.value.id, data)
    toast.success('Job updated')
  } else {
    store.addJob(data)
    toast.success('Job added')
  }
  showForm.value = false
}

function handleDelete(id: string) {
  store.deleteJob(id)
  toast.error('Job deleted')
}

// Keyboard shortcut: N = new job (ignore when typing in inputs)
onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
    if (e.key === 'n' || e.key === 'N') openAdd()
  }
  window.addEventListener('keydown', handler)
  onUnmounted(() => window.removeEventListener('keydown', handler))
})
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-white">
    <!-- Top nav -->
    <header class="border-b border-slate-800 bg-slate-900 px-4 py-3 sm:px-6 sm:py-3.5">
      <div class="mx-auto flex max-w-screen-2xl flex-wrap items-center gap-3">
        <!-- Logo -->
        <div class="flex items-center gap-2.5">
          <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-500 text-xs font-bold leading-none">
            DT
          </div>
          <span class="text-base font-semibold text-white">Dev Job Tracker</span>
        </div>

        <!-- Search -->
        <div class="relative flex-1 min-w-[160px] sm:max-w-xs">
          <svg class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path stroke-linecap="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input
            v-model="query"
            type="search"
            placeholder="Search jobs…"
            class="w-full rounded-lg border border-white/10 bg-slate-800 py-1.5 pl-8 pr-3 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
          />
        </div>

        <!-- Right side -->
        <div class="flex items-center gap-4 ml-auto">
          <span class="hidden text-sm text-slate-500 sm:block">
            <span class="font-semibold text-slate-200">{{ store.jobs.length }}</span> jobs
          </span>
          <button
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 active:bg-blue-700 transition-colors"
            @click="openAdd"
          >
            + Add Job
          </button>
        </div>
      </div>
    </header>

    <!-- Board -->
    <main class="mx-auto max-w-screen-2xl p-4 sm:p-6">
      <KanbanBoard :filtered-by-status="filteredByStatus" @edit="openEdit" @delete="handleDelete" />
    </main>

    <!-- Modal -->
    <JobForm
      v-if="showForm"
      :job="editingJob ?? undefined"
      @submit="handleSubmit"
      @close="showForm = false"
    />
  </div>
</template>
