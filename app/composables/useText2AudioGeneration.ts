import { InferenceClient } from "@huggingface/inference";
import * as Tone from "tone";
import type {
  CharacterAudioEffects,
  CharacterGender,
} from "~/types/game-characters";

export const useAudioGeneration = () => {
  const gameConfig = useGameConfigStore();
  const config = useRuntimeConfig();

  const HF_ACCESS_TOKENS = [
    config.public.huggingfaceApiKey1,
    config.public.huggingfaceApiKey2,
  ].filter(
    (token): token is string => typeof token === "string" && token.length > 0
  );

  let currentTokenIndex = 0;
  let client = new InferenceClient(HF_ACCESS_TOKENS[currentTokenIndex]);

  const isPlaying = ref(false);
  const isGenerating = ref(false);
  const currentQueue = ref<string[]>([]);
  const playQueue = ref<
    { buffer: AudioBuffer; effects?: CharacterAudioEffects }[]
  >([]);
  const activePlayers = ref<Tone.Player[]>([]);

  // switch API key
  const switchToNextToken = () => {
    if (HF_ACCESS_TOKENS.length <= 1) return;

    currentTokenIndex = (currentTokenIndex + 1) % HF_ACCESS_TOKENS.length;
    client = new InferenceClient(HF_ACCESS_TOKENS[currentTokenIndex]);
    console.warn(`Switched to Hugging Face API key index ${currentTokenIndex}`);
  };

  // audio context
  const initializeAudio = async () => {
    if (Tone.context.state !== "running") {
      await Tone.start();
    }
  };

  // effects chain for audio file
  const createEffectsChain = (
    player: Tone.Player,
    effects?: CharacterAudioEffects
  ) => {
    if (!effects) {
      player.toDestination();
      return;
    }

    const effectsChain: Tone.AudioNode[] = [player];

    if (effects.distortion !== undefined) {
      const distortionNode = new Tone.Distortion(effects.distortion);
      effectsChain.push(distortionNode);
    }

    if (effects.pitchShift !== undefined) {
      const pitchShiftNode = new Tone.PitchShift(effects.pitchShift);
      effectsChain.push(pitchShiftNode);
    }

    if (effects.reverb !== undefined) {
      const reverbNode = new Tone.Reverb({
        decay: effects.reverb.decay || 1,
        wet: effects.reverb.wet || 0.5,
      });
      effectsChain.push(reverbNode);
    }

    if (effects.phaser !== undefined) {
      const phaserNode = new Tone.Phaser({
        frequency: effects.phaser.frequency || 0.3,
        octaves: effects.phaser.octaves || 2,
        baseFrequency: effects.phaser.baseFrequency || 300,
        wet: effects.phaser.wet || 1,
      });
      effectsChain.push(phaserNode);
    }

    if (effects.chorus !== undefined) {
      const chorusNode = new Tone.Chorus({
        frequency: effects.chorus.frequency || 40,
        delayTime: effects.chorus.delayTime || 20,
        depth: effects.chorus.depth || 0.9,
        wet: effects.chorus.wet || 0.5,
      });
      effectsChain.push(chorusNode);
    }

    if (effects.tremolo !== undefined) {
      const tremoloNode = new Tone.Tremolo({
        frequency: effects.tremolo.frequency || 12,
        depth: effects.tremolo.depth || 0.8,
        spread: effects.tremolo.spread || 40,
        wet: effects.tremolo.wet || 1,
      }).start();
      effectsChain.push(tremoloNode);
    }

    if (effects.eq3 !== undefined) {
      const eq3Node = new Tone.EQ3({
        low: effects.eq3.low || 0,
        mid: effects.eq3.mid || 0,
        high: effects.eq3.high || 0,
        lowFrequency: effects.eq3.lowFrequency || 50,
        highFrequency: effects.eq3.highFrequency || 20000,
      });
      effectsChain.push(eq3Node);
    }

    const volumeNode = new Tone.Volume(effects?.volume);
    effectsChain.push(volumeNode);

    // chain all effects
    for (let i = 0; i < effectsChain.length - 1; i++) {
      effectsChain[i].connect(effectsChain[i + 1]);
    }

    effectsChain[effectsChain.length - 1].toDestination();

    return effectsChain.slice(1);
  };

  // with switch between API keys
  const generateAudio = async (
    text: string,
    gender: CharacterGender
  ): Promise<AudioBuffer> => {
    let lastError: Error | null = null;
    const maxAttempts = HF_ACCESS_TOKENS.length;
    const model =
      gender === "female" ? "hexgrad/Kokoro-82M" : "ResembleAI/chatterbox";

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (attempt && !lastError) return null;
      try {
        let response = [];
        if (gameConfig.isTestText2SpeechGen) {
          response = await fetch("/audio/test-speech.wav");
        } else {
          response = await client.textToSpeech({
            model,
            inputs: text,
          });
        }

        const arrayBuffer = await response.arrayBuffer();
        return await Tone.context.decodeAudioData(arrayBuffer);
      } catch (error) {
        console.error(`Audio generation attempt ${attempt + 1} failed:`, error);
        lastError = error as Error;

        if (attempt < maxAttempts - 1) {
          switchToNextToken();
        }
      }
    }

    console.error("All API key attempts failed for audio generation");
    throw lastError || new Error("Audio generation failed with all API keys");
  };

  const playAudio = async (
    buffer: AudioBuffer,
    effects?: AudioEffects
  ): Promise<void> => {
    await initializeAudio();

    return new Promise((resolve) => {
      const player = new Tone.Player(buffer);
      activePlayers.value.push(player);

      const effectNodes = createEffectsChain(player, effects);

      player.onstop = () => {
        activePlayers.value = activePlayers.value.filter((p) => p !== player);
        effectNodes?.forEach((node) => node.dispose());
        player.dispose();
        resolve();
      };

      player.start();
    });
  };

  const processPlayQueue = async () => {
    if (playQueue.value.length === 0 || isPlaying.value) return;

    isPlaying.value = true;
    const nextItem = playQueue.value.shift();

    if (!nextItem) {
      isPlaying.value = false;
      return;
    }

    try {
      await playAudio(nextItem.buffer, nextItem.effects);
    } catch (error) {
      console.error("Error playing audio:", error);
    } finally {
      isPlaying.value = false;
      processPlayQueue();
    }
  };

  const processGenerationQueue = async (
    gender: CharacterGender,
    effects?: CharacterAudioEffects
  ) => {
    if (currentQueue.value.length === 0 || isGenerating.value) return;

    isGenerating.value = true;
    const sentence = currentQueue.value.shift();

    if (sentence) {
      try {
        const audioBuffer = await generateAudio(sentence, gender);
        playQueue.value.push({ buffer: audioBuffer, effects });

        if (!isPlaying.value) {
          processPlayQueue();
        }
      } catch (error) {
        console.error("Error generating audio:", error);
      } finally {
        isGenerating.value = false;
        processGenerationQueue(gender, effects);
      }
    }
  };

  const generateAndPlay = (
    sentences: string[],
    gender: CharacterGender,
    effects?: CharacterAudioEffects
  ) => {
    currentQueue.value = [...currentQueue.value, ...sentences];

    if (!isGenerating.value) {
      processGenerationQueue(gender, effects);
    }
    if (!isPlaying.value && playQueue.value.length > 0) {
      processPlayQueue();
    }
  };

  const stopPlayback = () => {
    currentQueue.value = [];
    playQueue.value = [];

    activePlayers.value.forEach((player) => {
      player.stop();
      player.dispose();
    });
    activePlayers.value = [];

    isPlaying.value = false;
    isGenerating.value = false;
  };

  return {
    generateAndPlay,
    stopPlayback,
    isPlaying,
    isGenerating,
    currentQueue,
  };
};
