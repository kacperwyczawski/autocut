<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import Header from "./components/Header.vue";
</script>

<template>
  <div class="grid grid-rows-[4rem_calc(100dvh_-_4rem)]">
    <Header />
    <RouterView />
  </div>
</template>
