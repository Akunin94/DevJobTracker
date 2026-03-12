<script setup lang="ts">
import { toast } from 'vue-sonner'
import { JOB_STATUSES } from '~/types/job'
import type { JobFormData, JobStatus } from '~/types/job'
import { useJobsStore } from '~/stores/jobs'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const store = useJobsStore()

const job = computed(() => store.jobs.find(j => j.id === route.params.id))

watchEffect(() => {
  if (!job.value) router.replace('/')
})

useHead(() => ({
  title: job.value ? `${job.value.company} — ${job.value.position}` : 'Job Detail',
}))

// Notes autosave
const notes = ref(job.value?.notes ?? '')
watch(() => job.value?.notes, val => { if (val !== undefined) notes.value = val })

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let saveIndicatorTimer: ReturnType<typeof setTimeout> | null = null
const saved = ref(false)

function onNotesInput() {
  saved.value = false
  if (debounceTimer) clearTimeout(debounceTimer)
  if (saveIndicatorTimer) clearTimeout(saveIndicatorTimer)
  debounceTimer = setTimeout(() => {
    if (job.value) store.updateJob(job.value.id, { notes: notes.value })
  }, 600)
  saveIndicatorTimer = setTimeout(() => {
    saved.value = true
    setTimeout(() => { saved.value = false }, 1500)
  }, 700)
}

// Status change
const statusStyles: Record<string, string> = {
  wishlist:  'border-slate-500 bg-slate-700 text-slate-200',
  applied:   'border-blue-500 bg-blue-900/60 text-blue-200',
  interview: 'border-yellow-500 bg-yellow-900/60 text-yellow-200',
  offer:     'border-emerald-500 bg-emerald-900/60 text-emerald-200',
  rejected:  'border-red-500 bg-red-900/60 text-red-200',
}
const statusBase = 'border-white/10 bg-transparent text-slate-500 hover:border-white/20 hover:text-slate-300'

function changeStatus(status: JobStatus) {
  if (!job.value) return
  store.moveJob(job.value.id, status)
  toast.success(`Moved to ${JOB_STATUSES.find(s => s.value === status)?.label}`)
}

// Edit modal
const showEdit = ref(false)

function handleEditSubmit(data: JobFormData) {
  if (!job.value) return
  store.updateJob(job.value.id, data)
  showEdit.value = false
  toast.success('Job updated')
}

// Delete
const confirmingDelete = ref(false)

function handleDelete() {
  if (!job.value) return
  store.deleteJob(job.value.id)
  toast.error('Job deleted')
  router.replace('/')
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
</script>

<template>
  <div v-if="job" class="min-h-screen bg-slate-950 text-white">
    <!-- Header -->
    <header class="border-b border-slate-800 bg-slate-900 px-6 py-3.5">
      <div class="mx-auto flex max-w-3xl items-center justify-between">
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/"
            class="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Board
          </NuxtLink>
          <span class="text-slate-700">/</span>
          <span class="truncate text-sm text-slate-200">{{ job.company }}</span>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <button
            class="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-400 hover:border-white/20 hover:text-white transition-colors"
            @click="showEdit = true"
          >
            Edit
          </button>

          <template v-if="!confirmingDelete">
            <button
              class="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-400 hover:border-red-500/40 hover:text-red-400 transition-colors"
              @click="confirmingDelete = true"
            >
              Delete
            </button>
          </template>
          <template v-else>
            <span class="text-sm text-slate-400">Sure?</span>
            <button
              class="rounded-lg border border-red-500/40 px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              @click="handleDelete"
            >
              Yes, delete
            </button>
            <button
              class="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors"
              @click="confirmingDelete = false"
            >
              Cancel
            </button>
          </template>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="mx-auto max-w-3xl px-6 py-8">
      <!-- Title -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-white">{{ job.position }}</h1>
        <p class="mt-1 text-base text-slate-400">{{ job.company }}</p>
        <p v-if="job.salary" class="mt-1.5 text-sm font-medium text-emerald-400">{{ job.salary }}</p>
      </div>

      <!-- Status selector -->
      <div class="mb-8">
        <p class="mb-2.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="s in JOB_STATUSES"
            :key="s.value"
            class="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
            :class="job.status === s.value ? statusStyles[s.value] : statusBase"
            @click="changeStatus(s.value)"
          >
            {{ s.label }}
          </button>
        </div>
      </div>

      <!-- Meta -->
      <div class="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div v-if="job.url" class="rounded-lg border border-white/10 bg-slate-900 p-3">
          <p class="mb-1 text-xs text-slate-500">Link</p>
          <a
            :href="job.url"
            target="_blank"
            rel="noopener noreferrer"
            class="block truncate text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >{{ job.url }}</a>
        </div>
        <div class="rounded-lg border border-white/10 bg-slate-900 p-3">
          <p class="mb-1 text-xs text-slate-500">Added</p>
          <p class="text-sm text-slate-200">{{ formatDate(job.createdAt) }}</p>
        </div>
        <div class="rounded-lg border border-white/10 bg-slate-900 p-3">
          <p class="mb-1 text-xs text-slate-500">Updated</p>
          <p class="text-sm text-slate-200">{{ formatDate(job.updatedAt) }}</p>
        </div>
      </div>

      <!-- Notes -->
      <div>
        <div class="mb-2 flex items-center justify-between">
          <label class="text-sm font-semibold text-slate-200" for="notes">Notes</label>
          <span
            class="text-xs transition-opacity duration-300"
            :class="saved ? 'text-emerald-400 opacity-100' : 'opacity-0'"
          >Saved</span>
        </div>
        <textarea
          id="notes"
          v-model="notes"
          rows="10"
          placeholder="Interview notes, contacts, next steps…"
          class="w-full resize-y rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
          @input="onNotesInput"
        />
      </div>
    </main>

    <!-- Edit modal -->
    <JobForm
      v-if="showEdit"
      :job="job"
      @submit="handleEditSubmit"
      @close="showEdit = false"
    />
  </div>
</template>
