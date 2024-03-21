<script setup lang="ts">
import type { Panel } from "@/core/panel";
import { watch, watchEffect } from "vue";

const props = defineProps<{
	panelInPreview: Panel | null;
}>();
</script>
<template>
  <div
    v-if="panelInPreview"
    class="border-2 border-secondary max-h-96 relative font-mono text-center"
    :style="{
      aspectRatio: `${panelInPreview.length / panelInPreview.width}`,
    }"
    :class="{
      'border-t-primary border-t-4': panelInPreview.edgeReduction.top,
      'border-r-primary border-r-4': panelInPreview.edgeReduction.right,
      'border-b-primary border-b-4': panelInPreview.edgeReduction.bottom,
      'border-l-primary border-l-4': panelInPreview.edgeReduction.left,
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
