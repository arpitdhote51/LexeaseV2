import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({apiKey: "AIzaSyDcFJTJnGLI-uVStqI8uuQVcQMY34ilMJg"})],
  enableTracingAndMetrics: true,
});
