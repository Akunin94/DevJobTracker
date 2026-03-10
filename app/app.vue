<script setup lang="ts">
import { Toaster } from 'vue-sonner'
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <Toaster position="bottom-right" :theme="'dark'" rich-colors />
  </div>
</template>
