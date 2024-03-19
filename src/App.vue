<script setup lang="ts">
import { RouterView } from "vue-router";
import Header from "./components/Header.vue";
</script>

<template>
  <div class="grid grid-rows-[4rem_calc(100dvh_-_4rem)]">
    <Header />
    <!-- TODO: KeepAlive makes HomeView not reactive to changes in settings, this needs to be fixed -->
    <RouterView v-slot="{ Component }">
      <KeepAlive include="HomeView">
        <component :is="Component" />
      </KeepAlive>
    </RouterView>
  </div>
</template>
