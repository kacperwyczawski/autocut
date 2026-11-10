<script setup lang="ts">
import type { OptimizationResult } from "@/core/optimizationResult";
import { computed } from "vue";

const props = defineProps<{
	optimization: OptimizationResult | null;
	hoveredCut?: { sheetIndex: number; cutIndex: number } | null;
}>();

const emit = defineEmits<{
	(e: "hover-cut", cut: { sheetIndex: number; cutIndex: number } | null): void;
}>();

const sheets = computed(() => {
	if (!props.optimization || typeof props.optimization === "string") {
		return [];
	}
	return props.optimization.sheets;
});

function isCutHovered(sheetIndex: number, cutIndex: number): boolean {
	return (
		props.hoveredCut?.sheetIndex === sheetIndex &&
		props.hoveredCut?.cutIndex === cutIndex
	);
}
</script>

<template>
  <div v-if="!optimization || typeof optimization === 'string' || sheets.length === 0" class="flex flex-col items-center justify-center text-center py-12 px-4">
    <div class="w-12 h-12 rounded-full bg-base-300/60 flex items-center justify-center mb-3 text-base-content/50">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="6" cy="6" r="3" />
        <path d="M8.12 8.12 12 12" />
        <path d="M20 4 8.12 15.88" />
        <circle cx="6" cy="18" r="3" />
        <path d="M14.8 14.8 20 20" />
      </svg>
    </div>
    <p class="font-semibold text-sm text-base-content">No cuts generated yet</p>
    <p class="text-xs text-base-content/60 mt-1 max-w-[14rem]">
      Run optimization to generate the saw cut sequence.
    </p>
  </div>

  <div v-else class="flex flex-col gap-3">
    <div
      v-for="(sheet, sIdx) in sheets"
      :key="sIdx"
      class="overflow-x-auto rounded-box border border-base-300 bg-base-100"
    >
      <div class="bg-base-200/50 px-3 py-2 border-b border-base-300/50 flex items-center justify-between text-xs">
        <span class="font-semibold text-base-content/80">
          Sheet {{ sIdx + 1 }}
          <span class="font-mono text-base-content/60 font-normal">
            ({{ sheet.template.length }} × {{ sheet.template.width }} mm)
          </span>
        </span>
        <span class="badge badge-sm badge-neutral font-mono font-semibold">
          {{ sheet.cuts.length }} cuts
        </span>
      </div>

      <div v-if="sheet.cuts.length === 0" class="text-center py-6 text-xs text-base-content/60">
        No cuts required for this sheet.
      </div>

      <table v-else class="table table-sm w-full">
        <thead class="bg-base-200/50 text-base-content/70 text-xs">
          <tr>
            <th class="font-semibold uppercase tracking-wider text-center py-2 w-10">#</th>
            <th class="font-semibold uppercase tracking-wider text-center py-2 w-24">Direction</th>
            <th class="font-semibold uppercase tracking-wider py-2 pl-2">Saw Fence</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(cut, cIdx) in sheet.cuts"
            :key="cIdx"
            class="transition-colors border-b border-base-300/50 last:border-b-0 cursor-pointer"
            :class="{
              'bg-primary/20 text-primary': isCutHovered(sIdx, cIdx),
              'hover:bg-base-200/60': !isCutHovered(sIdx, cIdx),
            }"
            @mouseenter="emit('hover-cut', { sheetIndex: sIdx, cutIndex: cIdx })"
            @mouseleave="emit('hover-cut', null)"
          >
            <td class="text-center py-2">
              <span
                class="badge badge-sm font-mono font-bold"
                :class="isCutHovered(sIdx, cIdx) ? 'badge-primary' : 'badge-neutral'"
              >
                {{ cIdx + 1 }}
              </span>
            </td>

            <td class="text-center py-2">
              <span
                class="inline-flex items-center justify-center text-base-content/70"
                :title="cut.direction === 'horizontal' ? 'Horizontal cut' : 'Vertical cut'"
              >
                <svg
                  v-if="cut.direction === 'horizontal'"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-move-horizontal text-info"
                >
                  <polyline points="18 8 22 12 18 16" />
                  <polyline points="6 8 2 12 6 16" />
                  <line x1="2" x2="22" y1="12" y2="12" />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-move-vertical text-accent"
                >
                  <polyline points="8 18 12 22 16 18" />
                  <polyline points="8 6 12 2 16 6" />
                  <line x1="12" x2="12" y1="2" y2="22" />
                </svg>
              </span>
            </td>

            <td class="font-mono text-xs py-2 pl-2">
              <span class="text-base-content/60">
                {{ cut.direction === 'horizontal' ? 'Y =' : 'X =' }}
              </span>
              <span class="font-bold text-sm ml-1 text-base-content">
                {{ cut.direction === 'horizontal' ? cut.y : cut.x }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
