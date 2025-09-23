<script setup lang="ts">
interface Props {
  characterResponse: string
}

const { characterResponse } = defineProps<Props>()
const { displayedText } = useTypewriter(() => characterResponse, {
  typeSpeed: 40,
  deleteSpeed: 20
})
</script>

<template>
  <div class="border-2 border-violet-950 px-3 py-2 h-[calc(90vh_-_24rem)] min-h-24 sm:min-h-16 overflow-y-auto">
    <div>
      {{ displayedText }}
    </div>
  </div>
</template>