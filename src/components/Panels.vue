<script setup lang="ts">
import { ref } from 'vue';

interface Panel {
    length: number;
    width: number;
    quantity: number;
}

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

function deletePanel(index: number) {
    panels.value.splice(index, 1);
}
</script>
<template>
    <table class="table">
        <thead>
            <tr>
                <th>Length</th>
                <th>Width</th>
                <th>Quantity</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(panel, index) in panels" :key="index">
                <td>{{ panel.length }}</td>
                <td>{{ panel.width }}</td>
                <td>{{ panel.quantity }}</td>
                <td>
                    <button class="btn btn-square btn-error btn-xs" @click="deletePanel(index)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            class="lucide lucide-x">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>
                </td>
            </tr>
        </tbody>
    </table>
</template>

