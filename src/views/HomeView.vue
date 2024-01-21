<script setup lang="ts">
import SidebarContent from '../components/SidebarContent.vue'
</script>

<template>
  <div class="drawer md:drawer-open">
    <input id="sidebar" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content p-2">
      <div class="flex gap-2">
        <label for="sidebar" class="btn drawer-button md:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="lucide lucide-menu">
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </label>
        <button class="btn">
          Reset panels
        </button>
        <button class="btn btn-primary">
          Optimize
        </button>
      </div>
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
      <SidebarContent />
    </div>
  </div>
</template>
