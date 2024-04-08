<script setup lang="ts">
import ControlPanel from "@/components/ControlPanel.vue";
import OptimizationResults from "@/components/OptimizationResults.vue";
import Panels from "@/components/Panels.vue";
import PreviewOfPanel from "@/components/PreviewOfPanel.vue";
import useJsonExport from "@/composables/useJsonExport";
import useSettings from "@/composables/useSettings";
import type { OptimizationResult } from "@/core/optimizationResult";
import { optimize } from "@/core/optimize";
import type { Panel } from "@/core/panel";
import type { Sheet } from "@/core/sheet";
import { type Ref, computed, ref } from "vue";

const currentTab = ref("Panels");
const tabList = ["Panels", "Cuts"];

const { bladeThickness } = useSettings();

const sheet: Sheet = {
	width: useSettings().sheetWidth.value,
	length: useSettings().sheetLength.value,
	edgeReduction: {
		top: true,
		bottom: true,
		left: true,
		right: true,
		thickness: useSettings().bladeThickness.value,
	},
};

const optimizationResult: Ref<OptimizationResult | null> = ref(null);
function handleOptimize() {
	panelInPreview.value = null;
	const flattenedPanels = panels.value.flatMap((p) =>
		Array<Panel>(p.quantity).fill(p.panel),
	);
	optimizationResult.value = optimize(
		sheet,
		flattenedPanels,
		bladeThickness.value,
	);
}

const panels = ref<{ panel: Panel; quantity: number }[]>([]);
function handlePanelAdd(panel: Panel, quantity: number) {
	panels.value.push({ panel, quantity });
	optimizationResult.value = null;
	panelInPreview.value = null;
}

const exportOptimizationDialog: Ref<HTMLDialogElement> = ref(null!);
const optimizationExportData = computed(() => {
	return JSON.stringify(optimizationResult.value, null, 2);
});
function exportOptimization() {
	useJsonExport(optimizationExportData, "optimization");
}

const exportPanelsDialog: Ref<HTMLDialogElement> = ref(null!);
const panelsExportData = computed(() => {
	return JSON.stringify(panels.value, null, 2);
});
function exportPanels() {
	useJsonExport(panelsExportData, "panels");
}

const importPanelsDialog: Ref<HTMLDialogElement> = ref(null!);
const importPanelsInput: Ref<HTMLInputElement> = ref(null!);
function importPanels() {
	const file = importPanelsInput.value.files?.[0];
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

const panelInPreview: Ref<Panel | null> = ref(null);
function handlePanelPreview(panel: Panel) {
	optimizationResult.value = null;
	panelInPreview.value = panel;
}
</script>

<template>
  <div class="flex h-full">
    <div
      class="p-2 min-w-[22rem] bg-base-200 hidden md:block shrink-0 overflow-y-scroll"
    >
      <div role="tablist" class="tabs tabs-boxed p-0">
        <a
          v-for="tab in tabList"
          :key="tab"
          role="tab"
          class="tab"
          :class="{
            'bg-secondary text-secondary-content': currentTab === tab,
          }"
          @click="currentTab = tab"
        >
          {{ tab }}
        </a>
      </div>
      <div v-if="currentTab === 'Panels'">
        <Panels v-model="panels" />
        <div class="join">
          <button
            v-if="panels.length !== 0"
            class="btn btn-error btn-outline join-item"
            @click="panels = []"
          >
            Delete all panels
          </button>
          <button
            v-if="panels.length !== 0"
            @click="exportPanelsDialog.showModal()"
            class="btn btn-outline join-item"
          >
            Export panels
          </button>
          <button
            @click="importPanelsDialog.showModal()"
            class="btn btn-outline join-item"
          >
            Import panels
          </button>
        </div>
      </div>
      <div v-else-if="currentTab === 'Cuts'">
        <div role="alert" class="alert alert-warning mt-2">
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
    <div class="p-2 overflow-y-scroll grow">
      <ControlPanel
        @add-panel="handlePanelAdd"
        @preview-panel="handlePanelPreview"
        @export="exportOptimizationDialog.showModal()"
        @optimize="handleOptimize"
        :disable-exporting="panels.length === 0"
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
      <OptimizationResults
        v-if="optimizationResult"
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
            class="file-input file-input-bordered w-full"
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
