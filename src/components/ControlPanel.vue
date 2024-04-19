<script setup lang="ts">
import useSettings from "@/composables/useSettings";
import type { EdgeReduction } from "@/core/edgeReduction";
import type { PanelTemplate } from "@/core/panelTemplate";
import { type ComputedRef, computed, ref, watchEffect } from "vue";

const { edgeReductionButtons } = useSettings();

const length = ref(Number.NaN);
const width = ref(Number.NaN);
const quantity = ref(1);
const firstInput = ref<HTMLInputElement>(null!);

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
}>();

defineProps<{
	disableExporting: boolean;
}>();

function reset() {
	length.value = Number.NaN;
	width.value = Number.NaN;
	quantity.value = 1;
	firstInput.value.focus();
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
    <label class="form-control grow">
      <div class="label">
        <span class="label-text">Length</span>
        <span class="label-text-alt">mm</span>
      </div>
      <input
        v-model.number="length"
        type="number"
        min="1"
        class="input input-bordered"
        ref="firstInput"
      />
    </label>
    <label class="form-control grow">
      <div class="label">
        <span class="label-text">Width</span>
        <span class="label-text-alt">mm</span>
      </div>
      <input
        v-model.number="width"
        type="number"
        min="1"
        class="input input-bordered"
      />
    </label>
    <label class="form-control grow">
      <div class="label">
        <span class="label-text">Quantity</span>
      </div>
      <input
        v-model.number="quantity"
        type="number"
        min="1"
        class="input input-bordered"
      />
    </label>
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
          'checkbox w-12 h-12 [--chkbg:theme(colors.base-100)] [--chkfg:theme(colors.base-content)] border-8 border-base-300 border-t-primary rounded-btn':
            edgeReductionButtons === 'Separate',
        }"
      />
      <input
        v-model="right"
        type="checkbox"
        :class="{
          'absolute top-2 right-0 w-2 h-8 min-h-8 appearance-none btn btn-outline p-0 checked:btn-primary':
            edgeReductionButtons === 'Combined',
          'checkbox w-12 h-12 [--chkbg:theme(colors.base-100)] [--chkfg:theme(colors.base-content)] border-8 border-base-300 border-r-primary rounded-btn':
            edgeReductionButtons === 'Separate',
        }"
      />
      <input
        v-model="bottom"
        type="checkbox"
        :class="{
          'absolute bottom-0 left-2 right-2 h-2 min-h-2 appearance-none btn btn-outline p-0 checked:btn-primary':
            edgeReductionButtons === 'Combined',
          'checkbox w-12 h-12 [--chkbg:theme(colors.base-100)] [--chkfg:theme(colors.base-content)] border-8 border-base-300 border-b-primary rounded-btn':
            edgeReductionButtons === 'Separate',
        }"
      />
      <input
        v-model="left"
        type="checkbox"
        :class="{
          'absolute top-2 left-0 w-2 h-8 min-h-8 appearance-none btn btn-outline p-0 checked:btn-primary':
            edgeReductionButtons === 'Combined',
          'checkbox w-12 h-12 [--chkbg:theme(colors.base-100)] [--chkfg:theme(colors.base-content)] border-8 border-base-300 border-l-primary rounded-btn':
            edgeReductionButtons === 'Separate',
        }"
      />
    </div>
    <button @click="handlePanelAdd" class="btn btn-secondary">Add panel</button>
    <button @click="$emit('optimize')" class="btn btn-primary">Optimize</button>
    <button @click="$emit('export')" :disabled="disableExporting" class="btn">
      Export results
    </button>
  </div>
</template>
