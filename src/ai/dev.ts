
import { config } from 'dotenv';
config();

import { express } from 'genkit';
import * as process from 'process';

import '@/ai/flows/plain-language-summary.ts';
import '@/ai/flows/key-entity-recognition.ts';
import '@/ai/flows/risk-flagging.ts';
import '@/ai/flows/interactive-qa.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/draft-document.ts';
import '@/ai/flows/list-templates.ts';
import '@/ai/flows/general-legal-qa.ts';

const app = express();

const port = process.env.GENKIT_PORT || 3400;
const nextPort = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Genkit listening on http://localhost:${port}`);
  const next = require('next');
  const nextApp = next({ dev: true, port: nextPort });
  const nextHandle = nextApp.getRequestHandler();

  nextApp.prepare().then(() => {
    console.log(`Next.js ready on http://localhost:${nextPort}`);
    app.all('*', (req: any, res: any) => {
      return nextHandle(req, res);
    });
  });
});
