
"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Loader2 } from "lucide-react";
import { draftDocument } from "@/ai/flows/draft-document";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "./ui/skeleton";
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, PageSize } from 'docx';
import { saveAs } from 'file-saver';
import { Input } from "./ui/input";

export default function DraftingAgent() {
  const [documentType, setDocumentType] = useState("");
  const [language, setLanguage] = useState("English");
  const [userInputs, setUserInputs] = useState({
    party1Name: "",
    party1Address: "",
    party2Name: "",
    party2Address: "",
    agreementDetails: ""
  });
  const [generatedDraft, setGeneratedDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const templates = ["Rent Agreement", "Sale Deed", "Affidavit", "Bail Application", "Arbitration Form", "NDA", "Power of Attorney", "MOU"];
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleDraft = async () => {
    if (!documentType || !userInputs.party1Name || !userInputs.party2Name || !userInputs.agreementDetails) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please select a document type and fill in all required party and detail fields.",
        });
        return;
    }
    setIsLoading(true);
    setGeneratedDraft("");
    try {
        const result = await draftDocument({
            documentType,
            language,
            userInputs: JSON.stringify(userInputs),
        });
        setGeneratedDraft(result.draftContent);
    } catch (error) {
        console.error("Draft generation failed:", error);
        toast({
            variant: "destructive",
            title: "Draft Generation Failed",
            description: "An error occurred while generating the document. Please try again.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([generatedDraft], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentType.replace(/[\s/]/g, "_")}_${language}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleDownloadPdf = () => {
    const doc = new jsPDF({
      format: 'a4'
    });

    const margin = 15;
    const pageHeight = doc.internal.pageSize.getHeight();
    const textLines = doc.splitTextToSize(generatedDraft, doc.internal.pageSize.getWidth() - margin * 2);
    
    let cursor = margin;
    textLines.forEach((line: string) => {
        if (cursor > pageHeight - margin) {
            doc.addPage();
            cursor = margin;
        }
        doc.text(line, margin, cursor);
        cursor += 7; // Line height
    });
    doc.save(`${documentType.replace(/[\s/]/g, "_")}_${language}.pdf`);
  };

  const handleDownloadDocx = () => {
    const doc = new Document({
        sections: [{
            properties: {
                pageSize: {
                    width: PageSize.A4.width,
                    height: PageSize.A4.height,
                    orientation: PageSize.A4.orientation,
                },
            },
            children: generatedDraft.split('\n').map(text => new Paragraph({
                text: text,
                spacing: { after: 200 },
            })),
        }],
    });

    Packer.toBlob(doc).then(blob => {
        saveAs(blob, `${documentType.replace(/[\s/]/g, "_")}_${language}.docx`);
    });
  };


  return (
    <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10">
            <h1 className="text-3xl font-bold text-primary">AI Legal Drafting Agent</h1>
            <p className="text-muted-foreground mt-1">
                Generate precise, jurisdiction-compliant legal documents through voice or text.
            </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <Card className="bg-white shadow-none border-border">
                    <CardHeader>
                        <CardTitle>Drafting Inputs</CardTitle>
                        <CardDescription>Fill in the details to generate your legal document.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="document-type">Document Type</Label>
                                <Select onValueChange={setDocumentType} value={documentType}>
                                    <SelectTrigger id="document-type">
                                        <SelectValue placeholder="Select a document..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {templates.map(template => (
                                            <SelectItem key={template} value={template}>
                                                {template}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="language">Language</Label>
                                <Select onValueChange={setLanguage} defaultValue="English">
                                    <SelectTrigger id="language">
                                        <SelectValue placeholder="Select language..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="English">English</SelectItem>
                                        <SelectItem value="Hindi">Hindi</SelectItem>
                                        <SelectItem value="Marathi">Marathi</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Party Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="party1Name">Party 1 Name (e.g., Landlord/Seller)</Label>
                                    <Input id="party1Name" name="party1Name" value={userInputs.party1Name} onChange={handleInputChange} placeholder="e.g., Suresh Patil" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="party2Name">Party 2 Name (e.g., Tenant/Buyer)</Label>
                                    <Input id="party2Name" name="party2Name" value={userInputs.party2Name} onChange={handleInputChange} placeholder="e.g., Arpit Dhote" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="party1Address">Party 1 Address</Label>
                                    <Input id="party1Address" name="party1Address" value={userInputs.party1Address} onChange={handleInputChange} placeholder="Full address" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="party2Address">Party 2 Address</Label>
                                    <Input id="party2Address" name="party2Address" value={userInputs.party2Address} onChange={handleInputChange} placeholder="Full address" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                             <Label htmlFor="agreementDetails">Key Details & Custom Clauses</Label>
                             <Textarea
                                id="agreementDetails"
                                name="agreementDetails"
                                placeholder="Enter all other relevant details, line by line. For a rent agreement, this could be:&#10;- Rent Amount: Rs. 12,000 per month&#10;- Security Deposit: Rs. 50,000&#10;- Lease Term: 11 months, starting from 1st Jan 2024&#10;- Property Address: Flat 101, ABC Apartments, Mumbai..."
                                value={userInputs.agreementDetails}
                                onChange={handleInputChange}
                                rows={8}
                             />
                        </div>
                         <Button onClick={handleDraft} disabled={isLoading || !documentType} className="w-full bg-accent text-white font-semibold py-3 rounded-lg hover:bg-accent/90">
                            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Draft...</> : "Generate Draft"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
            <div>
                 <Card className="bg-white shadow-none border-border h-full">
                    <CardHeader>
                        <CardTitle>Generated Draft</CardTitle>
                        <CardDescription>Review the AI-generated draft below. You can edit it before downloading.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading && (
                             <div className="space-y-4 p-6">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-1/2" />
                             </div>
                        )}
                        {generatedDraft && (
                            <div className="space-y-4">
                                <Textarea value={generatedDraft} onChange={(e) => setGeneratedDraft(e.target.value)} rows={20} className="bg-background font-mono text-xs"/>
                                <div className="flex gap-4">
                                     <Button onClick={handleDownloadTxt} variant="outline">Download .txt</Button>
                                     <Button onClick={handleDownloadPdf} variant="outline">Download .pdf</Button>
                                     <Button onClick={handleDownloadDocx} variant="outline">Download .docx</Button>
                                </div>
                            </div>
                        )}
                         {!isLoading && !generatedDraft && (
                            <div className="text-center text-muted-foreground py-16">
                                <p>Your generated draft will appear here.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>

    </main>
  );
}
