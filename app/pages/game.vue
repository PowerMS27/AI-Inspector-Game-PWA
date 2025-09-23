<script setup lang="ts">
// imports
import GameLevel from "~/components/game/GameLevel.vue";
import { gameCharacters } from "~/assets/data/characters";
import type {
  GameCharacter,
  CharactersHistoryAnswer,
  CharactersHistoryEl
} from "~/types/game-characters";
import type { DialogueOption } from "~/types/dialogue";
import { useGameSaveStore } from "~/stores/useGameSave";
const { getRandomItem, getRandomItems } = useRandomItems();

// meta
definePageMeta({
  layout: "game",
});

// params
const gameConfig = useGameConfigStore();
const gameSave = useGameSaveStore();
const gameLevel = ref(0);
const gameCharacter = ref<GameCharacter>();
const charactersHistory = ref<CharactersHistoryEl[]>([]);
const dialogueOptions = ref<DialogueOption[]>([]);
const resultsModalShow = ref(false);

// hooks
onMounted(() => {
  gameSave.loadGame()
  if (gameSave.saveData.charactersHistory?.length) {
    charactersHistory.value = [...gameSave.saveData.charactersHistory];
  }
});

// computed
const filteredGameCharacters = computed(() => {
  return gameCharacters.filter(
    (el) =>
      !charactersHistory.value.find(
        (historyEl) => historyEl.character.id === el.id
      )
  );
});
const filteredCharactersHistory = computed(() => {
  return charactersHistory.value.slice(-gameConfig.gameLevelLimit)
})

// methods
const getNewCharacter = (): GameCharacter => {
  const character = getRandomItem(filteredGameCharacters.value);
  if (!character) throw new Error("gameCharacters is empty");
  return character;
};

const getDialogues = (character: GameCharacter): DialogueOption[] => {
  return getRandomItems(
    character.dialogueOptions,
    gameConfig.dialogueOptionsForPlayer
  ).map((text) => ({ text, disabled: false } as DialogueOption));
};

const updateCharactersHistory = (
  character: GameCharacter,
  answer: CharactersHistoryAnswer
) => {
  charactersHistory.value.push({ character, level: gameLevel.value, answer });

  if (charactersHistory.value.length > gameConfig.charactersHistoryBuffer) {
    charactersHistory.value = charactersHistory.value.slice(
      charactersHistory.value.length - gameConfig.charactersHistoryBuffer
    );
  }

  gameSave.set({ charactersHistory: [...charactersHistory.value] });
};

const startLevel = (level: number) => {
  const character = getNewCharacter();
  gameCharacter.value = character;
  dialogueOptions.value = getDialogues(character);
  gameLevel.value = level;
};

const acceptCharacter = (
  character: GameCharacter,
  answer: CharactersHistoryAnswer
) => {
  updateCharactersHistory(character, answer);
  startLevel(++gameLevel.value);
};

const declineCharacter = (
  character: GameCharacter,
  answer: CharactersHistoryAnswer
) => {
  updateCharactersHistory(character, answer);
  startLevel(++gameLevel.value);
};

const startAgain = () => {
  startLevel(1);
  resultsModalShow.value = false;
};

// init
startLevel(1);
</script>

<template>
  <div class="">
    <GameLevel
      v-if="gameCharacter"
      :game-character="gameCharacter"
      :dialogue-options="dialogueOptions"
      :game-level="gameLevel"
      @accept-character="acceptCharacter"
      @decline-character="declineCharacter"
      @show-results="resultsModalShow = true"
    />
    <div v-else>Loading...</div>
    <ui-modal v-model="resultsModalShow" @close="onResultsModalClose">
      <div class="text-4xl text-white">Results:</div>
      <div>
        <div
          v-for="result in filteredCharactersHistory"
          :key="result.character.id"
          class="flex w-full mt-6"
        >
          <div class="w-1/4">
            Level <span class="text-teal-500">{{ result.level }}</span
            >:
          </div>
          <div class="text-teal-500 w-1/4">{{ result.character.name }}</div>
          <div
            class="w-1/4 capitalize text-rose-500"
            :class="{
              'text-teal-500':
                (result.character.shouldBeAccepted &&
                  result.answer === 'accepted') ||
                (!result.character.shouldBeAccepted &&
                  result.answer === 'declined'),
            }"
            >{{ result.answer }}</div
          >
        </div>
      </div>
      <ui-button
        class="bg-violet-500 disabled:bg-violet-900 mt-auto mb-2"
        @click="startAgain"
        >Next Level</ui-button
      >
    </ui-modal>
  </div>
</template>
