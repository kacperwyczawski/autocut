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
// TODO: fix computeds are not updated when container is resized
// OR just clip the text with css
const showLength = computed(
  () =>
    container.value &&
    container.value.clientWidth > digitCount(props.panelInPreview!.length) * letterWidth &&
    container.value.clientHeight > letterHeight,
);
const showWidth = computed(
  () =>
    {
      console.log("container.value", container.value);
      console.log("container.value.clientHeight", container.value?.clientHeight);
      console.log("digitCount(...)", digitCount(props.panelInPreview!.width));
      console.log("digitCount(...) * letterHeight", digitCount(props.panelInPreview!.width) * letterHeight);
      console.log("container.value.clientWidth", container.value?.clientWidth);
      console.log("letterHeight", letterHeight);
      return container.value &&
        container.value.clientHeight > digitCount(props.panelInPreview!.width) * letterWidth &&
        container.value.clientWidth > letterHeight;
    },
);
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
    <div v-if="showLength" class="absolute -top-1 inset-x-0">
      {{ panelInPreview.length }}
    </div>
    <div
      v-if="showWidth"
      class="absolute -left-1 inset-y-0 [writing-mode:vertical-rl] [text-orientation: mixed]"
    >
      {{ panelInPreview.width }}
    </div>
  </div>
</template>
