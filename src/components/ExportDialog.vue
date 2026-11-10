<script setup lang="ts">
import useJsonExport from "@/composables/useJsonExport";
import { computed, useTemplateRef } from "vue";

const props = defineProps<{
	title: string;
	description: string;
	filename: string;
	data: unknown;
}>();

const dialogRef = useTemplateRef<HTMLDialogElement>("dialogRef");

const formattedJson = computed(() => {
	return JSON.stringify(props.data, null, 2);
});

function exportFile() {
	useJsonExport(formattedJson.value, props.filename);
}

defineExpose({
	showModal: () => dialogRef.value?.showModal(),
	close: () => dialogRef.value?.close(),
});
</script>

<template>
  <dialog ref="dialogRef" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">{{ title }}</h3>
      <p class="py-4 text-sm text-base-content/80">{{ description }}</p>
      <div class="mockup-code before:hidden max-h-[50vh] overflow-y-scroll">
        <pre><code>{{ formattedJson }}</code></pre>
      </div>
      <div class="modal-action">
        <form method="dialog" class="flex gap-2">
          <button type="button" @click="exportFile" class="btn btn-primary">
            Export
          </button>
          <button class="btn">Cancel</button>
        </form>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>
