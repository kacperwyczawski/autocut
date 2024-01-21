<script setup lang="ts">
import { ref } from 'vue';
import Panels from './Panels.vue';

const currentTab = ref('Panels');
const tabList = ['Panels', 'Cuts'];

</script>
<template>
    <div class="p-2 w-80 min-h-full bg-base-200">
        <div role="tablist" class="tabs tabs-boxed p-0">
            <a v-for="tab in tabList" :key="tab" role="tab" class="tab" :class="{ 'bg-secondary text-secondary-content': currentTab === tab }" @click="currentTab = tab">
                {{ tab }}
            </a>
        </div>
        <div v-if="currentTab === 'Panels'">
            <Panels/>
        </div>
    </div>
</template>