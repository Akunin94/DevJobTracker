<script setup lang="ts">
useHead({ title: 'Sign in — Dev Job Tracker' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Already logged in → redirect to board
watchEffect(() => {
  if (user.value) navigateTo('/')
})

const loading = ref(false)

async function signInWithGitHub() {
  loading.value = true
  await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: `${window.location.origin}/auth/confirm` },
  })
  loading.value = false
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-950">
    <div class="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-8 text-center shadow-xl">
      <!-- Logo -->
      <div class="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-lg font-bold text-white">
        DJT
      </div>

      <h1 class="mb-1 text-xl font-semibold text-white">Dev Job Tracker</h1>
      <p class="mb-8 text-sm text-slate-400">Track your job search in one place</p>

      <button
        :disabled="loading"
        class="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700 active:bg-slate-600 disabled:opacity-50"
        @click="signInWithGitHub"
      >
        <!-- GitHub icon -->
        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.341-3.369-1.341-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
        </svg>
        {{ loading ? 'Redirecting…' : 'Sign in with GitHub' }}
      </button>
    </div>
  </div>
</template>
