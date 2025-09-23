export interface CharacterAudioEffects {
  distortion?: number;
  reverb?: {
    decay?: number,
    wet?: number
  };
  pitchShift?: number;
  phaser?: {
    frequency?: number;
    octaves?: number;
    baseFrequency?: number;
    wet?: number;
  };
  chorus?: {
    frequency?: number;
    delayTime?: number;
    depth?: number;
    wet?: number;
  };
  tremolo?: {
    frequency?: number;
    depth?: number;
    spread?: number;
    wet?: number;
  };
  eq3?: {
    low?: number;
    mid?: number;
    high?: number;
    lowFrequency?: number;
    highFrequency?: number;
  };
  volume?: number;
}

export type CharacterGender = 'male' | 'female'

export interface GameCharacter {
  id: number
  name: string
  shouldBeAccepted: boolean
  role: string
  occupation: string
  dialogueOptions: string[]
  image?: string
  voiceGender: CharacterGender
  voiceEffects: CharacterAudioEffects
}

export interface GameCharacterRoles {
  normal: string
}

export type CharactersHistoryAnswer = 'accepted' | 'declined'

export interface CharactersHistoryEl {
  character: GameCharacter,
  level: number,
  answer: CharactersHistoryAnswer
}