<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

interface Props {
  modelValue: boolean;
  closeButtonNeeded?: boolean;
}
const { modelValue, closeButtonNeeded = false } = defineProps<Props>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "close" | "open"): void;
}>();

const close = () => {
  emit("update:modelValue", false);
  emit("close");
};

const open = () => {
  emit("update:modelValue", true);
  emit("open");
};
</script>

<template>
  <div v-if="modelValue">
    <div class="fixed left-0 top-0 h-screen w-full z-50 bg-zinc-800 p-4 flex flex-col">
      <slot />
      <button v-if="closeButtonNeeded" @click="close">Close</button>
    </div>
  </div>
</template>
