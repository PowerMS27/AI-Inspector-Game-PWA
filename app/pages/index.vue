<script setup lang="ts">
// meta
definePageMeta({
  layout: "game",
});
</script>
<template>
  <div>
    <div class="h-[90vh] flex-col flex justify-center items-center">
      <div class="fixed top-8 text-4xl sm:text-6xl">AI Inspector Game</div>
      <NuxtLink to="/game" class="text-3xl w-full flex justify-center text-violet-500">Play</NuxtLink>
    </div>
  </div>
</template>
