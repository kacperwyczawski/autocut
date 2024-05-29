<script setup lang="ts">
import useSettings from "@/composables/useSettings";

const {
	edgeReductionButtons,
	optimizationDepth,
	sheetLength,
	sheetWidth,
	sheetTopEdgeReduction,
	sheetRightEdgeReduction,
	sheetBottomEdgeReduction,
	sheetLeftEdgeReduction,
	bladeThickness,
	panelEdgeReduction,
} = useSettings();

function clearAllData() {
	if (
		confirm("Are you sure? All application data and settings will be cleared.")
	) {
		localStorage.clear();
		location.reload();
	}
}

function fillWithFirst() {
	const value = sheetTopEdgeReduction.value;
	sheetRightEdgeReduction.value = value;
	sheetBottomEdgeReduction.value = value;
	sheetLeftEdgeReduction.value = value;
}

function fillWithZero() {
	sheetTopEdgeReduction.value = 0;
	sheetRightEdgeReduction.value = 0;
	sheetBottomEdgeReduction.value = 0;
	sheetLeftEdgeReduction.value = 0;
}
</script>
<template>
  <div class="px-2 md:mx-auto">
    <h2 class="text-2xl font-bold mt-8">App</h2>
    <label class="form-control mb-4 w-full max-w-xs">
      <div class="label">
        <span class="label-text">Edge reduction buttons</span>
      </div>
      <select
        v-model="edgeReductionButtons"
        class="select select-bordered w-full max-w-xs"
      >
        <option>Hidden</option>
        <option>Combined</option>
        <option>Separate</option>
      </select>
    </label>
    <label class="form-control mb-4 w-full max-w-xs">
      <div class="label">
        <span class="label-text">Optimization depth</span>
      </div>
      <input
        v-model="optimizationDepth"
        type="number"
        min="1"
        max="8"
        class="input input-bordered w-full max-w-xs"
      />
      <div class="label">
        <span class="label-text-alt">
          Higher values -> more accurate optimization, but slower
        </span>
      </div>
    </label>
    <h2 class="text-2xl font-bold mt-8">Sheet</h2>
    <label class="form-control mb-4 w-full max-w-xs">
      <div class="label">
        <span class="label-text">Length</span>
        <span class="label-text-alt">mm</span>
      </div>
      <input
        v-model="sheetLength"
        type="number"
        min="1"
        class="input input-bordered w-full max-w-xs"
      />
    </label>
    <label class="form-control mb-4 w-full max-w-xs">
      <div class="label">
        <span class="label-text">Width</span>
        <span class="label-text-alt">mm</span>
      </div>
      <input
        v-model="sheetWidth"
        type="number"
        min="1"
        class="input input-bordered w-full max-w-xs"
      />
    </label>
    <div class="label">
      <span class="label-text">Edge reduction</span>
      <span class="label-text-alt">mm</span>
    </div>
    <div class="space-y-2">
      <label class="input input-bordered flex items-center gap-2">
        <input
          v-model="sheetTopEdgeReduction"
          type="number"
          min="0"
          class="grow"
        />
        <span class="badge badge-primary badge-lg">
          Top
        </span>
      </label>
      <label class="input input-bordered flex items-center gap-2">
        <input
          v-model="sheetRightEdgeReduction"
          type="number"
          min="0"
          class="grow"
        />
        <span class="badge badge-primary badge-lg">
          Right
        </span>
      </label>
      <label class="input input-bordered flex items-center gap-2">
        <input
          v-model="sheetBottomEdgeReduction"
          type="number"
          min="0"
          class="grow"
        />
        <span class="badge badge-primary badge-lg">
          Bottom
        </span>
      </label>
      <label class="input input-bordered flex items-center gap-2">
        <input
          v-model="sheetLeftEdgeReduction"
          type="number"
          min="0"
          class="grow"
        />
        <span class="badge badge-primary badge-lg">
          Left
        </span>
      </label>
      <div class="grid gap-2 grid-cols-2">
        <button @click="fillWithFirst" class="btn btn-xs tracking-wide">Fill all with first value</button>
        <button @click="fillWithZero" class="btn btn-xs tracking-wide">Set all to zero</button>
      </div>
    </div>

    <h2 class="text-2xl font-bold mt-8">Blade</h2>
    <label class="form-control mb-4 w-full max-w-xs">
      <div class="label">
        <span class="label-text">Thickness</span>
        <span class="label-text-alt">mm</span>
      </div>
      <input
        v-model="bladeThickness"
        type="number"
        min="1"
        class="input input-bordered w-full max-w-xs"
      />
    </label>

    <h2 class="text-2xl font-bold mt-8">Panels</h2>
    <label class="form-control mb-4 w-full max-w-xs">
      <div class="label">
        <span class="label-text">Edge reduction</span>
        <span class="label-text-alt">mm</span>
      </div>
      <input
        v-model="panelEdgeReduction"
        type="number"
        min="0"
        class="input input-bordered w-full max-w-xs"
      />
    </label>

    <h2 class="text-2xl font-bold mt-8">Danger zone</h2>
    <div class="mt-2 w-full max-w-xs">
      <button class="btn btn-error w-full" @click="clearAllData">
        Clear all data and settings
      </button>
    </div>
  </div>
</template>
