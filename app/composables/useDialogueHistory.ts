import type { DialogueMessage, DialogueHistory } from '@/types/dialogue';

export const useDialogueHistory = () => {
  const history = ref<DialogueHistory>([]);

  const historyAddPlayerMessage = (text: string) => {
    historyAddMessage({ speaker: 'Player', text });
  };

  const historyAddAIMessage = (text: string) => {
    historyAddMessage({ speaker: 'AI', text });
  };

  const historyAddMessage = (message: DialogueMessage) => {
    history.value.push({
      ...message,
      timestamp: new Date()
    });
  };

  const historyGetFormatted = (): string => {
    return history.value.map(msg => {
      const speaker = msg.speaker === 'AI' ? 'You' : 'Player';
      return `${speaker}: ${msg.text}`;
    }).join('\n');
  };

  const historyClear = () => {
    history.value = [];
  };

  const historyGetAll = (): DialogueHistory => {
    return [...history.value];
  };

  return {
    history,
    historyAddPlayerMessage,
    historyAddAIMessage,
    historyGetFormatted,
    historyClear,
    historyGetAll
  };
};