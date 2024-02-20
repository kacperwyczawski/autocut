<script setup lang="ts">
import type { OptimizedSheet } from "@/core/optimizedSheet";

defineProps<{
  sheets: OptimizedSheet[];
}>();
</script>
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
        class="stroke-neutral fill-base-200"
      ></rect>
    </svg>
  </div>
</template>
