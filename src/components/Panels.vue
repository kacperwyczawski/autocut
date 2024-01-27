<script setup lang="ts">
const panels = defineModel<Panel[]>()
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
                    <button class="btn btn-square btn-error btn-xs" @click="panels?.splice(index, 1)">
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

