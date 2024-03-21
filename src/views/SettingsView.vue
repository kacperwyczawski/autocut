<script setup lang="ts">
import useSettings from "@/composables/useSettings";

// TODO: one composable to rule them all

const {
  edgeReductionButtons,
  sheetLength,
  sheetWidth,
  sheetEdgeReduction,
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
</script>
<template>
  <div class="px-2 md:mx-auto">
    <h2 class="text-2xl font-bold mt-4">App</h2>
    <label class="form-control w-full max-w-xs pl-4">
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
    <h2 class="text-2xl font-bold mt-4">Sheet</h2>
    <label class="form-control w-full max-w-xs pl-4">
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
    <label class="form-control w-full max-w-xs pl-4">
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
    <label class="form-control w-full max-w-xs pl-4">
      <div class="label">
        <span class="label-text">Edge reduction</span>
        <span class="label-text-alt">mm</span>
      </div>
      <input
        v-model="sheetEdgeReduction"
        type="number"
        min="0"
        class="input input-bordered w-full max-w-xs"
      />
    </label>

    <h2 class="text-2xl font-bold mt-4">Blade</h2>
    <label class="form-control w-full max-w-xs pl-4">
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

    <h2 class="text-2xl font-bold mt-4">Panels</h2>
    <label class="form-control w-full max-w-xs pl-4">
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

    <h2 class="text-2xl font-bold mt-4">Danger zone</h2>
    <div class="pl-4 mt-2 w-full max-w-xs">
      <button class="btn btn-error w-full" @click="clearAllData">
        Clear all data and settings
      </button>
    </div>
  </div>
</template>
