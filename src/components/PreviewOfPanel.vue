<script setup lang="ts">
import type { Panel } from "@/core/panel";

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
