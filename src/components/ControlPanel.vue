<script setup lang="ts">
import useSettings from "@/composables/useSettings";
import type { EdgeReduction } from "@/core/edgeReduction";
import type { PanelTemplate } from "@/core/panelTemplate";
import { type ComputedRef, computed, ref, useTemplateRef, watchEffect } from "vue";

const { edgeReductionButtons } = useSettings();

const length = ref(Number.NaN);
const width = ref(Number.NaN);
const quantity = ref(1);
const firstInput = useTemplateRef<HTMLInputElement>("firstInput");

const top = ref(false);
const right = ref(false);
const bottom = ref(false);
const left = ref(false);
const edgeReduction: ComputedRef<EdgeReduction> = computed(() => ({
	top: top.value,
	right: right.value,
	bottom: bottom.value,
	left: left.value,
	thickness: useSettings().bladeThickness.value,
}));

const emit = defineEmits<{
	addPanel: [panel: PanelTemplate, quantity: number];
	previewPanel: [panel: PanelTemplate];
	export: [];
	optimize: [];
	cancel: [];
}>();

defineProps<{
	disableExporting: boolean;
	optimizing: boolean;
}>();

function reset() {
	length.value = Number.NaN;
	width.value = Number.NaN;
	quantity.value = 1;
	firstInput.value?.focus();
	top.value = false;
	right.value = false;
	bottom.value = false;
	left.value = false;
}

function handlePanelAdd() {
	if (!length.value || !width.value || !quantity.value) return;
	emit(
		"addPanel",
		{
			length: length.value,
			width: width.value,
			edgeReduction: edgeReduction.value,
		},
		quantity.value,
	);
	reset();
}

watchEffect(() => {
	if (length.value && width.value) {
		emit("previewPanel", {
			length: length.value,
			width: width.value,
			edgeReduction: edgeReduction.value,
		});
	}
});
</script>
<template>
  <div
    @keyup.enter="handlePanelAdd"
    @keyup.ctrl.enter="$emit('optimize')"
    @keyup.alt.enter="$emit('export')"
    class="flex gap-2 flex-wrap items-end"
  >
    <fieldset class="fieldset grow">
      <legend class="fieldset-legend">
        <span>Length</span>
        <span class="fieldset-label">mm</span>
      </legend>
      <input
        v-model.number="length"
        type="number"
        min="1"
        class="input w-full"
        ref="firstInput"
      />
    </fieldset>
    <fieldset class="fieldset grow">
      <legend class="fieldset-legend">
        <span>Width</span>
        <span class="fieldset-label">mm</span>
      </legend>
      <input
        v-model.number="width"
        type="number"
        min="1"
        class="input w-full"
      />
    </fieldset>
    <fieldset class="fieldset grow">
      <legend class="fieldset-legend">
        <span>Quantity</span>
      </legend>
      <input
        v-model.number="quantity"
        type="number"
        min="1"
        class="input w-full"
      />
    </fieldset>
    <div
      :class="{
        'h-12 w-12 relative': edgeReductionButtons === 'Combined',
        'flex gap-2': edgeReductionButtons === 'Separate',
        hidden: edgeReductionButtons === 'Hidden',
      }"
    >
      <input
        v-model="top"
        type="checkbox"
        :class="{
          'absolute top-0 left-2 right-2 h-2 min-h-2 appearance-none btn btn-outline p-0 checked:btn-primary':
            edgeReductionButtons === 'Combined',
          'checkbox w-12 h-12 border-8 border-base-300 border-t-primary rounded-field':
            edgeReductionButtons === 'Separate',
        }"
      />
      <input
        v-model="right"
        type="checkbox"
        :class="{
          'absolute top-2 right-0 w-2 h-8 min-h-8 appearance-none btn btn-outline p-0 checked:btn-primary':
            edgeReductionButtons === 'Combined',
          'checkbox w-12 h-12 border-8 border-base-300 border-r-primary rounded-field':
            edgeReductionButtons === 'Separate',
        }"
      />
      <input
        v-model="bottom"
        type="checkbox"
        :class="{
          'absolute bottom-0 left-2 right-2 h-2 min-h-2 appearance-none btn btn-outline p-0 checked:btn-primary':
            edgeReductionButtons === 'Combined',
          'checkbox w-12 h-12 border-8 border-base-300 border-b-primary rounded-field':
            edgeReductionButtons === 'Separate',
        }"
      />
      <input
        v-model="left"
        type="checkbox"
        :class="{
          'absolute top-2 left-0 w-2 h-8 min-h-8 appearance-none btn btn-outline p-0 checked:btn-primary':
            edgeReductionButtons === 'Combined',
          'checkbox w-12 h-12 border-8 border-base-300 border-l-primary rounded-field':
            edgeReductionButtons === 'Separate',
        }"
      />
    </div>
    <div class="tooltip inline-flex mb-1" data-tip="Enter">
      <button @click="handlePanelAdd" class="btn btn-secondary">
        Add panel
      </button>
    </div>
    <div v-if="optimizing" class="tooltip inline-flex mb-1">
      <button @click="$emit('cancel')" class="btn btn-primary">
        Cancel
      </button>
    </div>
    <div v-else class="tooltip inline-flex mb-1" data-tip="Ctrl + Enter">
      <button @click="$emit('optimize')" class="btn btn-primary">
        Optimize
      </button>
    </div>
    <div class="tooltip inline-flex mb-1" data-tip="Alt + Enter">
      <button @click="$emit('export')" :disabled="disableExporting" class="btn">
        Export results
      </button>
    </div>
  </div>
</template>
