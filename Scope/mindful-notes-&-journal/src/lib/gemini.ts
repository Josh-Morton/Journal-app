import { GoogleGenAI, Type } from '@google/genai';

const getApiKey = () => {
  return process.env.API_KEY || import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
};

export async function transcribeAudio(audioBase64: string, mimeType: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { data: audioBase64, mimeType } },
          { text: 'Transcribe this audio accurately. Only output the transcription, nothing else.' }
        ]
      }
    ]
  });
  return response.text || '';
}

export async function extractRecipeFromAudio(audioBase64: string, mimeType: string) {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { data: audioBase64, mimeType } },
          { text: 'Extract the recipe from this audio. Return a JSON object with "ingredients" (array of strings) and "steps" (array of strings).' }
        ]
      }
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
          steps: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['ingredients', 'steps']
      }
    }
  });
  
  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { ingredients: [], steps: [] };
  }
}

export async function updateRecipeWithAudio(currentRecipe: any, audioBase64: string, mimeType: string) {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        role: 'user',
        parts: [
          { text: `Current recipe: ${JSON.stringify(currentRecipe)}` },
          { inlineData: { data: audioBase64, mimeType } },
          { text: 'Update the current recipe based on the instructions in the audio. Return a JSON object with "ingredients" (array of strings) and "steps" (array of strings).' }
        ]
      }
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
          steps: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['ingredients', 'steps']
      }
    }
  });
  
  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return currentRecipe;
  }
}

export async function generateImage(prompt: string, size: '1K' | '2K' | '4K') {
  // @ts-ignore
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
    // @ts-ignore
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
    }
  }

  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        { text: prompt }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: '1:1',
        imageSize: size
      }
    }
  });
  
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  return null;
}

export async function chatWithBot(history: { role: 'user' | 'model', text: string }[], message: string) {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  const contents = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));
  
  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents,
    config: {
      systemInstruction: 'You are a helpful AI assistant integrated into a notes and journaling app.'
    }
  });
  
  return response.text || '';
}
