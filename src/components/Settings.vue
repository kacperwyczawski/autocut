<script setup lang="ts">
import useSettings from "@/composables/useSettings";

const {
	edgeReductionButtons,
	searchDepth,
	searchWidth,
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
  <div class="space-y-6 pb-6 text-sm">
    <div>
      <h3 class="font-bold text-xs uppercase tracking-wider text-base-content/70 mb-3 flex items-center gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" />
        </svg>
        Raw Sheet
      </h3>
      <div class="grid grid-cols-2 gap-2 mb-3">
        <fieldset class="fieldset">
          <legend class="fieldset-legend text-xs">
            <span>Length</span>
            <span class="fieldset-label text-[10px]">mm</span>
          </legend>
          <input
            v-model.number="sheetLength"
            type="number"
            min="1"
            class="input input-sm w-full font-mono"
          />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend text-xs">
            <span>Width</span>
            <span class="fieldset-label text-[10px]">mm</span>
          </legend>
          <input
            v-model.number="sheetWidth"
            type="number"
            min="1"
            class="input input-sm w-full font-mono"
          />
        </fieldset>
      </div>

      <div class="rounded-box border border-base-300/80 bg-base-100 p-3 space-y-2">
        <div class="flex justify-between items-center text-xs font-semibold text-base-content/80">
          <span>Sheet Edge Trim</span>
          <span class="text-base-content/60 font-normal">mm</span>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <label class="input input-sm flex items-center gap-1.5">
            <span class="badge badge-primary badge-xs">Top</span>
            <input
              v-model.number="sheetTopEdgeReduction"
              type="number"
              min="0"
              class="grow font-mono text-xs"
            />
          </label>
          <label class="input input-sm flex items-center gap-1.5">
            <span class="badge badge-primary badge-xs">Right</span>
            <input
              v-model.number="sheetRightEdgeReduction"
              type="number"
              min="0"
              class="grow font-mono text-xs"
            />
          </label>
          <label class="input input-sm flex items-center gap-1.5">
            <span class="badge badge-primary badge-xs">Bottom</span>
            <input
              v-model.number="sheetBottomEdgeReduction"
              type="number"
              min="0"
              class="grow font-mono text-xs"
            />
          </label>
          <label class="input input-sm flex items-center gap-1.5">
            <span class="badge badge-primary badge-xs">Left</span>
            <input
              v-model.number="sheetLeftEdgeReduction"
              type="number"
              min="0"
              class="grow font-mono text-xs"
            />
          </label>
        </div>
        <div class="flex gap-1.5 pt-1">
          <button @click="fillWithFirst" class="btn btn-xs btn-ghost border border-base-300/60 flex-1">
            Fill with top
          </button>
          <button @click="fillWithZero" class="btn btn-xs btn-ghost border border-base-300/60 flex-1">
            Set to zero
          </button>
        </div>
      </div>
    </div>

    <div>
      <h3 class="font-bold text-xs uppercase tracking-wider text-base-content/70 mb-3 flex items-center gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="6" cy="6" r="3" />
          <path d="M8.12 8.12 12 12" />
          <path d="M20 4 8.12 15.88" />
          <circle cx="6" cy="18" r="3" />
          <path d="M14.8 14.8 20 20" />
        </svg>
        Saw Blade
      </h3>
      <fieldset class="fieldset">
        <legend class="fieldset-legend text-xs">
          <span>Blade Kerf / Thickness</span>
          <span class="fieldset-label text-[10px]">mm</span>
        </legend>
        <input
          v-model.number="bladeThickness"
          type="number"
          min="0"
          step="0.5"
          class="input input-sm w-full font-mono"
        />
      </fieldset>
    </div>

    <div>
      <h3 class="font-bold text-xs uppercase tracking-wider text-base-content/70 mb-3 flex items-center gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="14" height="14" x="8" y="8" rx="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
        Panels
      </h3>
      <div class="space-y-3">
        <label class="flex items-center justify-between p-2 rounded-box bg-base-100 border border-base-300/80 cursor-pointer">
          <div class="pr-2">
            <div class="font-semibold text-xs text-base-content">Allow rotation</div>
            <div class="text-[11px] text-base-content/60">Rotate panels 90° to optimize fit</div>
          </div>
          <input
            v-model="allowRotation"
            type="checkbox"
            class="toggle toggle-primary toggle-sm"
          />
        </label>

        <fieldset class="fieldset">
          <legend class="fieldset-legend text-xs">
            <span>Edge Banding Thickness</span>
            <span class="fieldset-label text-[10px]">mm</span>
          </legend>
          <input
            v-model.number="panelEdgeReduction"
            type="number"
            min="0"
            step="0.5"
            class="input input-sm w-full font-mono"
          />
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend text-xs">Edge Selector Style</legend>
          <select
            v-model="edgeReductionButtons"
            class="select select-sm w-full text-xs"
          >
            <option>Hidden</option>
            <option>Combined</option>
            <option>Separate</option>
          </select>
        </fieldset>
      </div>
    </div>

    <div class="pt-2 border-t border-base-300/60">
      <h3 class="font-bold text-xs uppercase tracking-wider text-error/90 mb-3 flex items-center gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        Optimizer Tuning
      </h3>
      <div class="space-y-3">
        <fieldset class="fieldset">
          <legend class="fieldset-legend text-xs">Search Depth (Lookahead)</legend>
          <input
            v-model.number="searchDepth"
            type="number"
            min="0"
            max="6"
            class="input input-sm w-full font-mono"
          />
          <p class="fieldset-label text-[10px]">Future panels to simulate (default: 2)</p>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend text-xs">Search Width (Beam)</legend>
          <input
            v-model.number="searchWidth"
            type="number"
            min="1"
            max="64"
            class="input input-sm w-full font-mono"
          />
          <p class="fieldset-label text-[10px]">Candidate layouts per step (default: 16)</p>
        </fieldset>

        <button class="btn btn-error btn-xs btn-outline w-full mt-2" @click="clearAllData">
          Reset all data and settings
        </button>
      </div>
    </div>
  </div>
</template>
