<script setup lang="ts">
import type { DialogueOption } from "~/types/dialogue";

interface Props {
  dialogueOptions?: DialogueOption[];
  isLoading?: boolean 
}
const { dialogueOptions = [], isLoading } = defineProps<Props>();

const emit = defineEmits<{
  choose: [option: DialogueOption];
}>();

const optionChoose = (option: DialogueOption) => {
  emit("choose", option);
};
</script>
<template>
  <div>
    <div v-for="option in dialogueOptions" :key="option.text">
      <ui-button
        class="mb-2 bg-violet-500 disabled:bg-violet-900 w-full"
        :disabled="option.disabled || isLoading"
        @click="() => optionChoose(option)"
      >
        {{ option.text }}
      </ui-button>
    </div>
  </div>
</template>
