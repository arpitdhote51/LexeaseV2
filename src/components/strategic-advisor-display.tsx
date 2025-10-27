
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { StrategicAdvisorAgentOutput } from "@/ai/flows/strategic-advisor-agent";
import { CheckCircle, Shield, Target } from "lucide-react";

interface StrategicAdvisorDisplayProps {
  advice: StrategicAdvisorAgentOutput;
}

export default function StrategicAdvisorDisplay({ advice }: StrategicAdvisorDisplayProps) {
  const { caseStrengthScore, caseStrengthReasoning, criticalPoints } = advice;

  const getProgressColor = (score: number) => {
    if (score <= 3) return "bg-red-500";
    if (score <= 6) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card className="mt-4 bg-white border-border shadow-none animate-fade-in">
      <CardHeader>
        <CardTitle className="font-bold text-lg text-foreground flex items-center gap-2">
          <Shield className="text-primary" />
          Strategic Advisor
        </CardTitle>
        <CardDescription>An AI-powered assessment of your document's strategic standing.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Case Strength Section */}
        <div>
            <h3 className="text-md font-semibold text-foreground mb-2">Case Strength Assessment</h3>
            <div className="flex items-center gap-4 p-4 bg-background rounded-lg">
                <div className="flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-primary">{caseStrengthScore}</span>
                    <span className="text-xs text-muted-foreground">/ 10</span>
                </div>
                <div className="flex-1">
                     <Progress value={caseStrengthScore * 10} className={`h-3 [&>div]:${getProgressColor(caseStrengthScore)}`} />
                </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2 italic">{caseStrengthReasoning}</p>
        </div>

        {/* Critical Points Section */}
        <div>
             <h3 className="text-md font-semibold text-foreground mb-2">Critical Points & Strategy</h3>
             {criticalPoints.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                    {criticalPoints.map((item, index) => (
                        <AccordionItem value={`item-${index}`} key={index} className="border-border">
                            <AccordionTrigger className="text-left font-semibold text-foreground/90 hover:no-underline">
                                {item.point}
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-2">
                                <div>
                                    <h4 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1"><Target size={16} className="text-primary"/>Importance</h4>
                                    <p className="text-sm text-foreground/80 pl-6">{item.importance}</p>
                                </div>
                                 <div>
                                    <h4 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1"><CheckCircle size={16} className="text-green-500"/>Recommended Strategy</h4>
                                    <p className="text-sm text-foreground/80 pl-6">{item.strategy}</p>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
             ) : (
                <p className="text-muted-foreground">No specific critical points were identified by the advisor.</p>
             )}
        </div>
      </CardContent>
    </Card>
  );
}
