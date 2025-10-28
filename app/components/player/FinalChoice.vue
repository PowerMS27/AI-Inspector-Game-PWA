<script setup lang="ts">
// props and emits
interface Props {
  isLoading: boolean;
  roundsLeft: number;
}
const { isLoading, roundsLeft } = defineProps<Props>();
const emit = defineEmits<{
  handleAccept: [];
  handleDecline: [];
}>();
</script>
<template>
  <div>
    <div v-show="!roundsLeft" class="w-full flex">
      <ui-button
        :disabled="isLoading"
        class="bg-teal-500 mr-2 w-1/2"
        @click="emit('handleAccept')"
      >
        Accept
      </ui-button>
      <ui-button
        :disabled="isLoading"
        class="bg-rose-500 w-1/2"
        @click="emit('handleDecline')"
      >
        Decline
      </ui-button>
    </div>
  </div>
</template>
