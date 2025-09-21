import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({
    // apiKey: process.env.GEMINI_API_KEY, // This is picked up automatically
  })],
  model: 'googleai/gemini-1.5-pro-latest',
  enableTracingAndMetrics: true,
});
