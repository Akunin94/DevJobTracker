<script setup lang="ts">
import type { Job } from '~/types/job'

defineProps<{ job: Job }>()
const emit = defineEmits<{
  edit: []
  delete: []
}>()

const confirming = ref(false)

function confirmDelete() {
  confirming.value = true
}

function cancelDelete() {
  confirming.value = false
}

function doDelete() {
  emit('delete')
}
</script>

<template>
  <div class="group rounded-lg border border-white/10 bg-slate-800/80 p-3.5 transition-all hover:border-white/20 hover:bg-slate-800">
    <!-- Company + position -->
    <p class="truncate text-sm font-semibold text-white">{{ job.company }}</p>
    <p class="mt-0.5 truncate text-xs text-slate-400">{{ job.position }}</p>

    <!-- Salary -->
    <p v-if="job.salary" class="mt-2 text-xs font-medium text-emerald-400">{{ job.salary }}</p>

    <!-- Footer -->
    <div class="mt-3 flex items-center justify-between">
      <span class="text-xs text-slate-500">
        {{ new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
      </span>

      <!-- Normal actions (shown on hover) -->
      <div v-if="!confirming" class="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
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
