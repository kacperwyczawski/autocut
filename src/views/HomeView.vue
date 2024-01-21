<script setup lang="ts">
import SidebarContent from '../components/SidebarContent.vue'
import { Info, Menu } from 'lucide-vue-next';
</script>

<template>
  <div class="drawer md:drawer-open">
    <input id="sidebar" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content p-2">
      <div class="flex gap-2">
        <label for="sidebar" class="btn drawer-button md:hidden">
          <Menu />
        </label>
        <button class="btn">
          Reset panels
        </button>
        <button class="btn btn-primary">
          Optimize
        </button>
      </div>
      <div role="alert" class="alert alert-info mt-2">
        <Info />
        <span>
          Add some panels first
        </span>
      </div>
      <div role="alert" class="alert alert-info mt-2 md:hidden">
        <Info />
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
