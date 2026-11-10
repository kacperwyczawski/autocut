<script setup lang="ts">
import type { OptimizationResult } from "@/core/optimizationResult";
import type { PanelTemplate } from "@/core/panelTemplate";
import { computed, ref } from "vue";

const props = defineProps<{
	optimization: OptimizationResult;
	hoveredCut?: { sheetIndex: number; cutIndex: number } | null;
	hoveredPanel?: { length: number; width: number } | null;
}>();

const emit = defineEmits<{
	(e: "hover-cut", cut: { sheetIndex: number; cutIndex: number } | null): void;
	(e: "hover-panel", panel: { length: number; width: number } | null): void;
}>();

const viewMode = ref<"overview" | "details">("overview");

function isPanelHovered(panel: PanelTemplate): boolean {
	if (!props.hoveredPanel) return false;
	const h = props.hoveredPanel;
	return (
		(panel.length === h.length && panel.width === h.width) ||
		(panel.length === h.width && panel.width === h.length)
	);
}

function isCutHovered(sheetIndex: number, cutIndex: number): boolean {
	return (
		props.hoveredCut?.sheetIndex === sheetIndex &&
		props.hoveredCut?.cutIndex === cutIndex
	);
}

function getOptimizationTime(): string {
	if (typeof props.optimization === "string") {
		return "not gonna happen";
	}

	let time = props.optimization.time;
	time /= 100;
	time = Math.round(time);
	time /= 10;

	if (time === 0) {
		return "Time: <0.1s";
	}
	return `Time: ${time}s`;
}

function formatLength(mm: number): string {
	if (mm >= 1000) {
		return `${(mm / 1000).toFixed(2)} m`;
	}
	return `${Math.round(mm)} mm`;
}

const totalBladeTravel = computed(() => {
	if (typeof props.optimization === "string") return 0;
	let sum = 0;
	for (const sheet of props.optimization.sheets) {
		for (const cut of sheet.cuts) {
			sum += cut.length;
		}
	}
	return sum;
});

const totalEdgeBanding = computed(() => {
	if (typeof props.optimization === "string") return 0;
	let sum = 0;
	for (const sheet of props.optimization.sheets) {
		for (const panel of sheet.panels) {
			const { length, width, edgeReduction } = panel.template;
			if (edgeReduction.top) sum += length;
			if (edgeReduction.bottom) sum += length;
			if (edgeReduction.left) sum += width;
			if (edgeReduction.right) sum += width;
		}
	}
	return sum;
});
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
    <div class="mt-3 mb-1 flex items-center justify-between gap-3 flex-wrap">
      <div class="flex flex-wrap items-center gap-1.5 text-xs font-mono">
        <span class="badge badge-sm badge-neutral">
          Sheets: {{ optimization.sheets.length }}
        </span>
        <span
          class="badge badge-sm"
          :class="optimization.wastePercentage < 15 ? 'badge-success' : 'badge-warning'"
        >
          Waste: {{ Math.round(optimization.wastePercentage) }}%
        </span>
        <span class="badge badge-sm badge-ghost" title="Total saw cut length">
          Blade travel: {{ formatLength(totalBladeTravel) }}
        </span>
        <span class="badge badge-sm badge-ghost" title="Total edge banding (długość okleiny)">
          Edge banding: {{ formatLength(totalEdgeBanding) }}
        </span>
        <span class="badge badge-sm badge-ghost" v-text="getOptimizationTime()"></span>
      </div>

      <div role="tablist" class="tabs tabs-box tabs-xs">
        <button
          type="button"
          role="tab"
          class="tab text-xs transition-all"
          :class="{ 'tab-active font-semibold shadow-xs': viewMode === 'overview' }"
          @click="viewMode = 'overview'"
        >
          Overview
        </button>
        <button
          type="button"
          role="tab"
          class="tab text-xs transition-all"
          :class="{ 'tab-active font-semibold shadow-xs': viewMode === 'details' }"
          @click="viewMode = 'details'"
        >
          Details
        </button>
      </div>
    </div>

    <div
      v-if="viewMode === 'overview'"
      class="mt-3 grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4"
    >
      <div
        v-for="(sheet, index) in optimization.sheets"
        :key="index"
        class="w-full relative border-2 border-secondary border-dashed bg-base-200/60 overflow-hidden"
        :style="{
          aspectRatio: `${sheet.template.length / sheet.template.width}`,
        }"
      >
        <div
          v-for="(panel, pIdx) in sheet.panels"
          :key="pIdx"
          class="absolute bg-primary/75 border border-primary-content/25"
          :style="{
            left: `${(panel.x / sheet.template.length) * 100}%`,
            top: `${(panel.y / sheet.template.width) * 100}%`,
            width: `${(panel.template.length / sheet.template.length) * 100}%`,
            height: `${(panel.template.width / sheet.template.width) * 100}%`,
          }"
        ></div>
      </div>
    </div>

    <div
      v-else
      class="flex flex-col gap-4 mt-3 items-start [--sheet-max-h:calc(100dvh-15rem)]"
    >
      <div
        v-for="(sheet, index) in optimization.sheets"
        :key="index"
        class="border-2 border-secondary border-dashed relative font-mono text-center"
        :style="{
          aspectRatio: `${sheet.template.length / sheet.template.width}`,
          maxHeight: 'var(--sheet-max-h)',
          maxWidth: '100%',
          width: `min(100%, calc(var(--sheet-max-h) * (${sheet.template.length} / ${sheet.template.width})))`,
        }"
      >
        <div
          v-for="panel in sheet.panels"
          :key="`${panel.x}-${panel.y}-${panel.template.length}-${panel.template.width}`"
          class="border-2 border-secondary absolute cursor-pointer transition-all select-none"
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
            'bg-primary/30 ring-2 ring-primary ring-inset z-10 shadow-lg font-bold': isPanelHovered(panel.template),
            'bg-base-200/90 hover:bg-primary/10': !isPanelHovered(panel.template),
          }"
          @mouseenter="emit('hover-panel', panel.template)"
          @mouseleave="emit('hover-panel', null)"
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
          v-for="(cut, cIdx) in sheet.cuts"
          :key="cIdx"
          class="absolute cursor-pointer pointer-events-auto transition-all"
          :style="{
            left: `calc(${(cut.x / sheet.template.length) * 100}% - ${cut.direction === 'vertical' ? (isCutHovered(index, cIdx) ? 2 : 1) : 0}px)`,
            top: `calc(${(cut.y / sheet.template.width) * 100}% - ${cut.direction === 'horizontal' ? (isCutHovered(index, cIdx) ? 2 : 1) : 0}px)`,
            width:
              cut.direction === 'horizontal'
                ? `${(cut.length / sheet.template.length) * 100}%`
                : isCutHovered(index, cIdx)
                  ? '4px'
                  : '2px',
            height:
              cut.direction === 'horizontal'
                ? isCutHovered(index, cIdx)
                  ? '4px'
                  : '2px'
                : `${(cut.length / sheet.template.width) * 100}%`,
            zIndex: isCutHovered(index, cIdx) ? 30 : 15,
          }"
          :class="
            isCutHovered(index, cIdx)
              ? 'bg-primary ring-2 ring-primary/60 shadow-md'
              : 'bg-base-content/40 hover:bg-primary'
          "
          @mouseenter="emit('hover-cut', { sheetIndex: index, cutIndex: cIdx })"
          @mouseleave="emit('hover-cut', null)"
        >
          <div
            v-if="isCutHovered(index, cIdx)"
            class="absolute pointer-events-none badge badge-xs badge-primary font-mono font-bold shadow-md -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 z-40 whitespace-nowrap"
          >
            #{{ cIdx + 1 }} {{ cut.direction === 'horizontal' ? `Y=${cut.y}` : `X=${cut.x}` }}mm
          </div>
        </div>
      </div>
    </div>
  </template>
</template>
