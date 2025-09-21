
'use server';

/**
 * @fileOverview An AI agent for drafting legal documents using a tool-based approach.
 *
 * - draftDocument - A function that handles the document drafting process.
 * - DraftDocumentInput - The input type for the draftDocument function.
 * - DraftDocumentOutput - The return type for the draftDocument function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DraftDocumentInputSchema = z.object({
  documentType: z.string().describe('The type of legal document to draft (e.g., "Simple Affidavit").'),
  language: z.string().describe('The language for the draft (e.g., "English", "Hindi").'),
  userInputs: z.string().describe('A string containing user-provided details to fill into the document.'),
});
export type DraftDocumentInput = z.infer<typeof DraftDocumentInputSchema>;

const DraftDocumentOutputSchema = z.object({
  draftContent: z.string().describe('The generated legal document draft.'),
});
export type DraftDocumentOutput = z.infer<typeof DraftDocumentOutputSchema>;

// Tool to find relevant legal templates from GCS.
const findRelevantTemplates = ai.defineTool(
  {
    name: 'findRelevantTemplates',
    description: 'Retrieves a template from Google Cloud Storage for a given legal document type.',
    inputSchema: z.object({
      documentType: z.string().describe('The type of document to search for (e.g., "Affidavit").'),
      language: z.string().describe('The language of the template required.'),
    }),
    outputSchema: z.object({
      template: z.string().describe('The content of the legal template.'),
    }),
  },
  async ({ documentType, language }) => {
    // This flow is now disabled as it requires credentials that are not available.
    // Returning a placeholder template.
    console.warn("GCS template retrieval is disabled. Using a placeholder.");
    
    // In a real scenario, you would need to configure Google Cloud credentials.
    // For now, we return a simple, hardcoded template to allow the flow to complete.
    if (documentType === 'Affidavit') {
        return { template: `
BEFORE THE NOTARY PUBLIC AT [City]
AFFIDAVIT

I, [Name], son/daughter of [Father's Name], aged [Age] years, residing at [Address], do hereby solemnly affirm and declare as under:

1. That I am the deponent herein and a citizen of India.
2. That the facts stated in this affidavit are true to my knowledge.
[Add more user-provided details here]

DEPONENT

VERIFICATION
Verified at [City] on this [Date] day of [Month], [Year] that the contents of the above affidavit are true and correct to the best of my knowledge and belief.

DEPONENT
`};
    }
    
    return { template: `Template for ${documentType} in ${language} not found. Please provide details.` };
  }
);


// Agentic prompt that uses the tool
const draftingAgentPrompt = ai.definePrompt({
    name: 'draftingAgentPrompt',
    tools: [findRelevantTemplates],
    output: { schema: DraftDocumentOutputSchema },
    prompt: `
        You are an expert legal drafting assistant.
        Your task is to generate a formal legal document based on user-provided details.

        1. First, use the 'findRelevantTemplates' tool to retrieve the appropriate template for the requested document type and language.
        2. Once you have the template, carefully integrate the user-provided details into it. Fill in all placeholders like [Name], [Age], [Address], [Degree/Certificate Type], [Registration Number], etc., with the information from the user's input. The user's input may not be structured, so intelligently extract the information.
        3. Ensure the final document is coherent, complete, and professionally formatted based on the structure of the retrieved template.

        USER-PROVIDED DETAILS:
        ---
        Document Type: {{{documentType}}}
        Language: {{{language}}}
        Details: {{{userInputs}}}
        ---

        Generate the final document in the requested language only. Do not add any extra explanations, headers, or conversational text.
    `,
});


export async function draftDocument(input: DraftDocumentInput): Promise<DraftDocumentOutput> {
  return draftDocumentFlow(input);
}

const draftDocumentFlow = ai.defineFlow(
  {
    name: 'draftDocumentFlow',
    inputSchema: DraftDocumentInputSchema,
    outputSchema: DraftDocumentOutputSchema,
  },
  async (input) => {
    const response = await draftingAgentPrompt(input);
    return response.output!;
  }
);
