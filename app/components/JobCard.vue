<script setup lang="ts">
import type { Job } from '~/types/job'

defineProps<{ job: Job }>()
</script>

<template>
  <div class="group rounded-lg border border-white/10 bg-slate-800/80 p-3.5 hover:border-white/20 hover:bg-slate-800 transition-all cursor-pointer">
    <!-- Company + position -->
    <p class="truncate font-semibold text-white text-sm">{{ job.company }}</p>
    <p class="truncate text-xs text-slate-400 mt-0.5">{{ job.position }}</p>

    <!-- Salary -->
    <p v-if="job.salary" class="mt-2 text-xs font-medium text-emerald-400">{{ job.salary }}</p>

    <!-- Footer -->
    <div class="mt-3 flex items-center justify-between">
      <span class="text-xs text-slate-500">{{ new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}</span>
      <NuxtLink
        :to="`/jobs/${job.id}`"
        class="text-xs text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
      >
        Open →
      </NuxtLink>
    </div>
  </div>
</template>
