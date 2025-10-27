
"use client";
import { useState, useCallback, useEffect } from "react";
import { Loader2, FileUp, File as FileIcon, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as pdfjs from "pdfjs-dist";
import mammoth from "mammoth";

import {
  plainLanguageSummarization,
  PlainLanguageSummarizationInput,
  PlainLanguageSummarizationOutput,
} from "@/ai/flows/plain-language-summary";
import {
  keyEntityRecognition,
  KeyEntityRecognitionInput,
  KeyEntityRecognitionOutput,
} from "@/ai/flows/key-entity-recognition";
import {
  riskFlagging,
  RiskFlaggingInput,
  RiskFlaggingOutput,
} from "@/ai/flows/risk-flagging";
import {
  strategicAdvisorAgent,
  StrategicAdvisorAgentInput,
  StrategicAdvisorAgentOutput,
} from "@/ai/flows/strategic-advisor-agent";

import SummaryDisplay from "./summary-display";
import EntitiesDisplay from "./entities-display";
import RisksDisplay from "./risks-display";
import StrategicAdvisorDisplay from "./strategic-advisor-display";
import QAChat from "./qa-chat";
import { Skeleton } from "./ui/skeleton";
import type { DocumentData, AnalysisResult } from "@/lib/types";
import Header from "./layout/header";
import GoogleDrivePicker from "./google-drive-picker";

type UserRole = "layperson" | "lawStudent" | "lawyer";

interface LexeaseAppProps {
    existingDocument?: DocumentData | null;
}

export default function LexeaseApp({ existingDocument }: LexeaseAppProps) {
  const [documentText, setDocumentText] = useState("");
  const [userRole, setUserRole] = useState<UserRole>("layperson");
  const [isLoading, setIsLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const { toast } = useToast();
  
  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.mjs`;
  }, []);

  useEffect(() => {
    if (existingDocument) {
      setDocumentText(existingDocument.documentDataUri);
      if (existingDocument.analysis) {
        setAnalysisResult(existingDocument.analysis);
      }
      if(existingDocument.fileName) {
        setFile(new File([], existingDocument.fileName));
      }
    } else {
        setDocumentText("");
        setAnalysisResult(null);
        setFile(null);
        setUserRole("layperson");
    }
  }, [existingDocument]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        processFile(selectedFile);
    }
  };

  const processFile = async (fileToProcess: File) => {
    setFile(fileToProcess);
    setIsParsing(true);
    setDocumentText('');
    setAnalysisResult(null);
    
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!validTypes.includes(fileToProcess.type)) {
        toast({
            variant: 'destructive',
            title: 'Unsupported File Type',
            description: 'Please upload a .PDF, .DOCX, or .TXT file.',
        });
        setFile(null);
        setIsParsing(false);
        return;
    }

    try {
        let text = '';
        if (fileToProcess.type === 'application/pdf') {
            const arrayBuffer = await fileToProcess.arrayBuffer();
            const pdf = await pdfjs.getDocument(arrayBuffer).promise;
            let extractedText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                extractedText += content.items.map((item: any) => item.str).join(' ');
            }
            text = extractedText;
        } else if (fileToProcess.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const arrayBuffer = await fileToProcess.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            text = result.value;
        } else {
            text = await fileToProcess.text();
        }
        setDocumentText(text);
    } catch (error) {
        console.error('File parsing failed:', error);
        toast({
            variant: 'destructive',
            title: 'File Read Error',
            description: `Could not read the content of your document. Please try again.`,
        });
        setFile(null);
        setDocumentText('');
    } finally {
        setIsParsing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!documentText) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please upload a file to analyze.",
      });
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const summarizationInput: PlainLanguageSummarizationInput = { documentText, userRole };
      const entityInput: KeyEntityRecognitionInput = { documentText };
      const riskInput: RiskFlaggingInput = { documentText };
      const strategicInput: StrategicAdvisorAgentInput = { documentText };

      const [summary, entities, risks, strategicAdvice] = await Promise.all([
        plainLanguageSummarization(summarizationInput),
        keyEntityRecognition(entityInput),
        riskFlagging(riskInput),
        strategicAdvisorAgent(strategicInput),
      ]);
      
      const results = { summary, entities, risks, strategicAdvice };
      setAnalysisResult(results);

    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "An error occurred while analyzing the document. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdfReport = () => {
    if (!analysisResult || !file) return;

    const doc = new jsPDF();
    const { summary, entities, risks, strategicAdvice } = analysisResult;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(43, 108, 176); // primary color
    doc.text("LexEase Analysis Report", 15, 20);
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Document: ${file.name}`, 15, 28);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 34);

    let yPos = 50;

    // Helper to add sections
    const addSection = (title: string, body: () => void) => {
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text(title, 15, yPos);
        yPos += 8;
        doc.setLineWidth(0.5);
        doc.setDrawColor(200);
        doc.line(15, yPos, 195, yPos);
        yPos += 10;
        body();
    };

    // 1. Summary
    addSection("Plain Language Summary", () => {
        doc.setFontSize(11);
        doc.setTextColor(80);
        const summaryLines = doc.splitTextToSize(summary.plainLanguageSummary, 180);
        doc.text(summaryLines, 15, yPos);
        yPos += summaryLines.length * 5 + 10;
    });

    // 2. Strategic Advice
    addSection("Strategic Advisor", () => {
        doc.setFontSize(12);
        doc.setTextColor(40, 40, 40);
        doc.text(`Case Strength Score: ${strategicAdvice.caseStrengthScore}/10`, 15, yPos);
        yPos += 8;
        
        doc.setFontSize(11);
        doc.setTextColor(80);
        const reasoningLines = doc.splitTextToSize(`Reasoning: ${strategicAdvice.caseStrengthReasoning}`, 180);
        doc.text(reasoningLines, 15, yPos);
        yPos += reasoningLines.length * 5 + 5;

        (doc as any).autoTable({
            startY: yPos,
            head: [['Critical Point', 'Importance', 'Strategy']],
            body: strategicAdvice.criticalPoints.map(p => [p.point, p.importance, p.strategy]),
            theme: 'grid',
            headStyles: { fillColor: [43, 108, 176] },
            didDrawPage: (data: any) => { yPos = data.cursor.y + 10; }
        });
        yPos = (doc as any).lastAutoTable.finalY + 10;
    });

    // 3. Key Entities
    addSection("Key Entities", () => {
        const grouped = entities.entities.reduce((acc, entity) => {
            const type = entity.type || 'Uncategorized';
            if (!acc[type]) acc[type] = [];
            acc[type].push(entity.value);
            return acc;
        }, {} as Record<string, string[]>);

        Object.entries(grouped).forEach(([type, values]) => {
             if (yPos > 260) {
                doc.addPage();
                yPos = 20;
            }
            doc.setFontSize(12);
            doc.setTextColor(40, 40, 40);
            doc.text(type, 15, yPos);
            yPos += 6;
            
            doc.setFontSize(10);
            doc.setTextColor(80);
            const valuesText = values.join(', ');
            const textLines = doc.splitTextToSize(valuesText, 180);
            doc.text(textLines, 15, yPos);
            yPos += textLines.length * 5 + 4;
        });
        yPos += 5;
    });

    // 4. Risk Flags
    addSection("Risk Flags", () => {
        doc.setFontSize(11);
        doc.setTextColor(220, 53, 69); // destructive color
        risks.riskyClauses.forEach(risk => {
             if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
            const riskLines = doc.splitTextToSize(`• ${risk}`, 180);
            doc.text(riskLines, 15, yPos);
            yPos += riskLines.length * 5 + 4;
        });
    });

    doc.save(`${file.name.replace(/\.[^/.]+$/, "")}-report.pdf`);
  };
  
  const AnalysisPlaceholder = () => (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-1/3" />
      <div className="relative overflow-hidden rounded-md bg-muted h-40 w-full"><div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-background/30 to-transparent"></div></div>
      <Skeleton className="h-8 w-1/4" />
      <div className="relative overflow-hidden rounded-md bg-muted h-20 w-full"><div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-background/30 to-transparent"></div></div>
    </div>
  );
  
  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if(existingDocument || isLoading || isParsing || analysisResult) return;
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [existingDocument, isLoading, isParsing, analysisResult]);

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);


  return (
    <>
    <Header />
    <main className="flex-1 p-10 overflow-y-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        { !existingDocument && (
        <div className="lg:col-span-5">
          <Card className="sticky top-8 bg-card shadow-none border-border">
            <CardHeader>
              <CardTitle className="font-bold text-2xl text-foreground">Document Input</CardTitle>
              <CardDescription>
                Upload a new document for analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div
                className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl bg-background  ${!existingDocument && !analysisResult ? 'cursor-pointer hover:bg-muted/50' : 'cursor-not-allowed'}`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                >
                <input
                    id="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.txt"
                    disabled={isLoading || !!existingDocument || isParsing || !!analysisResult}
                />
                {isParsing ? (
                    <div className="text-center p-4">
                        <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
                        <p className="mt-4 font-semibold">Parsing Document...</p>
                        <p className="text-sm text-muted-foreground">Extracting text for analysis.</p>
                    </div>
                ) : file ? (
                    <div className="text-center p-4">
                        <FileIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-2 font-semibold truncate">{file.name}</p>
                         {!existingDocument && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2 text-red-500 hover:text-red-700"
                                onClick={() => {
                                    setFile(null);
                                    setDocumentText('');
                                    setAnalysisResult(null);
                                }}
                            >
                                <X className="mr-2 h-4 w-4" />
                                Remove
                            </Button>
                        )}
                    </div>
                ) : (
                    <label htmlFor="file-upload" className={`w-full h-full flex flex-col items-center justify-center text-center ${!existingDocument && !analysisResult ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                        <FileUp className="h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-sm font-semibold text-foreground">
                            Drag & drop or click to upload
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            PDF, DOCX, or TXT files
                        </p>
                    </label>
                )}
                </div>
                
                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-muted"></div>
                  <span className="flex-shrink mx-4 text-xs font-semibold text-muted-foreground">OR</span>
                  <div className="flex-grow border-t border-muted"></div>
                </div>

                <GoogleDrivePicker onFilePicked={processFile} />

              <div className="space-y-4">
                <Label className="font-semibold text-foreground">Select Your Role</Label>
                <RadioGroup
                  defaultValue="layperson"
                  className="flex flex-col sm:flex-row gap-4"
                  value={userRole}
                  onValueChange={(value: UserRole) => setUserRole(value)}
                  disabled={isLoading || !!existingDocument || isParsing || !!analysisResult}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="layperson" id="r1" />
                    <Label htmlFor="r1" className="text-foreground">Layperson</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lawStudent" id="r2" />
                    <Label htmlFor="r2" className="text-foreground">Law Student</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lawyer" id="r3" />
                    <Label htmlFor="r3" className="text-foreground">Lawyer</Label>
                  </div>
                </RadioGroup>
              </div>
              <Button onClick={handleAnalyze} disabled={isLoading || isParsing || !file || !!analysisResult || !documentText} className="w-full bg-accent text-white font-semibold py-3 rounded-lg hover:bg-accent/90 transition-transform transform hover:scale-105">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : analysisResult ? "Analysis Complete" : "Analyze Document" }
              </Button>
            </CardContent>
          </Card>
        </div>
        )}
        <div className={existingDocument ? "lg:col-span-12" : "lg:col-span-7"}>
          <Card className="bg-card shadow-none border-border">
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                    <CardTitle className="font-bold text-2xl text-foreground">
                        { file ? file.name : "Analysis Results" }
                    </CardTitle>
                    <CardDescription>
                        { existingDocument ? "Viewing analysis for your document." : "Here is a breakdown of your legal document." }
                    </CardDescription>
                </div>
                <Button onClick={handleDownloadPdfReport} disabled={!analysisResult} size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                </Button>
            </CardHeader>
            <CardContent>
              {(isLoading || isParsing) && !analysisResult ? <AnalysisPlaceholder /> :
                !analysisResult && !documentText && !existingDocument ? (
                  <div className="text-center text-muted-foreground py-16">
                    <p>Your analysis results will appear here once you upload and analyze a document.</p>
                  </div>
                ) : (
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-background">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="advisor">Strategic Advisor</TabsTrigger>
                    <TabsTrigger value="entities">Key Entities</TabsTrigger>
                    <TabsTrigger value="risks">Risk Flags</TabsTrigger>
                    <TabsTrigger value="qa" disabled={!documentText}>Q&A</TabsTrigger>
                  </TabsList>
                  {analysisResult ? (
                    <>
                      <TabsContent value="summary">
                        <SummaryDisplay summary={analysisResult.summary.plainLanguageSummary} />
                      </TabsContent>
                       <TabsContent value="advisor">
                        <StrategicAdvisorDisplay advice={analysisResult.strategicAdvice} />
                      </TabsContent>
                      <TabsContent value="entities">
                        <EntitiesDisplay entities={analysisResult.entities.entities} />
                      </TabsContent>
                      <TabsContent value="risks">
                        <RisksDisplay risks={analysisResult.risks.riskyClauses} />
                      </TabsContent>
                      <TabsContent value="qa">
                        <QAChat documentText={documentText} />
                      </TabsContent>
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground py-16">
                        {(isLoading || isParsing) ? (
                            <AnalysisPlaceholder />
                        ) : !documentText ? (
                            <p>Upload a document to get started.</p>
                        ) : (
                             <p>Click "Analyze Document" to see the results.</p>
                        )}
                    </div>
                  )}
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
    </>
  );
}
