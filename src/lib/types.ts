
import { PlainLanguageSummarizationOutput } from "@/ai/flows/plain-language-summary";
import { KeyEntityRecognitionOutput } from "@/ai/flows/key-entity-recognition";
import { RiskFlaggingOutput } from "@/ai/flows/risk-flagging";
import { StrategicAdvisorAgentOutput } from "@/ai/flows/strategic-advisor-agent";

export interface AnalysisResult {
  summary: PlainLanguageSummarizationOutput;
  entities: KeyEntityRecognitionOutput;
  risks: RiskFlaggingOutput;
  strategicAdvice: StrategicAdvisorAgentOutput;
}

export interface DocumentData {
  id: string;
  userId: string;
  fileName: string;
  documentDataUri: string;
  analysis: AnalysisResult;
  createdAt: any;
}
