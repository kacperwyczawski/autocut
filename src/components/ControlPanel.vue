<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
    disableOptimization?: boolean;
}>()

const length = ref(1);
const width = ref(1);
const quantity = ref(1);
const firstInput = ref<any>(null);

function reset() {
    length.value = 1;
    width.value = 1;
    quantity.value = 1;
    firstInput.value.focus();
}
</script>
<template>
    <div class="flex gap-2 flex-wrap items-end">
        <label for="sidebar" class="btn drawer-button md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                class="lucide lucide-menu">
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
        </label>
        <label class="form-control grow">
            <div class="label">
                <span class="label-text">Length</span>
                <span class="label-text-alt">mm</span>
            </div>
            <input v-model.number="length" type="number" min="1" placeholder="8000" class="input input-bordered" ref="firstInput"/>
        </label>
        <label class="form-control grow">
            <div class="label">
                <span class="label-text">Width</span>
                <span class="label-text-alt">mm</span>
            </div>
            <input v-model.number="width" type="number" min="1" placeholder="10000" class="input input-bordered" />
        </label>
        <label class="form-control grow">
            <div class="label">
                <span class="label-text">Quantity</span>
            </div>
            <input v-model.number="quantity" type="number" min="1" placeholder="Type here" class="input input-bordered" />
        </label>
        <button @click="$emit('addPanel', { length, width, quantity }); reset()"
            class="btn btn-primary">
            Add panel
        </button>
        <button class="btn btn-secondary" :disabled="disableOptimization">
            Optimize
        </button>
    </div>
</template>