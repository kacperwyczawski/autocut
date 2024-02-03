<script setup lang="ts">
import type { Panel } from "@/core/panel";

const panels = defineModel<{ panel: Panel; quantity: number }[]>();
</script>
<template>
  <table class="table table-sm">
    <thead>
      <tr>
        <th>Length</th>
        <th>Width</th>
        <th>Quantity</th>
        <th>Edge red.</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(multipanel, index) in panels" :key="index">
        <td>{{ multipanel.panel.length }}</td>
        <td>{{ multipanel.panel.width }}</td>
        <td>{{ multipanel.quantity }}</td>
        <td>
          <div
            class="border-4 w-6 h-6 rounded-btn"
            :class="{
              'border-t-primary': multipanel.panel.edgeReduction.top,
              'border-r-primary': multipanel.panel.edgeReduction.right,
              'border-b-primary': multipanel.panel.edgeReduction.bottom,
              'border-l-primary': multipanel.panel.edgeReduction.left,
            }"
          ></div>
        </td>
        <td>
          <button
            class="btn btn-square btn-error btn-xs"
            @click="panels?.splice(index, 1)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-x"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
