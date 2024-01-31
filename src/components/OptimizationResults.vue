<script setup lang="ts">
import { computed } from 'vue';
import { optimize } from '@/core/optimize';
import type { Panel } from '@/core/panel';
import type { Sheet } from '@/core/sheet';

const props = defineProps<{
    sheet: Sheet,
    panels: {
        panel: Panel,
        quantity: number
    }[],
    bladeThickness: number,
}>()

const results = computed(() => {
    const panels = props.panels.flatMap(p =>
        Array<Panel>(p.quantity).fill(p.panel)
    )
    let result = optimize(props.sheet, panels, props.bladeThickness)
    return JSON.stringify(result, null, 4)
})
</script>
<template>
    <pre class="mockup-code mt-2">
{{ results }}
    </pre>
</template>