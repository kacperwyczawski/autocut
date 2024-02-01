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
    return optimize(props.sheet, panels, props.bladeThickness)
})
</script>
<template>
    <div class="flex flex-col gap-2 pt-2">
        <svg v-for="optimizedSheet in results" :viewBox="`0 0 ${optimizedSheet.sheet.length} ${optimizedSheet.sheet.width}`"
            class="fill-transparent border-2 border-secondary border-dashed">
            <rect v-for="optimizedPanel in optimizedSheet.panels" :x="optimizedPanel.x" :y="optimizedPanel.y"
                :width="optimizedPanel.panel.length" :height="optimizedPanel.panel.width"
                class="stroke-neutral fill-base-200">
            </rect>
        </svg>
    </div>
</template>