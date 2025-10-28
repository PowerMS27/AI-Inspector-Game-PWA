<script setup lang="ts">
// imports
import type { GameCharacter } from "~/types/game-characters";

// props
interface Props {
  gameCharacter: GameCharacter;
}
const { gameCharacter } = defineProps<Props>();

//params
const gameConfig = useGameConfigStore();
</script>
<template>
  <div class="leading-4 border-2 border-violet-950 px-3 py-2 flex items-center">
    <div class="w-8 mr-4">
      <img src="../../assets/images/characters/1.png" alt="">
    </div>
    <div>
      <div>
        Name: <span class="text-teal-500">{{ gameCharacter.name }}</span>
      </div>
      <div>
        Occupation:
        <span class="text-teal-500">{{ gameCharacter.occupation }}</span>
      </div>
      <div v-if="gameConfig.isShouldBeAcceptedShown">
        shouldBeAccepted:
        <span class="text-teal-500">{{ gameCharacter.shouldBeAccepted }}</span>
      </div>
    </div>
  </div>
</template>
