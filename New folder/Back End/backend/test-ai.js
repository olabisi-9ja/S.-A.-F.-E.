import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: "dummy_key_if_not_provided"
});

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Hello"
    });
    console.log(response);
  } catch (err) {
    console.error("ERROR CAUGHT:", err);
  }
}

run();
