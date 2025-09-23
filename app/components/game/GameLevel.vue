<script setup lang="ts">
// imports
import GameInfo from "~/components/game/GameInfo.vue";
import CharacterInfo from "~/components/character/CharacterInfo.vue";
import DialogueChoice from "~/components/player/DialogueChoice.vue";
import FinalChoice from "~/components/player/FinalChoice.vue";
import type { DialogueOption } from "~/types/dialogue";
import type { GameCharacter, CharactersHistoryAnswer } from "~/types/game-characters";
const { generateText } = useTextGeneration();

const { generateAndPlay, stopPlayback, isPlaying, isGenerating } =
  useAudioGeneration();

// props and emits
interface Props {
  gameCharacter: GameCharacter;
  dialogueOptions: DialogueOption[];
  gameLevel: number;
}
const { gameCharacter, dialogueOptions, gameLevel } = defineProps<Props>();
const emit = defineEmits<{
  acceptCharacter: [character: GameCharacter, answer: CharactersHistoryAnswer];
  declineCharacter: [character: GameCharacter, answer: CharactersHistoryAnswer];
  showResults: []
}>();

// params
const {
  historyAddPlayerMessage,
  historyAddAIMessage,
  historyGetFormatted,
  historyClear,
} = useDialogueHistory();
const gameConfig = useGameConfigStore();
const aiResponse = ref("");
const aiResponseToShow = ref("");
const isLoading = ref(false);
const playerChoiceHistory = ref<DialogueOption[]>([]);
const turnsLeft = ref<number>(gameConfig.turnsPerLevel);

// methods
const handleGenerate = async (option: DialogueOption) => {
  if (turnsLeft.value <= 0) return;
  isLoading.value = true;
  playerChoiceHistory.value.push(option);

  historyAddPlayerMessage(option.text);

  try {
    const prompt = `
      ${gameCharacter.role}
      Here is dialogue between you and player:
      ${historyGetFormatted()}
      You:
    `;

    aiResponse.value = "";
    const aiTextResponse = await generateText(prompt, {
      model: "meta-llama/Llama-3.1-8B-Instruct",
      max_tokens: 80,
    });

    generateAndPlay(
      aiTextResponse.sentences,
      gameCharacter.voiceGender,
      gameCharacter.voiceEffects
    );
    historyAddAIMessage(aiTextResponse.fullResponse);
    aiResponse.value = aiTextResponse.fullResponse;
  } catch (error) {
    console.error("Generation error:", error);
    aiResponse.value = "Error generating text response";
  } finally {
    isLoading.value = false;
    dialogueOptions.forEach((el) => {
      const found = playerChoiceHistory.value.some(
        (historyEl) => historyEl.text === el.text
      );
      el.disabled = found;
    });
    if (turnsLeft.value > 0) turnsLeft.value--;
  }
};

const resetLevel = () => {
  aiResponse.value = "";
  turnsLeft.value = gameConfig.turnsPerLevel;
  playerChoiceHistory.value = [];
  historyClear();
};

const acceptCharacter = () => {
  emit("acceptCharacter", gameCharacter, 'accepted');
  resetLevel();
  if (gameLevel === gameConfig.gameLevelLimit) {
    emit('showResults')
  }
};

const declineCharacter = () => {
  emit("declineCharacter", gameCharacter, 'declined');
  resetLevel();
  if (gameLevel === gameConfig.gameLevelLimit) {
    emit('showResults')
  }
};

watch(isPlaying, (newVal) => {
  if (newVal) aiResponseToShow.value = aiResponse.value;
});
watch(aiResponse, (newVal) => {
  if (!newVal) aiResponseToShow.value = aiResponse.value;
});
</script>

<template>
  <div class="pt-8">
    <GameInfo
      class="fixed top-0 left-0 w-full"
      :game-level="gameLevel"
      :level-limit="gameConfig.gameLevelLimit"
      :turns-left="turnsLeft"
    />

    <CharacterInfo class="my-4" :game-character="gameCharacter" />

    <CharacterResponse class="my-4" :character-response="aiResponseToShow" />

    <DialogueChoice
      class="my-8"
      :is-loading="isLoading || isPlaying || isGenerating"
      :dialogue-options="dialogueOptions"
      @choose="handleGenerate"
    />

    <FinalChoice
      :is-loading="isLoading || isPlaying || isGenerating"
      :rounds-left="turnsLeft"
      @handle-accept="acceptCharacter"
      @handle-decline="declineCharacter"
    />
  </div>
</template>
