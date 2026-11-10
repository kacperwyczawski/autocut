<script setup lang="ts">
import Cuts from "@/components/Cuts.vue";
import type { OptimizationResult } from "@/core/optimizationResult";
import { computed } from "vue";

const props = defineProps<{
	optimization: OptimizationResult | null;
	hoveredCut?: { sheetIndex: number; cutIndex: number } | null;
}>();

const emit = defineEmits<{
	(e: "hover-cut", cut: { sheetIndex: number; cutIndex: number } | null): void;
	(e: "open-export"): void;
}>();

const totalCutsCount = computed(() => {
	if (!props.optimization || typeof props.optimization === "string") {
		return 0;
	}
	return props.optimization.sheets.reduce(
		(sum, s) => sum + s.cuts.length,
		0,
	);
});
</script>

<template>
  <aside class="w-80 xl:w-96 bg-base-200 border-l border-base-300 flex flex-col h-full shrink-0">
    <div class="p-3 border-b border-base-300 flex items-center justify-between shrink-0 gap-2">
      <div class="flex items-center gap-2 min-w-0">
        <span class="font-bold text-sm tracking-tight shrink-0">Cuts Sequence</span>
        <span
          v-if="totalCutsCount > 0"
          class="badge badge-xs badge-neutral font-mono shrink-0"
        >
          {{ totalCutsCount }}
        </span>
      </div>
      <button
        v-if="optimization && typeof optimization !== 'string'"
        type="button"
        class="btn btn-xs btn-outline gap-1 shrink-0"
        title="Export Optimization Result JSON"
        @click="emit('open-export')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export JSON
      </button>
    </div>

    <div class="flex-1 overflow-y-auto min-h-0 p-3">
      <Cuts
        :optimization="optimization"
        :hovered-cut="hoveredCut"
        @hover-cut="emit('hover-cut', $event)"
      />
    </div>
  </aside>
</template>
