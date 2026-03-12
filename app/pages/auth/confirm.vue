<script setup lang="ts">
const supabase = useSupabaseClient()
const route = useRoute()

onMounted(async () => {
  const code = route.query.code as string | undefined
  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }
  navigateTo('/')
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-950">
    <div class="text-slate-400 text-sm">Signing in…</div>
  </div>
</template>
