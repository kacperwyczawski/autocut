<script setup lang="ts">
import type { OptimizationResult } from "@/core/optimizationResult";

const props = defineProps<{
	optimization: OptimizationResult;
}>();

function getOptimizationTime(): string {
  if (typeof props.optimization === "string") {
    return "not gonna happen"
  }

  let time = props.optimization.time;
  time /= 100;
  time = Math.round(time);
  time /= 10;

  if (time === 0) {
    return "Time: <0.1s";
  }
  return `Time: ${time}s`
}
</script>
<template>
  <div
    v-if="typeof optimization === 'string'"
    role="alert"
    class="alert alert-error mt-2"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="stroke-current shrink-0 h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <span>
      {{ optimization }}
    </span>
  </div>
  <template v-else>
    <div class="mt-2 flex gap-1">
      <span class="badge">
        Waste: {{ Math.round(optimization.wastePercentage) }}%
      </span>
      <span v-text="getOptimizationTime()" class="badge"></span>
      <span class="badge">
        Fittings: {{ optimization.fittingCount }}
      </span>
    </div>
    <div class="flex flex-col gap-2 mt-2">
      <div
        v-for="sheet in optimization.sheets"
        class="border-2 border-secondary border-dashed relative font-mono text-center"
        :style="{
          aspectRatio: `${sheet.template.length / sheet.template.width}`,
        }"
      >
        <div
          v-for="panel in sheet.panels"
          class="border-2 border-secondary fill-base-200 absolute"
          :style="{
            left: `${(panel.x / sheet.template.length) * 100}%`,
            top: `${(panel.y / sheet.template.width) * 100}%`,
            width: `${(panel.template.length / sheet.template.length) * 100}%`,
            height: `${(panel.template.width / sheet.template.width) * 100}%`,
          }"
          :class="{
            'border-t-primary': panel.template.edgeReduction.top,
            'border-r-primary': panel.template.edgeReduction.right,
            'border-b-primary': panel.template.edgeReduction.bottom,
            'border-l-primary': panel.template.edgeReduction.left,
          }"
        >
          <div class="absolute -top-1 inset-x-0">
            {{ panel.template.length }}
          </div>
          <div
            class="absolute -left-1 inset-y-0 [writing-mode:vertical-rl] [text-orientation: mixed]"
          >
            {{ panel.template.width }}
          </div>
        </div>
        <div
          v-for="cut in sheet.cuts"
          class="absolute bg-base-300"
          :style="{
            left: `calc(${(cut.x / sheet.template.length) * 100}% - 1px)`,
            top: `calc(${(cut.y / sheet.template.width) * 100}% - 1px)`,
            width:
              cut.direction === 'horizontal'
                ? `${(cut.length / sheet.template.length) * 100}%`
                : '2px',
            height:
              cut.direction === 'horizontal'
                ? '2px'
                : `${(cut.length / sheet.template.width) * 100}%`,
          }"
        ></div>
      </div>
    </div>
  </template>
</template>
