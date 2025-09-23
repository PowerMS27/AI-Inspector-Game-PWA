import { defineStore } from "pinia";

export const useGameConfigStore = defineStore("gameConfig", () => {
  const isTestText2SpeechGen = true;
  const isTestText2TextGen = true;
  const isShouldBeAcceptedShown = true;
  const charactersHistoryBuffer = 2;
  const dialogueOptionsForPlayer = 3;
  const turnsPerLevel = 1;
  const gameLevelLimit = 1;

  return {
    isTestText2SpeechGen,
    isTestText2TextGen,
    isShouldBeAcceptedShown,
    charactersHistoryBuffer,
    dialogueOptionsForPlayer,
    turnsPerLevel,
    gameLevelLimit
  };
});
