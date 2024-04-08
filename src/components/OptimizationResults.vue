<script setup lang="ts">
import type { OptimizationResult } from "@/core/optimizationResult";
import type { OptimizedSheet } from "@/core/optimizedSheet";

defineProps<{
	optimization: OptimizationResult;
}>();
</script>
<template>
  <div class="mt-2 flex gap-1">
    <span class="badge">
      Waste: {{ Math.round(optimization.wastePercentage) }}%
    </span>
  </div>
  <div class="flex flex-col gap-2 mt-2">
    <div
      v-for="sheet in optimization.sheets"
      class="border-2 border-secondary border-dashed relative font-mono text-center"
      :style="{
        aspectRatio: `${sheet.sheet.length / sheet.sheet.width}`,
      }"
    >
      <div
        v-for="panel in sheet.panels"
        class="border-2 border-secondary fill-base-200 absolute"
        :style="{
          left: `${(panel.x / sheet.sheet.length) * 100}%`,
          top: `${(panel.y / sheet.sheet.width) * 100}%`,
          width: `${(panel.panel.length / sheet.sheet.length) * 100}%`,
          height: `${(panel.panel.width / sheet.sheet.width) * 100}%`,
        }"
        :class="{
          'border-t-primary': panel.panel.edgeReduction.top,
          'border-r-primary': panel.panel.edgeReduction.right,
          'border-b-primary': panel.panel.edgeReduction.bottom,
          'border-l-primary': panel.panel.edgeReduction.left,
        }"
      >
        <div class="absolute -top-1 inset-x-0">
          {{ panel.panel.length }}
        </div>
        <div
          class="absolute -left-1 inset-y-0 [writing-mode:vertical-rl] [text-orientation: mixed]"
        >
          {{ panel.panel.width }}
        </div>
      </div>
      <div
        v-for="cut in sheet.cuts"
        class="absolute bg-base-300"
        :style="{
          left: `calc(${(cut.x / sheet.sheet.length) * 100}% - 1px)`,
          top: `calc(${(cut.y / sheet.sheet.width) * 100}% - 1px)`,
          width: cut.direction === 'horizontal' ? `${(cut.length / sheet.sheet.length) * 100}%` : '2px',
          height: cut.direction === 'horizontal' ? '2px' : `${(cut.length / sheet.sheet.width) * 100}%`,
        }"
      ></div>
    </div>
  </div>
</template>
