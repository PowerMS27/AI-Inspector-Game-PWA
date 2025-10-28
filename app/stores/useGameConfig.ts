import { defineStore } from "pinia";

export const useGameConfigStore = defineStore("gameConfig", () => {
  const isTestText2SpeechGen = false;
  const isTestText2TextGen = false;
  const isShouldBeAcceptedShown = false;
  const charactersHistoryBuffer = 6;
  const dialogueOptionsForPlayer = 3;
  const turnsPerLevel = 2;
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
