export interface DialogueOption {
    text: string,
    disabled: boolean
}

export interface DialogueMessage {
  speaker: 'AI' | 'Player';
  text: string;
  timestamp?: Date;
}

export type DialogueHistory = DialogueMessage[];