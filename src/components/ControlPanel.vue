<script setup lang="ts">
import type { Panel } from "@/core/panel";
import { ref } from "vue";

const edgeReductionButtons =
  localStorage.getItem("edgeReductionButtons") || "Combined";

const length = ref(NaN);
const width = ref(NaN);
const quantity = ref(1);
const firstInput = ref<HTMLInputElement>(null!);
const top = ref(false);
const right = ref(false);
const bottom = ref(false);
const left = ref(false);

const emit = defineEmits<{
  addPanel: [panel: Panel, quantity: number];
  export: [];
  optimize: [];
}>();

defineProps<{
  disableExporting: boolean;
}>();

function reset() {
  length.value = NaN;
  width.value = NaN;
  quantity.value = 1;
  firstInput.value.focus();
  top.value = false;
  right.value = false;
  bottom.value = false;
  left.value = false;
}

function addPanel() {
  if (!length.value || !width.value || !quantity.value) return;
  emit(
    "addPanel",
    {
      length: length.value,
      width: width.value,
      edgeReduction: {
        top: top.value,
        right: right.value,
        bottom: bottom.value,
        left: left.value,
        thickness: parseInt(localStorage.getItem("panelEdgeReduction") || "3"),
      },
    },
    quantity.value,
  );
  reset();
}
</script>
<template>
  <div @keyup.enter="addPanel" class="flex gap-2 flex-wrap items-end">
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
    <div v-if="edgeReductionButtons === 'Combined'" class="h-12 w-12 relative">
      <input
        v-model="top"
        type="checkbox"
        class="absolute top-0 left-2 right-2 h-2 min-h-2 appearance-none btn btn-outline p-0 checked:btn-primary"
      />
      <input
        v-model="right"
        type="checkbox"
        class="absolute top-2 right-0 w-2 h-8 min-h-8 appearance-none btn btn-outline p-0 checked:btn-primary"
      />
      <input
        v-model="bottom"
        type="checkbox"
        class="absolute bottom-0 left-2 right-2 h-2 min-h-2 appearance-none btn btn-outline p-0 checked:btn-primary"
      />
      <input
        v-model="left"
        type="checkbox"
        class="absolute top-2 left-0 w-2 h-8 min-h-8 appearance-none btn btn-outline p-0 checked:btn-primary"
      />
    </div>
    <div v-else-if="edgeReductionButtons === 'Separate'" class="flex gap-2">
      <input
        v-model="top"
        type="checkbox"
        class="checkbox w-12 h-12 [--chkbg:theme(colors.base-100)] [--chkfg:theme(colors.base-content)] border-8 border-base-300 border-t-primary rounded-btn"
      />
      <input
        v-model="right"
        type="checkbox"
        class="checkbox w-12 h-12 [--chkbg:theme(colors.base-100)] [--chkfg:theme(colors.base-content)] border-8 border-base-300 border-r-primary rounded-btn"
      />
      <input
        v-model="bottom"
        type="checkbox"
        class="checkbox w-12 h-12 [--chkbg:theme(colors.base-100)] [--chkfg:theme(colors.base-content)] border-8 border-base-300 border-b-primary rounded-btn"
      />
      <input
        v-model="left"
        type="checkbox"
        class="checkbox w-12 h-12 [--chkbg:theme(colors.base-100)] [--chkfg:theme(colors.base-content)] border-8 border-base-300 border-l-primary rounded-btn"
      />
    </div>
    <button @click="addPanel" class="btn btn-secondary">Add panel</button>
    <button @click="$emit('optimize')" class="btn btn-primary">Optimize</button>
    <button @click="$emit('export')" :disabled="disableExporting" class="btn">
      Export results
    </button>
  </div>
</template>
