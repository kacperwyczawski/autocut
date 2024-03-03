<script setup lang="ts">
import type { OptimizedSheet } from "@/core/optimizedSheet";

defineProps<{
  sheets: OptimizedSheet[];
}>();
</script>
// TODO: use PreviewOfPanel.vue and switch to html instead of svg
<template>
  <div class="flex flex-col gap-2 pt-2">
    <svg
      v-for="optimizedSheet in sheets"
      :viewBox="`0 0 ${optimizedSheet.sheet.length} ${optimizedSheet.sheet.width}`"
      class="fill-transparent border-2 border-secondary border-dashed"
    >
      <rect
        v-for="optimizedPanel in optimizedSheet.panels"
        :x="optimizedPanel.x"
        :y="optimizedPanel.y"
        :width="optimizedPanel.panel.length"
        :height="optimizedPanel.panel.width"
        class="fill-base-200"
      ></rect>
      <line
        v-for="cut in optimizedSheet.cuts"
        :x1="cut.x"
        :y1="cut.y"
        :x2="cut.direction === 'horizontal' ? cut.x + cut.length : cut.x"
        :y2="cut.direction === 'horizontal' ? cut.y : cut.y + cut.length"
        class="stroke-neutral"
      ></line>
    </svg>
  </div>
</template>
