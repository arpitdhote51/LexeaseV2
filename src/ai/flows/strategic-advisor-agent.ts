
'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing strategic advice on a legal document.
 *
 * It includes:
 * - `strategicAdvisorAgent`: The main function to trigger the flow.
 * - `StrategicAdvisorAgentInput`: The input type for the flow.
 * - `StrategicAdvisorAgentOutput`: The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StrategicAdvisorAgentInputSchema = z.object({
  documentText: z.string().describe("The text content of the document to analyze."),
});
export type StrategicAdvisorAgentInput = z.infer<typeof StrategicAdvisorAgentInputSchema>;

const CriticalPointSchema = z.object({
    point: z.string().describe("The identified critical point or argument."),
    importance: z.string().describe("Why this point is critical to the case."),
    strategy: z.string().describe("How to effectively argue or leverage this point."),
});

const StrategicAdvisorAgentOutputSchema = z.object({
  caseStrengthScore: z.number().min(1).max(10).describe("An integer score from 1 (very weak) to 10 (very strong) assessing the overall strength of the position presented in the document."),
  caseStrengthReasoning: z.string().describe("A concise justification for the provided case strength score, highlighting key factors."),
  criticalPoints: z.array(CriticalPointSchema).describe("A list of the most critical points, arguments, or clauses identified in the document.")
});
export type StrategicAdvisorAgentOutput = z.infer<typeof StrategicAdvisorAgentOutputSchema>;

export async function strategicAdvisorAgent(
  input: StrategicAdvisorAgentInput
): Promise<StrategicAdvisorAgentOutput> {
  return strategicAdvisorAgentFlow(input);
}

const strategicAdvisorAgentPrompt = ai.definePrompt({
  name: 'strategicAdvisorAgentPrompt',
  input: { schema: StrategicAdvisorAgentInputSchema },
  output: { schema: StrategicAdvisorAgentOutputSchema },
  prompt: `You are an AI assistant role-playing as a senior legal strategist.
  Your task is to analyze the provided legal document and offer a high-level strategic assessment.

  1.  **Assess Case Strength**: Read the entire document and evaluate the strength of the legal position presented. Provide a numerical score from 1 (very weak) to 10 (very strong).
  2.  **Justify the Score**: Briefly explain the reasoning behind your score. Mention the key factors that influenced your decision, such as the quality of evidence cited, the clarity of the arguments, or potential legal vulnerabilities.
  3.  **Identify Critical Points**: Extract the most critical points, arguments, or clauses from the document. For each point, explain why it is important and suggest a strategic approach for how to argue or leverage it effectively.

  Document:
  {{{documentText}}}

  Please provide the output in the structured JSON format.
`,
});

const strategicAdvisorAgentFlow = ai.defineFlow(
  {
    name: 'strategicAdvisorAgentFlow',
    inputSchema: StrategicAdvisorAgentInputSchema,
    outputSchema: StrategicAdvisorAgentOutputSchema,
  },
  async (input) => {
    const response = await strategicAdvisorAgentPrompt(input);
    return response.output!;
  }
);
