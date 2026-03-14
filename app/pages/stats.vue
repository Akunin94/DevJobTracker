<script setup lang="ts">
import { useJobsStore } from '~/stores/jobs'
import { JOB_STATUSES } from '~/types/job'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Stats — Dev Job Tracker' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const store = useJobsStore()

if (import.meta.client && !store.jobs.length) {
  await store.fetchJobs()
}

const total = computed(() => store.jobs.length)

const byStatus = computed(() =>
  JOB_STATUSES.map(s => ({
    ...s,
    count: store.jobs.filter(j => j.status === s.value).length,
    pct: total.value ? Math.round(store.jobs.filter(j => j.status === s.value).length / total.value * 100) : 0,
  }))
)

// Funnel conversion rates
const applied    = computed(() => store.jobs.filter(j => j.status !== 'wishlist').length)
const interviews = computed(() => store.jobs.filter(j => j.status === 'interview' || j.status === 'offer').length)
const offers     = computed(() => store.jobs.filter(j => j.status === 'offer').length)
const rejected   = computed(() => store.jobs.filter(j => j.status === 'rejected').length)

const convRate = (num: number, den: number) =>
  den === 0 ? '—' : `${Math.round(num / den * 100)}%`

// Overdue deadlines
const overdue = computed(() => {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return store.jobs.filter(j => j.deadline && new Date(j.deadline + 'T00:00:00') < today && j.status !== 'rejected').length
})

// Upcoming deadlines (next 7 days)
const upcoming = computed(() => {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const in7 = new Date(today); in7.setDate(in7.getDate() + 7)
  return store.jobs
    .filter(j => {
      if (!j.deadline || j.status === 'rejected') return false
      const dl = new Date(j.deadline + 'T00:00:00')
      return dl >= today && dl <= in7
    })
    .sort((a, b) => a.deadline!.localeCompare(b.deadline!))
})

const statusBarColor: Record<string, string> = {
  wishlist:  'bg-slate-400',
  applied:   'bg-blue-400',
  interview: 'bg-yellow-400',
  offer:     'bg-emerald-400',
  rejected:  'bg-red-400',
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-white">
    <!-- Header -->
    <header class="border-b border-slate-800 bg-slate-900 px-4 py-3 sm:px-6 sm:py-3.5">
      <div class="mx-auto flex max-w-screen-lg items-center gap-4">
        <div class="flex items-center gap-2.5">
          <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-500 text-xs font-bold leading-none">
            DJT
          </div>
          <span class="text-base font-semibold text-white">Dev Job Tracker</span>
        </div>
        <nav class="flex items-center gap-4 ml-4 text-sm">
          <NuxtLink to="/" class="text-slate-400 hover:text-white transition-colors">Board</NuxtLink>
          <NuxtLink to="/stats" class="text-white font-medium">Stats</NuxtLink>
        </nav>
        <div class="ml-auto flex items-center gap-2">
          <img
            v-if="user?.user_metadata?.avatar_url"
            :src="user.user_metadata.avatar_url"
            class="h-7 w-7 rounded-full ring-1 ring-white/20"
          />
          <button
            class="text-xs text-slate-400 hover:text-white transition-colors"
            @click="supabase.auth.signOut().then(() => { navigateTo('/login') })"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-screen-lg p-4 sm:p-6 space-y-6">
      <!-- Summary cards -->
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div class="rounded-xl border border-white/10 bg-slate-900 p-4">
          <p class="text-xs text-slate-400">Total jobs</p>
          <p class="mt-1 text-3xl font-bold text-white">{{ total }}</p>
        </div>
        <div class="rounded-xl border border-white/10 bg-slate-900 p-4">
          <p class="text-xs text-slate-400">Applied</p>
          <p class="mt-1 text-3xl font-bold text-blue-400">{{ applied }}</p>
          <p class="mt-0.5 text-xs text-slate-500">{{ convRate(applied, total) }} of total</p>
        </div>
        <div class="rounded-xl border border-white/10 bg-slate-900 p-4">
          <p class="text-xs text-slate-400">Interviews</p>
          <p class="mt-1 text-3xl font-bold text-yellow-400">{{ interviews }}</p>
          <p class="mt-0.5 text-xs text-slate-500">{{ convRate(interviews, applied) }} of applied</p>
        </div>
        <div class="rounded-xl border border-white/10 bg-slate-900 p-4">
          <p class="text-xs text-slate-400">Offers</p>
          <p class="mt-1 text-3xl font-bold text-emerald-400">{{ offers }}</p>
          <p class="mt-0.5 text-xs text-slate-500">{{ convRate(offers, interviews) }} of interviews</p>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <!-- Breakdown by status -->
        <div class="rounded-xl border border-white/10 bg-slate-900 p-5">
          <h2 class="mb-4 text-sm font-semibold text-slate-200">Breakdown by status</h2>
          <div class="space-y-3">
            <div v-for="s in byStatus" :key="s.value">
              <div class="mb-1 flex items-center justify-between">
                <span class="text-sm text-slate-300">{{ s.label }}</span>
                <span class="text-sm font-semibold text-white">{{ s.count }}
                  <span class="text-xs font-normal text-slate-500">({{ s.pct }}%)</span>
                </span>
              </div>
              <div class="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="statusBarColor[s.value]"
                  :style="{ width: s.pct + '%' }"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Funnel -->
        <div class="rounded-xl border border-white/10 bg-slate-900 p-5">
          <h2 class="mb-4 text-sm font-semibold text-slate-200">Conversion funnel</h2>
          <div class="space-y-2">
            <div v-for="(row, i) in [
              { label: 'Wishlist → Applied', num: applied, den: total, color: 'text-blue-400' },
              { label: 'Applied → Interview', num: interviews, den: applied, color: 'text-yellow-400' },
              { label: 'Interview → Offer', num: offers, den: interviews, color: 'text-emerald-400' },
              { label: 'Overall (total → offer)', num: offers, den: total, color: 'text-purple-400' },
            ]" :key="i" class="flex items-center justify-between rounded-lg bg-slate-800/60 px-4 py-2.5">
              <span class="text-sm text-slate-300">{{ row.label }}</span>
              <span class="text-sm font-bold" :class="row.color">{{ convRate(row.num, row.den) }}</span>
            </div>
            <div class="flex items-center justify-between rounded-lg bg-red-900/20 border border-red-500/20 px-4 py-2.5">
              <span class="text-sm text-slate-300">Rejected</span>
              <span class="text-sm font-bold text-red-400">{{ rejected }} <span class="text-xs font-normal text-slate-500">({{ convRate(rejected, applied) }} of applied)</span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Deadlines -->
      <div v-if="overdue > 0 || upcoming.length > 0" class="rounded-xl border border-white/10 bg-slate-900 p-5">
        <h2 class="mb-4 text-sm font-semibold text-slate-200">Deadlines</h2>
        <div class="grid gap-3 sm:grid-cols-2">
          <!-- Overdue alert -->
          <div v-if="overdue > 0" class="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3">
            <svg class="h-5 w-5 shrink-0 text-red-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 8v4m0 4h.01"/>
            </svg>
            <div>
              <p class="text-sm font-medium text-red-400">{{ overdue }} overdue {{ overdue === 1 ? 'deadline' : 'deadlines' }}</p>
              <p class="text-xs text-slate-400">Check your board and take action</p>
            </div>
          </div>

          <!-- Upcoming list -->
          <div v-if="upcoming.length">
            <p class="mb-2 text-xs font-medium text-slate-400">Next 7 days</p>
            <div class="space-y-1.5">
              <div
                v-for="job in upcoming"
                :key="job.id"
                class="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2"
              >
                <NuxtLink :to="`/jobs/${job.id}`" class="text-sm text-white hover:text-blue-300 truncate transition-colors">
                  {{ job.company }} · {{ job.position }}
                </NuxtLink>
                <span class="ml-3 shrink-0 text-xs text-amber-400">
                  {{ new Date(job.deadline! + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="total === 0" class="rounded-xl border border-dashed border-white/10 p-12 text-center">
        <p class="text-slate-400">No jobs yet — add some from the <NuxtLink to="/" class="text-blue-400 hover:text-blue-300">board</NuxtLink>.</p>
      </div>
    </main>
  </div>
</template>
