import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({apiKey: "AIzaSyDhXH5v9VknuSLZclH4NmQcL6ZZMNNTic0"})],
  enableTracingAndMetrics: true,
});
