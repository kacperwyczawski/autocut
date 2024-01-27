<script setup lang="ts">
import ControlPanel from '@/components/ControlPanel.vue';
import Panels from '@/components/Panels.vue';
import { ref } from 'vue';

const currentTab = ref('Panels');
const tabList = ['Panels', 'Cuts'];

const panels = ref<Panel[]>([
    { length: 1000, width: 500, quantity: 200 },
    { length: 800, width: 400, quantity: 300 },
    { length: 1200, width: 600, quantity: 100 },
    { length: 600, width: 300, quantity: 400 },
    { length: 900, width: 700, quantity: 200 },
    { length: 1100, width: 900, quantity: 500 },
    { length: 700, width: 200, quantity: 300 },
    { length: 1400, width: 800, quantity: 200 },
    { length: 1500, width: 1000, quantity: 300 },
    { length: 1300, width: 600, quantity: 400 },
]);
</script>

<template>
  <div class="drawer md:drawer-open">
    <input id="sidebar" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content p-2">
      <ControlPanel @add-panel="(panel) => panels.push(panel)" />
      <div role="alert" class="alert alert-info mt-2">
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
            <a v-for="tab in tabList" :key="tab" role="tab" class="tab" :class="{ 'bg-secondary text-secondary-content': currentTab === tab }" @click="currentTab = tab">
                {{ tab }}
            </a>
        </div>
        <div v-if="currentTab === 'Panels'">
            <Panels v-model="panels"/>
            <button class="btn btn-error">
                Delete all panels
            </button>
        </div>
    </div>
    </div>
  </div>
</template>
