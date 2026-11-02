<script setup lang="ts">
import ControlPanel from "@/components/ControlPanel.vue";
import OptimizationResults from "@/components/OptimizationResults.vue";
import Panels from "@/components/Panels.vue";
import PreviewOfPanel from "@/components/PreviewOfPanel.vue";
import useJsonExport from "@/composables/useJsonExport";
import useSettings from "@/composables/useSettings";
import type { OptimizationRequest } from "@/core/optimizationRequest";
import type { OptimizationResult } from "@/core/optimizationResult";
import type { PanelTemplate } from "@/core/panelTemplate";
import type { SheetTemplate } from "@/core/sheetTemplate";
import { type Ref, computed, nextTick, ref, toRaw, useTemplateRef } from "vue";

const currentTab = ref("Panels");
const tabList = ["Panels", "Cuts"];

const { bladeThickness, optimizationDepth, allowRotation } = useSettings();

const sheet: SheetTemplate = {
	width: useSettings().sheetWidth.value,
	length: useSettings().sheetLength.value,
	edgeReduction: {
		top: useSettings().sheetTopEdgeReduction.value,
		right: useSettings().sheetRightEdgeReduction.value,
		bottom: useSettings().sheetBottomEdgeReduction.value,
		left: useSettings().sheetLeftEdgeReduction.value,
	},
};

const rightPaneRef = useTemplateRef<HTMLElement>("rightPane");

function createWorker() {
	const worker = new Worker(new URL("@/core/worker.ts", import.meta.url), {
		type: "module",
	});
	worker.addEventListener("message", (event) => {
		if (event.data.placedPanels) {
			placedPanels.value = event.data.placedPanels;
			totalPanels.value = event.data.totalPanels;
		} else {
			optimizationResult.value = event.data;
			optimizing.value = false;
			nextTick(() => {
				rightPaneRef.value?.scrollTo({ top: 0, behavior: "instant" });
			});
		}
	});
	return worker;
}

const optimizationResult: Ref<OptimizationResult | null> = ref(null);
const placedPanels = ref(0);
const totalPanels = ref(0);
const optimizing = ref(false);
let worker = createWorker();

function handleOptimize() {
	panelInPreview.value = null;
	const flattenedPanels = toRaw(panels.value).flatMap((p) =>
		Array<PanelTemplate>(p.quantity).fill(p.panel),
	);
	const request: OptimizationRequest = {
		sheetTemplate: sheet,
		panels: flattenedPanels,
		bladeThickness: toRaw(bladeThickness.value),
		depth: toRaw(optimizationDepth.value),
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

const panels = ref<{ panel: PanelTemplate; quantity: number }[]>([]);
function handlePanelAdd(panel: PanelTemplate, quantity: number) {
	panels.value.push({ panel, quantity });
	optimizationResult.value = null;
	panelInPreview.value = null;
}

const exportOptimizationDialog = useTemplateRef<HTMLDialogElement>("exportOptimizationDialog");
const optimizationExportData = computed(() => {
	return JSON.stringify(optimizationResult.value, null, 2);
});
function exportOptimization() {
	useJsonExport(optimizationExportData, "optimization");
}

const exportPanelsDialog = useTemplateRef<HTMLDialogElement>("exportPanelsDialog");
const panelsExportData = computed(() => {
	return JSON.stringify(panels.value, null, 2);
});
function exportPanels() {
	useJsonExport(panelsExportData, "panels");
}

const importPanelsDialog = useTemplateRef<HTMLDialogElement>("importPanelsDialog");
const importPanelsInput = useTemplateRef<HTMLInputElement>("importPanelsInput");
function importPanels() {
	const file = importPanelsInput.value?.files?.[0];
	if (!file) {
		alert("No file selected");
		return;
	}
	const reader = new FileReader();
	reader.onload = () => {
		try {
			const data = JSON.parse(reader.result as string);
			if (Array.isArray(data)) {
				panels.value = data;
			} else {
				throw new Error("Invalid data");
			}
		} catch (error) {
			console.error(error);
			alert("Invalid file");
		}
	};
	reader.readAsText(file);
}

const panelInPreview: Ref<PanelTemplate | null> = ref(null);
function handlePanelPreview(panel: PanelTemplate) {
	optimizationResult.value = null;
	panelInPreview.value = panel;
}
</script>

<template>
  <div class="flex h-full">
    <div
      class="w-80 md:w-96 bg-base-200 border-r border-base-300 hidden md:flex flex-col h-full shrink-0"
    >
      <div class="p-3 pb-2 border-b border-base-300/60 shrink-0">
        <div role="tablist" class="tabs tabs-box grid grid-cols-2 w-full">
          <button
            v-for="tab in tabList"
            :key="tab"
            role="tab"
            type="button"
            class="tab font-medium text-sm transition-all"
            :class="{
              'tab-active font-semibold shadow-xs': currentTab === tab,
            }"
            @click="currentTab = tab"
          >
            {{ tab }}
            <span
              v-if="tab === 'Panels' && panels.length > 0"
              class="badge badge-xs badge-neutral ml-1.5 font-mono"
            >
              {{ panels.reduce((sum, p) => sum + p.quantity, 0) }}
            </span>
          </button>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto min-h-0 p-3">
        <div v-if="currentTab === 'Panels'">
          <Panels v-model="panels" />
        </div>
        <div v-else-if="currentTab === 'Cuts'">
          <div role="alert" class="alert alert-warning">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span> This feature is not implemented yet </span>
          </div>
        </div>
      </div>
      <div class="p-3 border-t border-base-300 bg-base-200 shrink-0 flex flex-col gap-2">
        <div class="flex gap-2">
          <button
            @click="importPanelsDialog?.showModal()"
            class="btn btn-sm btn-outline flex-1 gap-1.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Import
          </button>
          <button
            v-if="panels.length !== 0"
            @click="exportPanelsDialog?.showModal()"
            class="btn btn-sm btn-outline flex-1 gap-1.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
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
            Export
          </button>
        </div>
        <button
          v-if="panels.length !== 0"
          class="btn btn-xs btn-ghost text-error/80 hover:text-error hover:bg-error/10 w-full"
          @click="panels = []"
        >
          Delete all panels
        </button>
      </div>
    </div>
    <div ref="rightPane" class="p-2 overflow-y-auto grow">
      <ControlPanel
        @add-panel="handlePanelAdd"
        @preview-panel="handlePanelPreview"
        @export="exportOptimizationDialog?.showModal()"
        @optimize="handleOptimize"
        @cancel="handleCancel"
        :disable-exporting="panels.length === 0"
        :optimizing
      />
      <div
        v-if="panels.length === 0"
        role="alert"
        class="alert alert-info mt-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-info"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
        <span>Add some panels first</span>
      </div>
      <div role="alert" class="alert alert-info mt-2 md:hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-info"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
        <span
          >To unleash the full potential of this app, use a larger screen</span
        >
      </div>
      <progress v-if="optimizing" class="progress progress-accent w-full" :value="placedPanels" :max="totalPanels"></progress>
      <OptimizationResults
        v-if="!optimizing && optimizationResult"
        :optimization="optimizationResult"
      />
      <PreviewOfPanel v-if="panelInPreview" :panelInPreview />
    </div>
  </div>
  <!-- Dialogs -->
  <dialog
    id="exportOptimizationDialog"
    ref="exportOptimizationDialog"
    class="modal"
  >
    <div class="modal-box">
      <h3 class="font-bold text-lg">Export</h3>
      <p class="py-4">
        Export results of the optimization to a JSON file. It does not include
        the list of panels.
      </p>
      <div class="mockup-code before:hidden max-h-[50vh] overflow-y-scroll">
        <pre><code>{{ optimizationExportData }}</code></pre>
      </div>
      <div class="modal-action">
        <form method="dialog" class="flex gap-2">
          <button @click="exportOptimization" class="btn btn-primary">
            Export
          </button>
          <button class="btn">Cancel</button>
        </form>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
  <dialog id="exportPanelsDialog" ref="exportPanelsDialog" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Export panels</h3>
      <p class="py-4">
        Export the list of panels to a JSON file, so you can import it later.
      </p>
      <div class="mockup-code before:hidden max-h-[50vh] overflow-y-scroll">
        <pre><code>{{ panelsExportData }}</code></pre>
      </div>
      <div class="modal-action">
        <form method="dialog" class="flex gap-2">
          <button @click="exportPanels" class="btn btn-primary">Export</button>
          <button class="btn">Cancel</button>
        </form>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
  <dialog id="importPanelsDialog" ref="importPanelsDialog" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Import panels</h3>
      <p class="py-4">Import panels from a JSON file exported from this app.</p>
      <div role="alert" class="alert alert-warning">
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
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span>This action will overwrite the current list of panels</span>
      </div>
      <div class="modal-action">
        <form method="dialog" class="flex gap-2">
          <input
            type="file"
            id="importPanelsInput"
            ref="importPanelsInput"
            class="file-input w-full"
          />
          <button class="btn btn-primary" @click="importPanels">Import</button>
          <button class="btn">Cancel</button>
        </form>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>
