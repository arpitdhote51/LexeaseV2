
'use server';

/**
 * @fileOverview A Genkit flow to list available templates.
 *
 * - listTemplates - A function that returns a list of template file names.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ListTemplatesOutputSchema = z.object({
  templates: z.array(z.string()).describe('A list of available template file names.'),
});
export type ListTemplatesOutput = z.infer<typeof ListTemplatesOutputSchema>;

export async function listTemplates(): Promise<ListTemplatesOutput> {
  return listTemplatesFlow();
}

const listTemplatesFlow = ai.defineFlow(
  {
    name: 'listTemplatesFlow',
    inputSchema: z.void(),
    outputSchema: ListTemplatesOutputSchema,
  },
  async () => {
    console.warn('GCS template listing is disabled. Returning empty list.');
    // In a real scenario, you would connect to a database or storage.
    // For now, we return an empty array to prevent errors.
    return { templates: [] };
  }
);
