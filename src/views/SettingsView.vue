<script setup lang="ts">
import useSettings from "@/composables/useSettings";

const {
	edgeReductionButtons,
	optimizationDepth,
	allowRotation,
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
    <fieldset class="fieldset mb-4 w-full max-w-xs">
      <legend class="fieldset-legend">Edge reduction buttons</legend>
      <select
        v-model="edgeReductionButtons"
        class="select w-full max-w-xs"
      >
        <option>Hidden</option>
        <option>Combined</option>
        <option>Separate</option>
      </select>
    </fieldset>
    <fieldset class="fieldset mb-4 w-full max-w-xs">
      <legend class="fieldset-legend">Optimization depth</legend>
      <input
        v-model="optimizationDepth"
        type="number"
        min="1"
        max="8"
        class="input w-full max-w-xs"
      />
      <p class="fieldset-label">
        Higher values -> more accurate optimization, but slower
      </p>
    </fieldset>
    <h2 class="text-2xl font-bold mt-8">Sheet</h2>
    <fieldset class="fieldset mb-4 w-full max-w-xs">
      <legend class="fieldset-legend">
        <span>Length</span>
        <span class="fieldset-label">mm</span>
      </legend>
      <input
        v-model="sheetLength"
        type="number"
        min="1"
        class="input w-full max-w-xs"
      />
    </fieldset>
    <fieldset class="fieldset mb-4 w-full max-w-xs">
      <legend class="fieldset-legend">
        <span>Width</span>
        <span class="fieldset-label">mm</span>
      </legend>
      <input
        v-model="sheetWidth"
        type="number"
        min="1"
        class="input w-full max-w-xs"
      />
    </fieldset>
    <div class="mb-4 w-full max-w-xs">
      <div class="flex justify-between items-center py-2 font-semibold text-xs text-base-content">
        <span>Edge reduction</span>
        <span class="text-base-content/60">mm</span>
      </div>
      <div class="space-y-2">
        <label class="input flex items-center gap-2">
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
        <label class="input flex items-center gap-2">
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
        <label class="input flex items-center gap-2">
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
        <label class="input flex items-center gap-2">
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
    </div>

    <h2 class="text-2xl font-bold mt-8">Blade</h2>
    <fieldset class="fieldset mb-4 w-full max-w-xs">
      <legend class="fieldset-legend">
        <span>Thickness</span>
        <span class="fieldset-label">mm</span>
      </legend>
      <input
        v-model="bladeThickness"
        type="number"
        min="1"
        class="input w-full max-w-xs"
      />
    </fieldset>

    <h2 class="text-2xl font-bold mt-8">Panels</h2>
    <fieldset class="fieldset mb-4 w-full max-w-xs">
      <label class="fieldset-label justify-between cursor-pointer">
        <span class="text-base font-medium text-base-content">Allow rotation</span>
        <input
          v-model="allowRotation"
          type="checkbox"
          class="toggle toggle-primary"
        />
      </label>
      <p class="fieldset-label">
        Rotate panels 90° during optimization to fit better
      </p>
    </fieldset>
    <fieldset class="fieldset mb-4 w-full max-w-xs">
      <legend class="fieldset-legend">
        <span>Edge reduction</span>
        <span class="fieldset-label">mm</span>
      </legend>
      <input
        v-model="panelEdgeReduction"
        type="number"
        min="0"
        class="input w-full max-w-xs"
      />
    </fieldset>

    <h2 class="text-2xl font-bold mt-8">Danger zone</h2>
    <div class="mt-2 w-full max-w-xs">
      <button class="btn btn-error w-full" @click="clearAllData">
        Clear all data and settings
      </button>
    </div>
  </div>
</template>
