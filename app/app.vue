<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
<style lang="scss">
html, body {
  font-family: 'PixelPurl', monospace;
  @apply text-slate-600 text-lg leading-5;
  @media (min-height: 700px) {
    @apply text-xl leading-6;
  }
}
</style>
