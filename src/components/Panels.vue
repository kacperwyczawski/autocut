<script setup lang="ts">
import type { PanelTemplate } from "@/core/panelTemplate";

const panels = defineModel<{ panel: PanelTemplate; quantity: number }[]>();

const props = defineProps<{
	hoveredPanel?: { length: number; width: number } | null;
}>();

const emit = defineEmits<{
	(e: "hover-panel", panel: { length: number; width: number } | null): void;
}>();

function isPanelHovered(panel: PanelTemplate): boolean {
	if (!props.hoveredPanel) return false;
	const h = props.hoveredPanel;
	return (
		(panel.length === h.length && panel.width === h.width) ||
		(panel.length === h.width && panel.width === h.length)
	);
}

function getEdgeReductionTooltip(
	edgeReduction: PanelTemplate["edgeReduction"],
): string {
	const edges: string[] = [];
	if (edgeReduction.top) edges.push("Top");
	if (edgeReduction.right) edges.push("Right");
	if (edgeReduction.bottom) edges.push("Bottom");
	if (edgeReduction.left) edges.push("Left");
	if (edges.length === 0) return "No edges reduced";
	return `Edges: ${edges.join(", ")}`;
}
</script>

<template>
  <div v-if="!panels || panels.length === 0" class="flex flex-col items-center justify-center text-center py-12 px-4">
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
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M3 9h18" />
        <path d="M9 21V9" />
      </svg>
    </div>
    <p class="font-semibold text-sm text-base-content">No panels yet</p>
    <p class="text-xs text-base-content/60 mt-1 max-w-[14rem]">
      Add panels using the form on the right or import from JSON.
    </p>
  </div>
  <div v-else class="overflow-x-auto rounded-box border border-base-300 bg-base-100">
      <table class="table table-sm w-full">
        <thead class="bg-base-200/50 text-base-content/70 text-xs">
          <tr>
            <th class="font-semibold uppercase tracking-wider py-2">Length</th>
            <th class="font-semibold uppercase tracking-wider py-2">Width</th>
            <th class="font-semibold uppercase tracking-wider text-center py-2">Qty</th>
            <th class="font-semibold uppercase tracking-wider text-center py-2">Edges</th>
            <th class="w-8 py-2"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(multipanel, index) in panels"
            :key="index"
            class="transition-colors border-b border-base-300/50 last:border-b-0 cursor-pointer"
            :class="{
              'bg-primary/20 text-primary': isPanelHovered(multipanel.panel),
              'hover:bg-base-200/60': !isPanelHovered(multipanel.panel),
            }"
            @mouseenter="emit('hover-panel', multipanel.panel)"
            @mouseleave="emit('hover-panel', null)"
          >
            <td class="font-mono font-bold text-sm py-2">{{ multipanel.panel.length }}</td>
            <td class="font-mono font-bold text-sm py-2">{{ multipanel.panel.width }}</td>
            <td class="text-center py-2">
              <span class="badge badge-sm badge-neutral font-mono font-bold">
                {{ multipanel.quantity }}
              </span>
            </td>
            <td class="text-center py-2">
              <div
                class="tooltip tooltip-left"
                :data-tip="getEdgeReductionTooltip(multipanel.panel.edgeReduction)"
              >
                <div
                  class="w-5 h-5 mx-auto border-2 border-base-300 rounded-xs relative bg-base-200"
                  :class="{
                    'border-t-primary border-t-2': multipanel.panel.edgeReduction.top,
                    'border-r-primary border-r-2': multipanel.panel.edgeReduction.right,
                    'border-b-primary border-b-2': multipanel.panel.edgeReduction.bottom,
                    'border-l-primary border-l-2': multipanel.panel.edgeReduction.left,
                  }"
                ></div>
              </div>
            </td>
            <td class="text-right py-2 pr-2">
              <button
                class="btn btn-ghost btn-square btn-xs text-base-content/40 hover:text-error hover:bg-error/15 transition-colors"
                title="Remove panel"
                @click="panels?.splice(index, 1)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
</template>
