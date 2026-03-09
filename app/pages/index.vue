<script setup lang="ts">
import { useJobsStore } from '~/stores/jobs'

useHead({ title: 'Dev Job Tracker' })

const store = useJobsStore()
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-white">
    <!-- Top nav -->
    <header class="border-b border-slate-800 bg-slate-900 px-6 py-3.5">
      <div class="mx-auto flex max-w-screen-2xl items-center justify-between gap-4">
        <!-- Logo -->
        <div class="flex items-center gap-2.5">
          <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-500 text-xs font-bold leading-none">
            DT
          </div>
          <span class="text-base font-semibold text-white">Dev Job Tracker</span>
        </div>

        <!-- Right side -->
        <div class="flex items-center gap-4">
          <span class="text-sm text-slate-500">
            <span class="font-semibold text-slate-200">{{ store.jobs.length }}</span> jobs
          </span>
          <button
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 active:bg-blue-700 transition-colors"
          >
            + Add Job
          </button>
        </div>
      </div>
    </header>

    <!-- Board -->
    <main class="mx-auto max-w-screen-2xl p-6">
      <KanbanBoard />
    </main>
  </div>
</template>
