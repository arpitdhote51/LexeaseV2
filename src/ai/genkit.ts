import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {firebase} from '@genkit-ai/firebase';

export const ai = genkit({
  plugins: [googleAI({apiKey: "YOUR_GEMINI_API_KEY_HERE"})],
  model: 'googleai/gemini-2.5-flash',
  enableTracingAndMetrics: true,
});
