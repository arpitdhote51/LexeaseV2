
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { StrategicAdvisorAgentOutput } from "@/ai/flows/strategic-advisor-agent";
import { CheckCircle, Gavel, Shield, Target } from "lucide-react";

interface StrategicAdvisorDisplayProps {
  advice: StrategicAdvisorAgentOutput;
}

const AdviceCard = ({ title, advice, icon: Icon }: { title: string, advice: any, icon: React.ElementType }) => {
    
    const getProgressColor = (score: number) => {
        if (score <= 3) return "bg-red-500";
        if (score <= 6) return "bg-yellow-500";
        return "bg-green-500";
    };

    return (
        <div className="space-y-6 p-6 bg-background rounded-lg">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Icon className="text-primary"/>
                {title}
            </h3>
            
            <div>
                <h4 className="text-md font-semibold text-muted-foreground mb-2">Case Strength Assessment</h4>
                <div className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-800 rounded-lg border border-border">
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-primary">{advice.caseStrengthScore}</span>
                        <span className="text-xs text-muted-foreground">/ 10</span>
                    </div>
                    <div className="flex-1">
                        <Progress value={advice.caseStrengthScore * 10} className={`h-3 [&>div]:${getProgressColor(advice.caseStrengthScore)}`} />
                    </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2 italic">{advice.caseStrengthReasoning}</p>
            </div>

            <div>
                <h4 className="text-md font-semibold text-muted-foreground mb-2">Critical Points & Strategy</h4>
                {advice.criticalPoints.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                        {advice.criticalPoints.map((item: any, index: number) => (
                            <AccordionItem value={`item-${index}`} key={index} className="border-border bg-white dark:bg-zinc-800/50 rounded-lg px-4 mb-2">
                                <AccordionTrigger className="text-left font-semibold text-foreground/90 hover:no-underline">
                                    {item.point}
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-2">
                                    <div>
                                        <h5 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1"><Target size={16} className="text-primary"/>Importance</h5>
                                        <p className="text-sm text-foreground/80 pl-6">{item.importance}</p>
                                    </div>
                                    <div>
                                        <h5 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1"><CheckCircle size={16} className="text-green-500"/>Recommended Strategy</h5>
                                        <p className="text-sm text-foreground/80 pl-6">{item.strategy}</p>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <p className="text-muted-foreground">No specific critical points were identified by the advisor for this party.</p>
                )}
            </div>
        </div>
    );
};


export default function StrategicAdvisorDisplay({ advice }: StrategicAdvisorDisplayProps) {
  const { defendantAdvice, prosecutorAdvice } = advice;

  return (
    <Card className="mt-4 bg-white border-border shadow-none animate-fade-in">
      <CardHeader>
        <CardTitle className="font-bold text-lg text-foreground flex items-center gap-2">
          <Shield className="text-primary" />
          Strategic Advisor
        </CardTitle>
        <CardDescription>A dual-perspective AI assessment of your document's strategic standing.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdviceCard title="For the Defendant / Accused" advice={defendantAdvice} icon={Shield} />
            <AdviceCard title="For the Prosecutor / Victim" advice={prosecutorAdvice} icon={Gavel} />
        </div>
      </CardContent>
    </Card>
  );
}
