<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import Header from './components/Header.vue';
</script>

<template>
  <div class="h-dvh flex flex-col [&>:last-child]:grow">
    <Header />
    <RouterView />
  </div>
</template>
