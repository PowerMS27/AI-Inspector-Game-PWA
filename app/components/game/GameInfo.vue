<script setup lang="ts">
// props
interface Props {
  gameLevel: number;
  turnsLeft: number;
  levelLimit: number;
}
const { turnsLeft } = defineProps<Props>();
</script>
<template>
  <div>
    <div class="bg-teal-500 opacity-50 px-3">
      <div>Turns Left: {{ turnsLeft }}</div>
    </div>
  </div>
</template>
