<script setup lang="ts">
import ControlPanel from "@/components/ControlPanel.vue";
import Cuts from "@/components/Cuts.vue";
import OptimizationResults from "@/components/OptimizationResults.vue";
import Panels from "@/components/Panels.vue";
import PreviewOfPanel from "@/components/PreviewOfPanel.vue";
import { parsePro100 } from "@/core/pro100";
import useJsonExport from "@/composables/useJsonExport";
import useSettings from "@/composables/useSettings";
import type { OptimizationRequest } from "@/core/optimizationRequest";
import type { OptimizationResult } from "@/core/optimizationResult";
import type { PanelTemplate } from "@/core/panelTemplate";
import type { SheetTemplate } from "@/core/sheetTemplate";
import { type Ref, computed, nextTick, ref, toRaw, useTemplateRef } from "vue";

const currentTab = ref("Panels");
const tabList = ["Panels", "Cuts"];

const {
	bladeThickness,
	searchDepth,
	searchWidth,
	allowRotation,
	panelEdgeReduction,
} = useSettings();

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
const hoveredPanel = ref<{ length: number; width: number } | null>(null);
const hoveredCut = ref<{ sheetIndex: number; cutIndex: number } | null>(null);
const placedPanels = ref(0);
const totalPanels = ref(0);
const optimizing = ref(false);
let worker = createWorker();

const totalCutsCount = computed(() => {
	if (
		!optimizationResult.value ||
		typeof optimizationResult.value === "string"
	) {
		return 0;
	}
	return optimizationResult.value.sheets.reduce(
		(sum, s) => sum + s.cuts.length,
		0,
	);
});

function handleOptimize() {
	panelInPreview.value = null;
	const flattenedPanels = toRaw(panels.value).flatMap((p) =>
		Array<PanelTemplate>(p.quantity).fill(p.panel),
	);
	const request: OptimizationRequest = {
		sheetTemplate: sheet,
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

const panels = ref<{ panel: PanelTemplate; quantity: number }[]>([]);
function handlePanelAdd(panel: PanelTemplate, quantity: number) {
	panels.value.push({ panel, quantity });
	optimizationResult.value = null;
	panelInPreview.value = null;
}

const exportOptimizationDialog = useTemplateRef<HTMLDialogElement>(
	"exportOptimizationDialog",
);
const optimizationExportData = computed(() => {
	return JSON.stringify(optimizationResult.value, null, 2);
});
function exportOptimization() {
	useJsonExport(optimizationExportData, "optimization");
}

const exportPanelsDialog =
	useTemplateRef<HTMLDialogElement>("exportPanelsDialog");
const panelsExportData = computed(() => {
	return JSON.stringify(panels.value, null, 2);
});
function exportPanels() {
	useJsonExport(panelsExportData, "panels");
}

const importPanelsDialog =
	useTemplateRef<HTMLDialogElement>("importPanelsDialog");
const importPanelsInput = useTemplateRef<HTMLInputElement>("importPanelsInput");
const importPro100FileInput =
	useTemplateRef<HTMLInputElement>("importPro100FileInput");

const importFormat = ref<"autocut" | "pro100">("autocut");
const pro100Text = ref("");
const importMode = ref<"replace" | "append">("replace");

const parsedPro100Preview = computed(() => {
	if (!pro100Text.value.trim()) return [];
	return parsePro100(pro100Text.value, {
		defaultEdgeThickness: panelEdgeReduction.value || bladeThickness.value || 0,
	});
});

const parsedPro100TotalPieces = computed(() => {
	return parsedPro100Preview.value.reduce(
		(sum, item) => sum + item.quantity,
		0,
	);
});

function handlePro100FileChange(event: Event) {
	const target = event.target as HTMLInputElement;
	const file = target.files?.[0];
	if (!file) return;
	const reader = new FileReader();
	reader.onload = () => {
		pro100Text.value = (reader.result as string) || "";
	};
	reader.readAsText(file);
}

function handleImport() {
	if (importFormat.value === "autocut") {
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
					if (importMode.value === "append") {
						panels.value = [...panels.value, ...data];
					} else {
						panels.value = data;
					}
					optimizationResult.value = null;
					panelInPreview.value = null;
					importPanelsDialog.value?.close();
				} else {
					throw new Error("Invalid data");
				}
			} catch (error) {
				console.error(error);
				alert("Invalid AutoCut JSON file");
			}
		};
		reader.readAsText(file);
	} else {
		const items = parsedPro100Preview.value;
		if (items.length === 0) {
			alert(
				"No valid panels found. Make sure the list is tab-separated PRO100 data.",
			);
			return;
		}
		if (importMode.value === "append") {
			panels.value = [...panels.value, ...items];
		} else {
			panels.value = items;
		}
		optimizationResult.value = null;
		panelInPreview.value = null;
		pro100Text.value = "";
		if (importPro100FileInput.value) {
			importPro100FileInput.value.value = "";
		}
		importPanelsDialog.value?.close();
	}
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
            <span
              v-else-if="tab === 'Cuts' && totalCutsCount > 0"
              class="badge badge-xs badge-neutral ml-1.5 font-mono"
            >
              {{ totalCutsCount }}
            </span>
          </button>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto min-h-0 p-3">
        <div v-if="currentTab === 'Panels'">
          <Panels
            v-model="panels"
            :hovered-panel="hoveredPanel"
            @hover-panel="hoveredPanel = $event"
          />
        </div>
        <div v-else-if="currentTab === 'Cuts'">
          <Cuts
            :optimization="optimizationResult"
            :hovered-cut="hoveredCut"
            @hover-cut="hoveredCut = $event"
          />
        </div>
      </div>
      <div class="p-3 border-t border-base-300 bg-base-200 shrink-0 flex flex-col gap-2">
        <div v-if="currentTab === 'Panels'" class="flex gap-2">
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
        :hovered-panel="hoveredPanel"
        :hovered-cut="hoveredCut"
        @hover-panel="hoveredPanel = $event"
        @hover-cut="hoveredCut = $event"
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
    <div class="modal-box max-w-xl">
      <h3 class="font-bold text-lg mb-3">Import panels</h3>

      <!-- Format selector tabs -->
      <div role="tablist" class="tabs tabs-box grid grid-cols-2 mb-4">
        <button
          type="button"
          role="tab"
          class="tab font-medium text-sm transition-all"
          :class="{
            'tab-active font-semibold shadow-xs': importFormat === 'autocut',
          }"
          @click="importFormat = 'autocut'"
        >
          AutoCut (JSON)
        </button>
        <button
          type="button"
          role="tab"
          class="tab font-medium text-sm transition-all"
          :class="{
            'tab-active font-semibold shadow-xs': importFormat === 'pro100',
          }"
          @click="importFormat = 'pro100'"
        >
          PRO100
        </button>
      </div>

      <!-- AutoCut format pane -->
      <div v-if="importFormat === 'autocut'" class="space-y-3">
        <p class="text-sm text-base-content/80">
          Import panels from a JSON file previously exported from AutoCut.
        </p>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Select JSON file</legend>
          <input
            type="file"
            id="importPanelsInput"
            ref="importPanelsInput"
            accept=".json,application/json"
            class="file-input w-full"
          />
        </fieldset>
      </div>

      <!-- PRO100 format pane -->
      <div v-else class="space-y-3">
        <p class="text-sm text-base-content/80">
          Paste tab-separated cut list copied from PRO100 or load a text export. Material and board thickness are automatically ignored.
        </p>
        <fieldset class="fieldset">
          <div class="flex justify-between items-center mb-1">
            <legend class="fieldset-legend m-0 p-0">Paste PRO100 cut list</legend>
            <span
              v-if="parsedPro100Preview.length > 0"
              class="badge badge-sm badge-success font-mono"
            >
              {{ parsedPro100Preview.length }} panels ({{ parsedPro100TotalPieces }} pcs)
            </span>
          </div>
          <textarea
            v-model="pro100Text"
            class="textarea textarea-bordered w-full font-mono text-xs h-32"
            placeholder="BOK&#9;800&#9;-&#9;800&#9;&#9;18&#9;1&#9;Kolory\biały mat&#10;BOK&#9;400&#9;=&#9;823&#9;-&#9;18&#9;2&#9;Kolory\biały mat"
          ></textarea>
        </fieldset>
        <div class="divider text-xs text-base-content/50 my-1">OR</div>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Upload text file (.txt / .tsv / .csv)</legend>
          <input
            type="file"
            ref="importPro100FileInput"
            accept=".txt,.tsv,.csv,.roz,text/plain"
            @change="handlePro100FileChange"
            class="file-input file-input-sm w-full"
          />
        </fieldset>
      </div>

      <!-- Mode selection: Replace vs Append -->
      <div class="mt-4 pt-3 border-t border-base-300 flex items-center justify-between">
        <div class="flex gap-4">
          <label class="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="radio"
              v-model="importMode"
              value="replace"
              name="importMode"
              class="radio radio-sm radio-primary"
            />
            <span>Replace current panels</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="radio"
              v-model="importMode"
              value="append"
              name="importMode"
              class="radio radio-sm radio-primary"
            />
            <span>Append to list</span>
          </label>
        </div>
      </div>

      <div class="modal-action mt-4">
        <button type="button" class="btn btn-primary" @click="handleImport">
          Import
        </button>
        <form method="dialog">
          <button class="btn">Cancel</button>
        </form>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>
