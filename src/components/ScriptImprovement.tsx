
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb, Loader2, CheckCircle, ArrowRight, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { psychologicalTactics } from '@/utils/tacticAnalyzer';

interface ScriptImprovementProps {
  originalScript: string;
  onImprovedScript: (improvedScript: string, improvement: string, changesSummary: string) => void;
}

export const ScriptImprovement: React.FC<ScriptImprovementProps> = ({
  originalScript,
  onImprovedScript
}) => {
  const [isImproving, setIsImproving] = useState(false);
  const [currentImprovement, setCurrentImprovement] = useState<string>('');
  const [lastImprovement, setLastImprovement] = useState<{
    type: string;
    changes: string;
    preview: string;
  } | null>(null);

  // Generate improvements based on enhanced tactics library
  const generateImprovements = () => {
    const hookTactics = psychologicalTactics.filter(t => t.category === 'Hook');
    const retentionTactics = psychologicalTactics.filter(t => t.category === 'Retention');
    const emotionalTactics = psychologicalTactics.filter(t => t.category === 'Emotional');
    const persuasionTactics = psychologicalTactics.filter(t => t.category === 'Persuasion');
    const algorithmTactics = psychologicalTactics.filter(t => t.category === 'Algorithm');

    return [
      {
        title: "Apply Information Gap Hook",
        description: hookTactics.find(t => t.name === "Information Gap Hook")?.description || "Creates curiosity by revealing partial information",
        impact: "High",
        instruction: `Apply the Information Gap Hook tactic: ${hookTactics.find(t => t.name === "Information Gap Hook")?.description}. Use examples like: ${hookTactics.find(t => t.name === "Information Gap Hook")?.examples.join(', ')}`
      },
      {
        title: "Add Micro-Hook Escalation",
        description: retentionTactics.find(t => t.name === "Micro-Hook Escalation")?.description || "Use escalating phrases every 15-30 seconds",
        impact: "High",
        instruction: `Implement Micro-Hook Escalation: ${retentionTactics.find(t => t.name === "Micro-Hook Escalation")?.description}. Add phrases like: ${retentionTactics.find(t => t.name === "Micro-Hook Escalation")?.examples.join(', ')}`
      },
      {
        title: "Strengthen Dream Selling",
        description: emotionalTactics.find(t => t.name === "Dream Selling")?.description || "Paint a picture of the desired outcome",
        impact: "High",
        instruction: `Apply Dream Selling technique: ${emotionalTactics.find(t => t.name === "Dream Selling")?.description}. Use examples like: ${emotionalTactics.find(t => t.name === "Dream Selling")?.examples.join(', ')}`
      },
      {
        title: "Add Social Proof Elements",
        description: persuasionTactics.find(t => t.name === "Social Proof")?.description || "Uses testimonials and success stories",
        impact: "High",
        instruction: `Integrate Social Proof: ${persuasionTactics.find(t => t.name === "Social Proof")?.description}. Include elements like: ${persuasionTactics.find(t => t.name === "Social Proof")?.examples.join(', ')}`
      },
      {
        title: "Optimize for Watch Time",
        description: algorithmTactics.find(t => t.name === "Watch Time Optimization")?.description || "Structure content to maximize view duration",
        impact: "Medium",
        instruction: `Apply Watch Time Optimization: ${algorithmTactics.find(t => t.name === "Watch Time Optimization")?.description}. Use techniques like: ${algorithmTactics.find(t => t.name === "Watch Time Optimization")?.examples.join(', ')}`
      },
      {
        title: "Add Pattern Interrupts",
        description: retentionTactics.find(t => t.name === "Pattern Interrupt")?.description || "Sudden changes in tone, pace, or topic",
        impact: "Medium",
        instruction: `Implement Pattern Interrupts: ${retentionTactics.find(t => t.name === "Pattern Interrupt")?.description}. Use phrases like: ${retentionTactics.find(t => t.name === "Pattern Interrupt")?.examples.join(', ')}`
      },
      {
        title: "Enhance Financial Freedom Appeal",
        description: emotionalTactics.find(t => t.name === "Financial Freedom Appeal")?.description || "Tap into desires for financial independence",
        impact: "High",
        instruction: `Apply Financial Freedom Appeal: ${emotionalTactics.find(t => t.name === "Financial Freedom Appeal")?.description}. Use concepts like: ${emotionalTactics.find(t => t.name === "Financial Freedom Appeal")?.examples.join(', ')}`
      },
      {
        title: "Add Scarcity Elements",
        description: persuasionTactics.find(t => t.name === "Scarcity")?.description || "Creates urgency through limited availability",
        impact: "Medium",
        instruction: `Implement Scarcity: ${persuasionTactics.find(t => t.name === "Scarcity")?.description}. Use phrases like: ${persuasionTactics.find(t => t.name === "Scarcity")?.examples.join(', ')}`
      }
    ];
  };

  const improvements = generateImprovements();

  const handleImprovement = async (improvement: any) => {
    setIsImproving(true);
    setCurrentImprovement(improvement.title);

    try {
      const { data, error } = await supabase.functions.invoke('improve-script', {
        body: {
          originalScript,
          improvementType: improvement.title,
          improvementInstruction: improvement.instruction,
          description: improvement.description
        }
      });

      if (error) {
        console.error('Script improvement error:', error);
        throw error;
      }

      if (data.success) {
        // Check word count limit
        const validation = validateWordCount(data.improvedScript);
        if (!validation.isValid) {
          throw new Error(`Improved script exceeds word limit: ${validation.errorMessage}`);
        }

        const changesSummary = extractChangesSummary(data.improvedScript, improvement.title);
        const preview = extractPreview(data.improvedScript);
        
        setLastImprovement({
          type: improvement.title,
          changes: changesSummary,
          preview: preview
        });

        onImprovedScript(data.improvedScript, improvement.title, changesSummary);
      }
    } catch (error) {
      console.error('Error improving script:', error);
      const improvedScript = applyBasicImprovement(originalScript, improvement);
      
      // Check word count limit for fallback improvement
      const validation = validateWordCount(improvedScript);
      if (!validation.isValid) {
        alert(`Cannot apply improvement: ${validation.errorMessage} Please try a different improvement or reduce your script length first.`);
        setIsImproving(false);
        setCurrentImprovement('');
        return;
      }
      
      const changesSummary = `Applied ${improvement.title}: ${improvement.description}`;
      
      setLastImprovement({
        type: improvement.title,
        changes: changesSummary,
        preview: improvedScript.substring(0, 200) + "..."
      });

      onImprovedScript(improvedScript, improvement.title, changesSummary);
    } finally {
      setIsImproving(false);
      setCurrentImprovement('');
    }
  };

  const extractChangesSummary = (improvedScript: string, improvementType: string): string => {
    const improvedSections = improvedScript.match(/\*\*\[IMPROVED\]\*\*(.*?)(?=\*\*\[IMPROVED\]\*\*|$)/gs);
    
    if (improvedSections && improvedSections.length > 0) {
      return `${improvementType} applied in ${improvedSections.length} section(s):\n\n${improvedSections.map((section, index) => 
        `${index + 1}. ${section.replace(/\*\*\[IMPROVED\]\*\*/g, '').trim().substring(0, 150)}...`
      ).join('\n\n')}`;
    }
    
    return `${improvementType} has been applied throughout the script to enhance its effectiveness.`;
  };

  const extractPreview = (improvedScript: string): string => {
    const firstImproved = improvedScript.match(/\*\*\[IMPROVED\]\*\*(.*?)(?=\n\n|\*\*\[IMPROVED\]\*\*|$)/s);
    
    if (firstImproved) {
      return firstImproved[1].trim().substring(0, 300) + "...";
    }
    
    return improvedScript.substring(0, 300) + "...";
  };

  const applyBasicImprovement = (script: string, improvement: any): string => {
    switch (improvement.title) {
      case "Apply Information Gap Hook":
        return `**[IMPROVED HOOK]**\n"What I'm about to reveal will completely change how you see this topic - but first, let me show you why 97% of people get this wrong."\n\n${script}`;
      case "Add Micro-Hook Escalation":
        return script.replace(
          /\n\n/g,
          `\n\n**[IMPROVED - MICRO-HOOK ADDED]**\nBut wait, it gets even better...\n\n`
        );
      case "Strengthen Dream Selling":
        return script.replace(
          /(solution|result|outcome)/i,
          `$1\n\n**[IMPROVED - DREAM SELLING ADDED]**\nPicture yourself achieving this exact result - imagine the freedom, the confidence, the transformation...`
        );
      default:
        return `**[IMPROVED VERSION - ${improvement.title.toUpperCase()}]**\n${script}\n\n**Enhancement Applied:** ${improvement.description}`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          Enhanced Script Improvements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {lastImprovement && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  {lastImprovement.type} Applied Successfully
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-1">What Changed:</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{lastImprovement.changes}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1">Preview of Changes:</h4>
                    <div className="bg-white p-3 rounded border text-sm italic">
                      "{lastImprovement.preview}"
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setLastImprovement(null)}
                    className="text-xs"
                  >
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {improvements.map((improvement, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{improvement.title}</h4>
                <div className="flex items-center gap-2">
                  <Badge variant={improvement.impact === 'High' ? 'destructive' : 'secondary'}>
                    {improvement.impact} Impact
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => handleImprovement(improvement)}
                    disabled={isImproving}
                    className="ml-2"
                  >
                    {isImproving && currentImprovement === improvement.title ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        Improving...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4 mr-1" />
                        Apply
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{improvement.description}</p>
              <p className="text-xs text-gray-500">
                <strong>Enhancement:</strong> {improvement.instruction}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
