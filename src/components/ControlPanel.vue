<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';

defineProps<{
    disableOptimization?: boolean;
}>()

const edgeReductionButtons = localStorage.getItem('edgeReductionButtons') || 'Combined';

const length = ref(1);
const width = ref(1);
const quantity = ref(1);
const firstInput = ref<any>(null);
const top = ref(false);
const right = ref(false);
const bottom = ref(false);
const left = ref(false);

const emit = defineEmits<{
    addPanel: [panel: Panel];
}>()

function reset() {
    length.value = 1;
    width.value = 1;
    quantity.value = 1;
    firstInput.value.focus();
    top.value = false;
    right.value = false;
    bottom.value = false;
    left.value = false;
}

function addPanel() {
    emit('addPanel', {
        length: length.value,
        width: width.value,
        quantity: quantity.value,
        topEdgeReduction: top.value,
        rightEdgeReduction: right.value,
        bottomEdgeReduction: bottom.value,
        leftEdgeReduction: left.value,
    });
    reset();
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
            <input v-model.number="length" type="number" min="1" placeholder="8000" class="input input-bordered"
                ref="firstInput" />
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
        <div v-if="edgeReductionButtons === 'Combined'" class="h-12 w-12 relative">
            <input v-model="top" type="checkbox"
                class="absolute top-0 left-2 right-2 h-2 min-h-2 appearance-none btn btn-outline p-0 checked:btn-primary">
            <input v-model="right" type="checkbox"
                class="absolute top-2 right-0 w-2 h-8 min-h-8 appearance-none btn btn-outline p-0 checked:btn-primary">
            <input v-model="bottom" type="checkbox"
                class="absolute bottom-0 left-2 right-2 h-2 min-h-2 appearance-none btn btn-outline p-0 checked:btn-primary">
            <input v-model="left" type="checkbox"
                class="absolute top-2 left-0 w-2 h-8 min-h-8 appearance-none btn btn-outline p-0 checked:btn-primary">
        </div>
        <div v-else-if="edgeReductionButtons === 'Separate'" class="flex gap-2">
            <input v-model="top" type="checkbox"
                class="checkbox w-12 h-12 [--chkbg:theme(colors.base-100)] [--chkfg:theme(colors.base-content)] border-8 border-base-300 border-t-primary rounded-btn">
            <input v-model="right" type="checkbox"
                class="checkbox w-12 h-12 [--chkbg:theme(colors.base-100)] [--chkfg:theme(colors.base-content)] border-8 border-base-300 border-r-primary rounded-btn">
            <input v-model="bottom" type="checkbox"
                class="checkbox w-12 h-12 [--chkbg:theme(colors.base-100)] [--chkfg:theme(colors.base-content)] border-8 border-base-300 border-b-primary rounded-btn">
            <input v-model="left" type="checkbox"
                class="checkbox w-12 h-12 [--chkbg:theme(colors.base-100)] [--chkfg:theme(colors.base-content)] border-8 border-base-300 border-l-primary rounded-btn">
        </div>
        <button @click="addPanel" class="btn btn-primary">
            Add panel
        </button>
        <button class="btn btn-secondary" :disabled="disableOptimization">
            Optimize
        </button>
    </div>
</template>