<script setup lang="ts">
import ControlPanel from '@/components/ControlPanel.vue';
import Panels from '@/components/Panels.vue';
import { ref } from 'vue';

const currentTab = ref('Panels');
const tabList = ['Panels', 'Cuts'];

const panels = ref<Panel[]>([]);
</script>

<template>
  <div class="drawer md:drawer-open">
    <input id="sidebar" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content p-2">
      <ControlPanel @add-panel="(panel) => panels.push(panel)" />
      <div v-if="panels.length === 0" role="alert" class="alert alert-info mt-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          class="lucide lucide-info">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
        <span>
          Add some panels first
        </span>
      </div>
      <div role="alert" class="alert alert-info mt-2 md:hidden">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          class="lucide lucide-info">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
        <span>
          You can open the sidebar by clicking the menu icon
        </span>
      </div>
    </div>
    <div class="drawer-side">
      <label for="sidebar" aria-label="close sidebar" class="drawer-overlay"></label>
      <div class="p-2 w-80 min-h-full bg-base-200">
        <div role="tablist" class="tabs tabs-boxed p-0">
          <a v-for="tab in tabList" :key="tab" role="tab" class="tab"
            :class="{ 'bg-secondary text-secondary-content': currentTab === tab }" @click="currentTab = tab">
            {{ tab }}
          </a>
        </div>
        <div v-if="currentTab === 'Panels'">
          <Panels v-model="panels" />
          <button v-show="panels.length !== 0" class="btn btn-error btn-outline" @click="panels = []">
            Delete all panels
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
