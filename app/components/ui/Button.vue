<script setup lang="ts">
interface Props {
  cornerSize?: number;
}
const { cornerSize = 8 } = defineProps<Props>();

// clip-path for pixelated rounded corners
const generateClipPath = (size: number) => {
  const s = size;
  const s2 = s / 2;

  return `
    polygon(
      /* bottom-left corner */
      0px calc(100% - ${s}px),
      ${s2}px calc(100% - ${s}px),
      ${s2}px calc(100% - ${s2}px),
      ${s}px calc(100% - ${s2}px),
      ${s}px 100%,
      
      /* bottom-right corner */
      calc(100% - ${s}px) 100%,
      calc(100% - ${s}px) calc(100% - ${s2}px),
      calc(100% - ${s2}px) calc(100% - ${s2}px),
      calc(100% - ${s2}px) calc(100% - ${s}px),
      100% calc(100% - ${s}px),
      
      /* top-right corner */
      100% ${s}px,
      calc(100% - ${s2}px) ${s}px,
      calc(100% - ${s2}px) ${s2}px,
      calc(100% - ${s}px) ${s2}px,
      calc(100% - ${s}px) 0px,
      
      /* top-left corner */
      ${s}px 0px,
      ${s}px ${s2}px,
      ${s2}px ${s2}px,
      ${s2}px ${s}px,
      0px ${s}px
    )
  `;
};

const buttonStyle = computed(() => ({
  "clip-path": generateClipPath(cornerSize),
}));
</script>

<template>
  <button
    class="px-4 sm:px-8 h-9 leading-4 text-white transition-colors enabled:hover:scale-105 enabled:active:scale-105 enabled:focus:scale-100 sm:enabled:active:translate-y-0.5 disabled:opacity-50"
    v-bind="$attrs"
    :style="buttonStyle"
  >
    <slot />
  </button>
</template>
