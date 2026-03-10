<script setup lang="ts">
import { useJobsStore } from '~/stores/jobs'

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

const notes = ref(job.value?.notes ?? '')

watch(() => job.value?.notes, val => {
  if (val !== undefined) notes.value = val
})

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function onNotesInput() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (job.value) store.updateJob(job.value.id, { notes: notes.value })
  }, 600)
}

const saved = ref(false)

watch(notes, () => {
  saved.value = false
})

function onNotesSaved() {
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}

// Show "Saved" indicator after debounce settles
let saveIndicatorTimer: ReturnType<typeof setTimeout> | null = null
function onNotesInputWithIndicator() {
  onNotesInput()
  saved.value = false
  if (saveIndicatorTimer) clearTimeout(saveIndicatorTimer)
  saveIndicatorTimer = setTimeout(() => { saved.value = true; setTimeout(() => { saved.value = false }, 1500) }, 700)
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
</script>

<template>
  <div v-if="job" class="min-h-screen bg-slate-950 text-white">
    <!-- Header -->
    <header class="border-b border-slate-800 bg-slate-900 px-6 py-3.5">
      <div class="mx-auto flex max-w-3xl items-center gap-3">
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
        <span class="text-sm text-slate-200 truncate">{{ job.company }}</span>
      </div>
    </header>

    <!-- Content -->
    <main class="mx-auto max-w-3xl px-6 py-8">
      <!-- Title row -->
      <div class="mb-6">
        <div class="mb-2 flex items-center gap-3">
          <StatusBadge :status="job.status" />
          <span v-if="job.salary" class="text-sm font-medium text-emerald-400">{{ job.salary }}</span>
        </div>
        <h1 class="text-2xl font-bold text-white">{{ job.position }}</h1>
        <p class="mt-1 text-base text-slate-400">{{ job.company }}</p>
      </div>

      <!-- Meta -->
      <div class="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div v-if="job.url" class="rounded-lg border border-white/10 bg-slate-900 p-3">
          <p class="mb-1 text-xs text-slate-500">Link</p>
          <a
            :href="job.url"
            target="_blank"
            rel="noopener noreferrer"
            class="truncate text-sm text-blue-400 hover:text-blue-300 transition-colors"
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
          @input="onNotesInputWithIndicator"
        />
      </div>
    </main>
  </div>
</template>
