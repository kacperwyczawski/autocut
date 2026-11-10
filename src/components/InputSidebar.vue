<script setup lang="ts">
import Panels from "@/components/Panels.vue";
import Settings from "@/components/Settings.vue";
import useSettings from "@/composables/useSettings";
import type { PanelTemplate } from "@/core/panelTemplate";
import { ref } from "vue";

const panels = defineModel<{ panel: PanelTemplate; quantity: number }[]>({
	required: true,
});

defineProps<{
	hoveredPanel?: { length: number; width: number } | null;
}>();

const emit = defineEmits<{
	(e: "hover-panel", panel: { length: number; width: number } | null): void;
	(e: "open-import"): void;
	(e: "open-export"): void;
}>();

const commitHash = __COMMIT_HASH__;

const themes = [
	"light",
	"dark",
	"cupcake",
	"bumblebee",
	"synthwave",
	"retro",
	"cyberpunk",
	"dracula",
	"night",
	"coffee",
	"dim",
	"nord",
];

const leftTab = ref<"Panels" | "Settings">("Panels");
const { currentTheme } = useSettings();
</script>

<template>
  <aside class="w-80 xl:w-96 bg-base-200 border-r border-base-300 flex flex-col h-full shrink-0">
    <div class="p-3 border-b border-base-300 flex items-center justify-between shrink-0 gap-2">
      <div class="flex items-center gap-2 min-w-0">
        <span class="text-lg font-black tracking-tight shrink-0">AutoCut</span>
        <a
          href="https://github.com/kacperwyczawski/autocut/commits/main/"
          target="_blank"
          rel="noopener noreferrer"
          class="badge badge-xs font-mono hover:badge-primary shrink-0"
          title="Commit on GitHub"
        >
          {{ commitHash }}
        </a>
      </div>

      <div class="flex items-center gap-1 shrink-0">
        <div class="dropdown dropdown-end">
          <button
            tabindex="0"
            type="button"
            class="btn btn-ghost btn-xs gap-1 font-normal capitalize"
            title="Change theme"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 10 10 0 0 0 0-20" />
            </svg>
            {{ currentTheme }}
            <svg
              width="8px"
              height="8px"
              class="opacity-60"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 2048 2048"
            >
              <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
            </svg>
          </button>
          <ul
            tabindex="0"
            class="dropdown-content z-50 p-2 shadow-2xl bg-base-300 rounded-box w-44 max-h-72 overflow-y-auto space-y-1"
          >
            <li v-for="theme in themes" :key="theme">
              <input
                v-model="currentTheme"
                type="radio"
                name="theme-dropdown"
                class="theme-controller btn btn-xs btn-block btn-ghost justify-start capitalize"
                :aria-label="theme"
                :value="theme"
              />
            </li>
          </ul>
        </div>

        <a
          href="https://github.com/kacperwyczawski/autocut/commits/main/"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-ghost btn-xs btn-square"
          title="Changelog"
          aria-label="Changelog"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </a>

        <a
          href="https://github.com/kacperwyczawski/autocut"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-ghost btn-xs btn-square"
          title="GitHub Source"
          aria-label="GitHub Source"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </a>
      </div>
    </div>

    <div class="p-3 pb-2 border-b border-base-300/60 shrink-0">
      <div role="tablist" class="tabs tabs-box grid grid-cols-2 w-full">
        <button
          role="tab"
          type="button"
          class="tab font-medium text-xs transition-all"
          :class="{ 'tab-active font-semibold shadow-xs': leftTab === 'Panels' }"
          @click="leftTab = 'Panels'"
        >
          Panels
          <span
            v-if="panels.length > 0"
            class="badge badge-xs badge-neutral ml-1.5 font-mono"
          >
            {{ panels.reduce((sum, p) => sum + p.quantity, 0) }}
          </span>
        </button>
        <button
          role="tab"
          type="button"
          class="tab font-medium text-xs transition-all"
          :class="{ 'tab-active font-semibold shadow-xs': leftTab === 'Settings' }"
          @click="leftTab = 'Settings'"
        >
          Settings
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto min-h-0 p-3">
      <div v-show="leftTab === 'Panels'">
        <Panels
          v-model="panels"
          :hovered-panel="hoveredPanel"
          @hover-panel="emit('hover-panel', $event)"
        />
      </div>

      <div v-show="leftTab === 'Settings'">
        <Settings />
      </div>
    </div>

    <div
      v-if="leftTab === 'Panels'"
      class="p-3 border-t border-base-300 bg-base-200 shrink-0 flex flex-col gap-2"
    >
      <div class="flex gap-2">
        <button
          type="button"
          class="btn btn-sm btn-outline flex-1 gap-1.5"
          @click="emit('open-import')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Import
        </button>
        <button
          v-if="panels.length !== 0"
          type="button"
          class="btn btn-sm btn-outline flex-1 gap-1.5"
          @click="emit('open-export')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export
        </button>
      </div>
      <button
        v-if="panels.length !== 0"
        type="button"
        class="btn btn-xs btn-ghost text-error/80 hover:text-error hover:bg-error/10 w-full"
        @click="panels = []"
      >
        Delete all panels
      </button>
    </div>
  </aside>
</template>
