<script setup lang="ts">
import type { Panel } from "@/core/panel";
import { computed, ref, watchEffect } from "vue";

const props = defineProps<{
  panelInPreview: Panel | null;
}>();

const container = ref<HTMLDivElement | null>(null);
const letterWidth = 10;
const letterHeight = 16;
function digitCount(n: number) {
  return Math.floor(Math.log10(n) + 1);
}
</script>
<template>
  <div
    v-if="panelInPreview"
    ref="container"
    class="border-2 border-secondary max-h-96 relative font-mono text-center"
    :style="{
      aspectRatio: `${panelInPreview.length / panelInPreview.width}`,
    }"
  >
    <div class="absolute -top-1 inset-x-0">
      {{ panelInPreview.length }}
    </div>
    <div
      class="absolute -left-1 inset-y-0 [writing-mode:vertical-rl] [text-orientation: mixed]"
    >
      {{ panelInPreview.width }}
    </div>
  </div>
</template>
