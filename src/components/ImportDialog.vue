<script setup lang="ts">
import useSettings from "@/composables/useSettings";
import type { PanelTemplate } from "@/core/panelTemplate";
import { parsePro100 } from "@/core/pro100";
import { ref, useTemplateRef } from "vue";

const emit = defineEmits<{
	(
		e: "import",
		panels: { panel: PanelTemplate; quantity: number }[],
		mode: "replace" | "append",
	): void;
}>();

const { panelEdgeReduction, bladeThickness } = useSettings();

const dialogRef = useTemplateRef<HTMLDialogElement>("dialogRef");
const jsonInputRef = useTemplateRef<HTMLInputElement>("jsonInputRef");
const pro100InputRef = useTemplateRef<HTMLInputElement>("pro100InputRef");

const importFormat = ref<"autocut" | "pro100">("autocut");
const importMode = ref<"replace" | "append">("replace");

function handleImport() {
	if (importFormat.value === "autocut") {
		const file = jsonInputRef.value?.files?.[0];
		if (!file) {
			alert("No file selected");
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			try {
				const data = JSON.parse(reader.result as string);
				if (Array.isArray(data)) {
					emit("import", data, importMode.value);
					dialogRef.value?.close();
					if (jsonInputRef.value) jsonInputRef.value.value = "";
				} else {
					throw new Error("Invalid data format");
				}
			} catch (error) {
				console.error(error);
				alert("Invalid AutoCut JSON file");
			}
		};
		reader.readAsText(file);
	} else {
		const file = pro100InputRef.value?.files?.[0];
		if (!file) {
			alert("No file selected");
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			try {
				const text = (reader.result as string) || "";
				const items = parsePro100(text, {
					defaultEdgeThickness:
						panelEdgeReduction.value || bladeThickness.value || 0,
				});
				if (items.length === 0) {
					alert(
						"No valid panels found. Make sure the file contains tab-separated PRO100 data.",
					);
					return;
				}
				emit("import", items, importMode.value);
				dialogRef.value?.close();
				if (pro100InputRef.value) pro100InputRef.value.value = "";
			} catch (error) {
				console.error(error);
				alert("Failed to parse PRO100 file");
			}
		};
		reader.readAsText(file);
	}
}

defineExpose({
	showModal: () => dialogRef.value?.showModal(),
	close: () => dialogRef.value?.close(),
});
</script>

<template>
  <dialog ref="dialogRef" class="modal">
    <div class="modal-box max-w-xl">
      <h3 class="font-bold text-lg mb-3">Import panels</h3>

      <div role="tablist" class="tabs tabs-box grid grid-cols-2 mb-4">
        <button
          type="button"
          role="tab"
          class="tab font-medium text-sm transition-all"
          :class="{ 'tab-active font-semibold shadow-xs': importFormat === 'autocut' }"
          @click="importFormat = 'autocut'"
        >
          AutoCut (JSON)
        </button>
        <button
          type="button"
          role="tab"
          class="tab font-medium text-sm transition-all"
          :class="{ 'tab-active font-semibold shadow-xs': importFormat === 'pro100' }"
          @click="importFormat = 'pro100'"
        >
          PRO100
        </button>
      </div>

      <div v-if="importFormat === 'autocut'" class="space-y-3">
        <p class="text-sm text-base-content/80">
          Import panels from a JSON file previously exported from AutoCut.
        </p>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Select JSON file</legend>
          <input
            ref="jsonInputRef"
            type="file"
            accept=".json,application/json"
            class="file-input w-full"
          />
        </fieldset>
      </div>

      <div v-else class="space-y-3">
        <p class="text-sm text-base-content/80">
          Import tab-separated cut list exported from PRO100 (.txt, .tsv, .csv). Material and board thickness are automatically ignored.
        </p>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Select PRO100 file</legend>
          <input
            ref="pro100InputRef"
            type="file"
            accept=".txt,.tsv,.csv,.roz,text/plain"
            class="file-input w-full"
          />
        </fieldset>
      </div>

      <div class="mt-4 pt-3 border-t border-base-300 flex items-center justify-between">
        <div class="flex gap-4">
          <label class="flex items-center gap-2 cursor-pointer text-sm">
            <input
              v-model="importMode"
              type="radio"
              value="replace"
              name="importMode"
              class="radio radio-sm radio-primary"
            />
            <span>Replace current panels</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer text-sm">
            <input
              v-model="importMode"
              type="radio"
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
