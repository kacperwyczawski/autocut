<script setup lang="ts">
import ControlPanel from "@/components/ControlPanel.vue";
import CutsSidebar from "@/components/CutsSidebar.vue";
import ExportDialog from "@/components/ExportDialog.vue";
import ImportDialog from "@/components/ImportDialog.vue";
import InputSidebar from "@/components/InputSidebar.vue";
import OptimizationResults from "@/components/OptimizationResults.vue";
import PreviewOfPanel from "@/components/PreviewOfPanel.vue";
import useSettings from "@/composables/useSettings";
import type { OptimizationRequest } from "@/core/optimizationRequest";
import type { OptimizationResult } from "@/core/optimizationResult";
import type { PanelTemplate } from "@/core/panelTemplate";
import type { SheetTemplate } from "@/core/sheetTemplate";
import { type Ref, computed, nextTick, ref, toRaw, useTemplateRef, watch } from "vue";

const {
	sheetWidth,
	sheetLength,
	sheetTopEdgeReduction,
	sheetRightEdgeReduction,
	sheetBottomEdgeReduction,
	sheetLeftEdgeReduction,
	bladeThickness,
	searchDepth,
	searchWidth,
	allowRotation,
} = useSettings();

const sheet = computed<SheetTemplate>(() => ({
	width: sheetWidth.value,
	length: sheetLength.value,
	edgeReduction: {
		top: sheetTopEdgeReduction.value,
		right: sheetRightEdgeReduction.value,
		bottom: sheetBottomEdgeReduction.value,
		left: sheetLeftEdgeReduction.value,
	},
}));

const centerPaneRef = useTemplateRef<HTMLElement>("centerPaneRef");
const importDialogRef = useTemplateRef<InstanceType<typeof ImportDialog>>("importDialogRef");
const exportPanelsDialogRef = useTemplateRef<InstanceType<typeof ExportDialog>>("exportPanelsDialogRef");
const exportOptimizationDialogRef = useTemplateRef<InstanceType<typeof ExportDialog>>("exportOptimizationDialogRef");

const panels = ref<{ panel: PanelTemplate; quantity: number }[]>([]);
const optimizationResult: Ref<OptimizationResult | null> = ref(null);
const hoveredPanel = ref<{ length: number; width: number } | null>(null);
const hoveredCut = ref<{ sheetIndex: number; cutIndex: number } | null>(null);
const panelInPreview: Ref<PanelTemplate | null> = ref(null);

const placedPanels = ref(0);
const totalPanels = ref(0);
const optimizing = ref(false);
let worker = createWorker();

watch(
	[
		sheetWidth,
		sheetLength,
		sheetTopEdgeReduction,
		sheetRightEdgeReduction,
		sheetBottomEdgeReduction,
		sheetLeftEdgeReduction,
		bladeThickness,
		searchDepth,
		searchWidth,
		allowRotation,
	],
	() => {
		optimizationResult.value = null;
	},
);

function createWorker() {
	const w = new Worker(new URL("@/core/worker.ts", import.meta.url), {
		type: "module",
	});
	w.addEventListener("message", (event) => {
		if (event.data.placedPanels) {
			placedPanels.value = event.data.placedPanels;
			totalPanels.value = event.data.totalPanels;
		} else {
			optimizationResult.value = event.data;
			optimizing.value = false;
			nextTick(() => {
				centerPaneRef.value?.scrollTo({ top: 0, behavior: "instant" });
			});
		}
	});
	return w;
}

function handleOptimize() {
	panelInPreview.value = null;
	const flattenedPanels = toRaw(panels.value).flatMap((p) =>
		Array<PanelTemplate>(p.quantity).fill(p.panel),
	);
	if (flattenedPanels.length === 0) return;
	const request: OptimizationRequest = {
		sheetTemplate: sheet.value,
		panels: flattenedPanels,
		bladeThickness: toRaw(bladeThickness.value),
		searchDepth: toRaw(searchDepth.value),
		searchWidth: toRaw(searchWidth.value),
		depth: toRaw(searchDepth.value),
		allowRotation: toRaw(allowRotation.value),
	};
	worker.postMessage(request);
	optimizing.value = true;
}

function handleCancel() {
	optimizing.value = false;
	worker.terminate();
	worker = createWorker();
}

function handlePanelAdd(panel: PanelTemplate, quantity: number) {
	panels.value.push({ panel, quantity });
	optimizationResult.value = null;
	panelInPreview.value = null;
}

function handlePanelPreview(panel: PanelTemplate) {
	optimizationResult.value = null;
	panelInPreview.value = panel;
}

function handleImportPanels(
	imported: { panel: PanelTemplate; quantity: number }[],
	mode: "replace" | "append",
) {
	if (mode === "append") {
		panels.value = [...panels.value, ...imported];
	} else {
		panels.value = imported;
	}
	optimizationResult.value = null;
	panelInPreview.value = null;
}
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden">
    <InputSidebar
      v-model="panels"
      :hovered-panel="hoveredPanel"
      @hover-panel="hoveredPanel = $event"
      @open-import="importDialogRef?.showModal()"
      @open-export="exportPanelsDialogRef?.showModal()"
    />

    <main ref="centerPaneRef" class="flex-1 min-w-0 bg-base-100 flex flex-col h-full overflow-y-auto p-4">
      <ControlPanel
        :disable-exporting="panels.length === 0"
        :optimizing="optimizing"
        @add-panel="handlePanelAdd"
        @preview-panel="handlePanelPreview"
        @export="exportOptimizationDialogRef?.showModal()"
        @optimize="handleOptimize"
        @cancel="handleCancel"
      />

      <progress
        v-if="optimizing"
        class="progress progress-accent w-full mt-3"
        :value="placedPanels"
        :max="totalPanels"
      ></progress>

      <div
        v-if="panels.length === 0"
        role="alert"
        class="alert alert-info mt-3"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
        <span>Add some panels to optimize cutting patterns.</span>
      </div>

      <PreviewOfPanel v-if="panelInPreview" :panelInPreview="panelInPreview" />

      <OptimizationResults
        v-if="!optimizing && optimizationResult"
        :optimization="optimizationResult"
        :hovered-panel="hoveredPanel"
        :hovered-cut="hoveredCut"
        @hover-panel="hoveredPanel = $event"
        @hover-cut="hoveredCut = $event"
      />
    </main>

    <CutsSidebar
      :optimization="optimizationResult"
      :hovered-cut="hoveredCut"
      @hover-cut="hoveredCut = $event"
      @open-export="exportOptimizationDialogRef?.showModal()"
    />
  </div>

  <ImportDialog
    ref="importDialogRef"
    @import="handleImportPanels"
  />

  <ExportDialog
    ref="exportPanelsDialogRef"
    title="Export panels"
    description="Export the list of panels to a JSON file, so you can import it later."
    filename="panels"
    :data="panels"
  />

  <ExportDialog
    ref="exportOptimizationDialogRef"
    title="Export optimization"
    description="Export results of the optimization to a JSON file. It does not include the list of panels."
    filename="optimization"
    :data="optimizationResult"
  />
</template>
