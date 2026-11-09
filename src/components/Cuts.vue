<script setup lang="ts">
import type { OptimizationResult } from "@/core/optimizationResult";
import { computed, ref } from "vue";

const props = defineProps<{
	optimization: OptimizationResult | null;
}>();

const selectedSheetIndex = ref(0);

const sheets = computed(() => {
	if (!props.optimization || typeof props.optimization === "string") {
		return [];
	}
	return props.optimization.sheets;
});

const currentSheet = computed(() => {
	if (sheets.value.length === 0) return null;
	const index = Math.min(selectedSheetIndex.value, sheets.value.length - 1);
	return sheets.value[index] ?? null;
});
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

  <div v-else class="flex flex-col gap-2">
    <!-- Sheet Switcher if multiple sheets -->
    <div v-if="sheets.length > 1" class="flex gap-1 overflow-x-auto pb-1">
      <button
        v-for="(sheet, idx) in sheets"
        :key="idx"
        class="btn btn-xs shrink-0 font-mono"
        :class="selectedSheetIndex === idx ? 'btn-primary' : 'btn-ghost border border-base-300/50'"
        @click="selectedSheetIndex = idx"
      >
        Sheet {{ idx + 1 }}
        <span class="badge badge-xs" :class="selectedSheetIndex === idx ? 'badge-neutral' : 'badge-ghost'">
          {{ sheet.cuts.length }}
        </span>
      </button>
    </div>

    <!-- Cuts Table -->
    <div v-if="currentSheet" class="overflow-x-auto rounded-box border border-base-300 bg-base-100">
      <div class="bg-base-200/50 px-3 py-2 border-b border-base-300/60 flex items-center justify-between text-xs">
        <span class="font-semibold text-base-content/80">
          Sheet {{ selectedSheetIndex + 1 }}
          <span class="font-mono text-base-content/60 font-normal">
            ({{ currentSheet.template.length }} × {{ currentSheet.template.width }} mm)
          </span>
        </span>
        <span class="badge badge-sm badge-outline font-mono">
          {{ currentSheet.cuts.length }} cuts
        </span>
      </div>

      <div v-if="currentSheet.cuts.length === 0" class="text-center py-6 text-xs text-base-content/60">
        No cuts required for this sheet.
      </div>

      <table v-else class="table table-xs table-fixed w-full">
        <thead class="bg-base-200/40 text-base-content/70">
          <tr>
            <th class="w-10 text-center py-2">#</th>
            <th class="w-10 text-center py-2">Dir</th>
            <th class="py-2 pl-2">Saw Fence</th>
          </tr>
        </thead>
        <tbody class="font-mono">
          <tr
            v-for="(cut, cIdx) in currentSheet.cuts"
            :key="cIdx"
            class="transition-colors border-b border-base-300/40 last:border-b-0 hover:bg-base-200/70"
          >
            <!-- Step Number -->
            <td class="text-center py-2 font-mono">
              <span class="badge badge-xs font-mono font-bold badge-neutral">
                {{ cIdx + 1 }}
              </span>
            </td>

            <!-- Direction Icon (Lucide move-horizontal / move-vertical) -->
            <td class="text-center py-2">
              <span
                class="inline-flex items-center justify-center text-base-content/70"
                :title="cut.direction === 'horizontal' ? 'Horizontal cut' : 'Vertical cut'"
              >
                <svg
                  v-if="cut.direction === 'horizontal'"
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
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
                  width="14"
                  height="14"
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

            <!-- Fence Position -->
            <td class="py-2 pl-2 text-xs truncate">
              <span class="opacity-60 text-[11px]">
                {{ cut.direction === 'horizontal' ? 'Y =' : 'X =' }}
              </span>
              <span class="font-bold ml-1 text-sm">
                {{ cut.direction === 'horizontal' ? cut.y : cut.x }}
              </span>
              <span class="opacity-60 text-[11px] ml-0.5">mm</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
