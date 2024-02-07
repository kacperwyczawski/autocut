<script setup lang="ts">
import ControlPanel from "@/components/ControlPanel.vue";
import Panels from "@/components/Panels.vue";
import OptimizationResults from "@/components/OptimizationResults.vue";
import type { Panel } from "@/core/panel";
import { ref, type Ref } from "vue";
import type { Sheet } from "@/core/sheet";

// tabs
const currentTab = ref("Panels");
const tabList = ["Panels", "Cuts"];

// optimization
const panels = ref<{ panel: Panel; quantity: number }[]>([]);
const bladeThickness = parseFloat(
  localStorage.getItem("bladeThickness") ?? "3",
);
const sheet: Sheet = {
  width: parseFloat(localStorage.getItem("sheetWidth") ?? "2800"),
  length: parseFloat(localStorage.getItem("sheetLength") ?? "2070"),
  edgeReduction: {
    top: true,
    bottom: true,
    left: true,
    right: true,
    thickness: parseFloat(localStorage.getItem("sheetEdgeReduction") ?? "0"),
  },
};

// export and import modals
const exportModal: Ref<HTMLDialogElement | null> = ref(null);
const importModal: Ref<HTMLDialogElement | null> = ref(null);
</script>

<template>
  <div class="drawer md:drawer-open">
    <input id="sidebar" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content p-2">
      <ControlPanel
        @add-panel="(panel, quantity) => panels.push({ panel, quantity })"
        @export="exportModal!.showModal()"
        @import="importModal!.showModal()"
        :disable-exporting="panels.length === 0"
      />
      <dialog id="exportModal" ref="exportModal" class="modal">
        <div class="modal-box">
          <h3 class="font-bold text-lg">Export</h3>
          <p class="py-4">
            Not implemented yet, press <kbd class="kbd">ESC</kbd> or click
            outside to close
          </p>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
      <dialog id="exportModal" ref="importModal" class="modal">
        <div class="modal-box">
          <h3 class="font-bold text-lg">Import</h3>
          <p class="py-4">
            Not implemented yet, press <kbd class="kbd">ESC</kbd> or click
            outside to close
          </p>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
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
        <span> Add some panels first </span>
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
        <span> You can open the sidebar by clicking the menu icon </span>
      </div>
      <OptimizationResults
        v-if="panels.length !== 0"
        :sheet
        :panels
        :blade-thickness="bladeThickness"
      />
    </div>
    <div class="drawer-side">
      <label
        for="sidebar"
        aria-label="close sidebar"
        class="drawer-overlay"
      ></label>
      <div class="p-2 min-w-[22rem] min-h-full bg-base-200">
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
          <button
            v-show="panels.length !== 0"
            class="btn btn-error btn-outline"
            @click="panels = []"
          >
            Delete all panels
          </button>
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
    </div>
  </div>
</template>
