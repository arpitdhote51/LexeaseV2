import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {firebase} from '@genkit-ai/firebase';

export const ai = genkit({
  plugins: [googleAI({apiKey: "AIzaSyDhXH5v9VknuSLZclH4NmQcL6ZZMNNTic0"})],
  model: 'googleai/gemini-2.5-flash',
  enableTracingAndMetrics: true,
});
