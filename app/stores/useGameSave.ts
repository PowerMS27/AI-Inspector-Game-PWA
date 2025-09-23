import { defineStore } from "pinia";
import { ref } from "vue";
import type { CharactersHistoryEl } from "~/types/game-characters";

type SaveData = {
  charactersHistory: CharactersHistoryEl[];
  [k: string]: any;
};

const STORAGE_KEY = "gameSave";

export const useGameSaveStore = defineStore("gameSave", () => {
  const saveData = ref<SaveData>({ charactersHistory: [] });

  const _safeSetLocal = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error("gameSave.localWrite:", e);
    }
  };

  const saveGame = () => {
    if (typeof window === "undefined") return;
    try {
      _safeSetLocal(STORAGE_KEY, JSON.stringify(saveData.value));
    } catch (e) {
      console.error("saveGame:", e);
    }
  };

  const loadGame = () => {
    if (typeof window === "undefined") return false;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      saveData.value = { ...saveData.value, ...parsed };
      return true;
    } catch (e) {
      console.error("loadGame:", e);
      return false;
    }
  };

  const set = (
    payload: Partial<SaveData>,
    opts: { save?: boolean } = { save: true }
  ) => {
    saveData.value = { ...saveData.value, ...payload };
    if (opts.save) saveGame();
  };

  const clearSave = (opts: { keep?: string[] } = {}) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.error("clearSave:", e);
      }
    }
    if (opts.keep && opts.keep.length) {
      const next: any = {};
      for (const k of opts.keep) next[k] = (saveData.value as any)[k];
      saveData.value = next;
    } else {
      saveData.value = { charactersHistory: [] };
    }
  };

  if (typeof window !== "undefined") loadGame();

  return { saveData, saveGame, loadGame, set, clearSave };
});
