<script setup lang="ts">
import { JOB_STATUSES } from '~/types/job'
import type { Job, JobFormData } from '~/types/job'

const props = defineProps<{ job?: Job }>()
const emit = defineEmits<{
  submit: [data: JobFormData]
  close: []
}>()

const form = reactive<JobFormData>({
  company:  props.job?.company  ?? '',
  position: props.job?.position ?? '',
  url:      props.job?.url      ?? '',
  salary:   props.job?.salary   ?? '',
  status:   props.job?.status   ?? 'wishlist',
  notes:    props.job?.notes    ?? '',
})

function handleSubmit() {
  if (!form.company.trim() || !form.position.trim()) return
  emit('submit', { ...form })
}

// Close on Escape
onMounted(() => {
  const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') emit('close') }
  window.addEventListener('keydown', handler)
  onUnmounted(() => window.removeEventListener('keydown', handler))
})
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
      @click="emit('close')"
    />

    <!-- Dialog -->
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        class="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 shadow-2xl"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h2 class="text-base font-semibold text-white">
            {{ job ? 'Edit Job' : 'Add Job' }}
          </h2>
          <button
            class="text-slate-400 hover:text-white transition-colors"
            @click="emit('close')"
          >
            ✕
          </button>
        </div>

        <!-- Form -->
        <form class="space-y-4 px-6 py-5" @submit.prevent="handleSubmit">
          <!-- Company + Position -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-1.5 block text-xs font-medium text-slate-400">Company *</label>
              <input
                v-model="form.company"
                type="text"
                placeholder="Acme Corp"
                required
                class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-slate-400">Position *</label>
              <input
                v-model="form.position"
                type="text"
                placeholder="Senior Engineer"
                required
                class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <!-- Status -->
          <div>
            <label class="mb-1.5 block text-xs font-medium text-slate-400">Status</label>
            <select
              v-model="form.status"
              class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            >
              <option v-for="s in JOB_STATUSES" :key="s.value" :value="s.value">
                {{ s.label }}
              </option>
            </select>
          </div>

          <!-- URL + Salary -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-1.5 block text-xs font-medium text-slate-400">Job URL</label>
              <input
                v-model="form.url"
                type="url"
                placeholder="https://..."
                class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-slate-400">Salary</label>
              <input
                v-model="form.salary"
                type="text"
                placeholder="$120k–$150k"
                class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <!-- Notes -->
          <div>
            <label class="mb-1.5 block text-xs font-medium text-slate-400">Notes</label>
            <textarea
              v-model="form.notes"
              rows="3"
              placeholder="Recruiter name, next steps…"
              class="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-1">
            <button
              type="button"
              class="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              @click="emit('close')"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
            >
              {{ job ? 'Save changes' : 'Add job' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
