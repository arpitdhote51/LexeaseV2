
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
  documentType: z.string().describe('The type of legal document to draft (e.g., "Simple Affidavit", "Rent Agreement").'),
  language: z.string().describe('The language for the draft (e.g., "English", "Hindi").'),
  userInputs: z.string().describe('A JSON string containing structured user-provided details like party names, addresses, and specific clauses.'),
});
export type DraftDocumentInput = z.infer<typeof DraftDocumentInputSchema>;

const DraftDocumentOutputSchema = z.object({
  draftContent: z.string().describe('The generated legal document draft.'),
});
export type DraftDocumentOutput = z.infer<typeof DraftDocumentOutputSchema>;

// Tool to find relevant legal templates. In a real scenario, this would search a database or GCS.
const findRelevantTemplates = ai.defineTool(
  {
    name: 'findRelevantTemplates',
    description: 'Retrieves a template for a given legal document type.',
    inputSchema: z.object({
      documentType: z.string().describe('The type of document to search for (e.g., "Affidavit").'),
      language: z.string().describe('The language of the template required.'),
    }),
    outputSchema: z.object({
      template: z.string().describe('The content of the legal template.'),
    }),
  },
  async ({ documentType, language }) => {
    // Placeholder templates based on PRD.
    // This can be expanded to fetch from a file or a database.
    const templates: Record<string, string> = {
        'Affidavit': `
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
`,
        'Rent Agreement': `
RENT AGREEMENT

This Rent Agreement is made and executed on this [Date] day of [Month], [Year] at [City].

BETWEEN:

[Party 1 Name], residing at [Party 1 Address], hereinafter referred to as the "LANDLORD".

AND

[Party 2 Name], residing at [Party 2 Address], hereinafter referred to as the "TENANT".

The Landlord is the absolute owner of the property located at [Property Address].

The Landlord has agreed to let out the said property to the Tenant for a monthly rent of [Rent Amount].

NOW, THIS AGREEMENT WITNESSETH AS FOLLOWS:
1. The tenancy shall be for a period of [Lease Term].
2. The Tenant has paid a security deposit of [Security Deposit Amount].
[Add more user-provided details here]


IN WITNESS WHEREOF, the parties have executed this agreement.

WITNESSES:
1.

LANDLORD
[Party 1 Name]

2.

TENANT
[Party 2 Name]
`
    };
    
    return { template: templates[documentType] || `Template for ${documentType} in ${language} not found. Please provide details.` };
  }
);


// Agentic prompt that uses the tool
const draftingAgentPrompt = ai.definePrompt({
    name: 'draftingAgentPrompt',
    tools: [findRelevantTemplates],
    output: { schema: DraftDocumentOutputSchema },
    prompt: `
        You are an expert legal drafting assistant for Indian law.
        Your task is to generate a formal legal document based on user-provided details.

        1.  First, use the 'findRelevantTemplates' tool to retrieve the appropriate template for the requested document type and language.
        2.  Once you have the template, meticulously integrate the user-provided details into it. The user has provided details in a structured JSON format.
        3.  Carefully and accurately extract every piece of information from the user's JSON input and fill in all corresponding placeholders in the template (e.g., [Name], [Party 1 Name], [Party 1 Address], [Rent Amount], etc.).
        4.  If the user provides additional clauses or details under 'agreementDetails', integrate them logically into the body of the document.
        5.  Ensure the final document is coherent, professionally formatted, and complete. The final output must be only the raw text of the document itself.
        6.  Do not add any extra explanations, headers, titles, or conversational text. The output should be only the final, clean text of the legal draft, ready to be copied or downloaded.

        USER-PROVIDED DETAILS (JSON):
        ---
        Document Type: {{{documentType}}}
        Language: {{{language}}}
        Details: {{{userInputs}}}
        ---

        Generate the final document based *only* on the template and the user's details.
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
