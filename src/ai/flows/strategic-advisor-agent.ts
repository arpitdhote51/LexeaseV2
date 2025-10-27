
'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing strategic advice on a legal document from both defendant and prosecutor perspectives.
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
  language: z.string().describe('The language for the analysis (e.g., "English", "Hindi").'),
});
export type StrategicAdvisorAgentInput = z.infer<typeof StrategicAdvisorAgentInputSchema>;

const CriticalPointSchema = z.object({
    point: z.string().describe("The identified critical point or argument."),
    importance: z.string().describe("Why this point is critical to the case."),
    strategy: z.string().describe("How to effectively argue or leverage this point."),
});

const AdviceSchema = z.object({
    caseStrengthScore: z.number().min(1).max(10).describe("An integer score from 1 (very weak) to 10 (very strong) assessing the overall strength of this party's position."),
    caseStrengthReasoning: z.string().describe("A concise justification for the provided case strength score, highlighting key factors for this party."),
    criticalPoints: z.array(CriticalPointSchema).describe("A list of the most critical points, arguments, or clauses for this party.")
});


const StrategicAdvisorAgentOutputSchema = z.object({
  defendantAdvice: AdviceSchema.describe("Strategic advice tailored for the defendant/accused party based on the document."),
  prosecutorAdvice: AdviceSchema.describe("Strategic advice tailored for the prosecutor/victim/plaintiff party based on the document."),
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
  prompt: `You are an AI assistant role-playing as two opposing senior legal strategists analyzing a single legal document.
  Your task is to provide two separate and distinct high-level strategic assessments: one for the defendant/accused, and one for the prosecutor/victim/plaintiff.
  The entire response must be in the requested language: {{{language}}}.

  For EACH party (Defendant and Prosecutor), you must provide:
  1.  **Assess Case Strength**: Read the entire document and evaluate the strength of that party's legal position. Provide a numerical score from 1 (very weak) to 10 (very strong).
  2.  **Justify the Score**: Briefly explain the reasoning behind your score for that party. Mention key factors like evidence, arguments, or vulnerabilities from their perspective.
  3.  **Identify Critical Points**: Extract the most critical points, arguments, or clauses that party should focus on. For each point, explain its importance and suggest a strategy for how they should argue or leverage it effectively.

  Document:
  {{{documentText}}}

  Please provide the complete output in the structured JSON format, with separate objects for 'defendantAdvice' and 'prosecutorAdvice'.
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
