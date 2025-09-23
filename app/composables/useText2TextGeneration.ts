import { InferenceClient } from "@huggingface/inference";

interface ChatCompletionOptions {
  model?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  repetition_penalty?: number;
}

interface TextGenerationResult {
  fullResponse: string;
  sentences: string[];
}

export const useTextGeneration = () => {
  const config = useRuntimeConfig();
  const HF_ACCESS_TOKENS: string[] = [
    config.public.huggingfaceApiKey1 as string,
    config.public.huggingfaceApiKey2 as string,
  ].filter(Boolean) as string[];

  let currentTokenIndex = 0;

  /**
   * Creates a new InferenceClient with current token
   * @returns InferenceClient instance
   */
  const createClient = () => {
    if (!HF_ACCESS_TOKENS.length) {
      throw new Error("No Hugging Face API keys configured");
    }
    return new InferenceClient(HF_ACCESS_TOKENS[currentTokenIndex]);
  };

  let client = createClient();

  /**
   * Switches to the next available API key
   */
  const switchToNextToken = () => {
    currentTokenIndex = (currentTokenIndex + 1) % HF_ACCESS_TOKENS.length;
    client = createClient();
    console.warn(`Switched to Hugging Face API key index ${currentTokenIndex}`);
  };

  /**
   * Splits text into sentences
   * @param text Input text to split
   * @returns Array of sentences
   */
  const splitIntoSentences = (text: string): string[] => {
    const sentenceRegex = /[^.?!]+(?:[.?!]+(?!\S)|$)/g;
    const matches = text.match(sentenceRegex);
    if (!matches) return [];
    const validSentences = matches
      .map((s) => s.trim())
      .filter((s): s is string => s.length > 0);

    const result: string[] = [];
    let i = 0;

    while (i < validSentences.length) {
      const currentSentence = validSentences[i];
      if (!currentSentence) {
        i++;
        continue;
      }

      if (currentSentence.length < 80 && i < validSentences.length - 1) {
        const nextSentence = validSentences[i + 1];
        if (nextSentence) {
          result.push(`${currentSentence} ${nextSentence}`);
          i += 2;
          continue;
        }
      }

      result.push(currentSentence);
      i++;
    }

    return result;
  };

  /**
   * Generates AI response and returns both full response and sentences array
   * @param prompt User input message
   * @param options Generation parameters
   * @returns Object with fullResponse and sentences array
   */
  const generateText = async (
    prompt: string,
    options: ChatCompletionOptions = {}
  ): Promise<TextGenerationResult> => {
    const defaultOptions = {
      model: "meta-llama/Llama-3.1-8B-Instruct",
      max_tokens: 300,
      temperature: 0.7,
      top_p: 0.9,
      ...options,
    };

    let lastError: Error | null = null;
    const maxAttempts = HF_ACCESS_TOKENS.length;
    const gameConfig = useGameConfigStore();

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        let response = {};
        if (gameConfig.isTestText2TextGen) {
          response = {
            choices: [
              {
                message: {
                  content:
                    "Well hello there. This is not a real response of a character, it's just a test text. I try to save my hugging face inference credits.",
                },
              },
            ],
          };
        } else {
          response = await client.chatCompletion({
            model: defaultOptions.model,
            messages: [
              {
                role: "system",
                content: prompt,
              },
            ],
            max_tokens: defaultOptions.max_tokens,
            temperature: defaultOptions.temperature,
            top_p: defaultOptions.top_p,
          });
        }

        const fullResponse =
          response.choices[0]?.message?.content ||
          "Failed to generate response";
        const sentences = splitIntoSentences(fullResponse);

        return {
          fullResponse,
          sentences,
        };
      } catch (error) {
        console.error(`Generation attempt ${attempt + 1} failed:`, error);
        lastError = error as Error;

        if (attempt < maxAttempts - 1) {
          switchToNextToken();
        }
      }
    }

    console.error("All API key attempts failed");
    throw lastError || new Error("Text generation failed with all API keys");
  };

  return {
    generateText,
  };
};
