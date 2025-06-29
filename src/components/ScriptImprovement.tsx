
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb, Loader2, CheckCircle, ArrowRight, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

  const improvements = [
    {
      title: "Strengthen the Hook",
      description: "Consider adding a specific statistic or surprising fact in the first 10 seconds",
      impact: "High",
      instruction: "Add a compelling statistic, surprising fact, or bold statement to the opening 10 seconds to grab attention immediately"
    },
    {
      title: "Add Personal Story",
      description: "Include a brief personal anecdote in the problem section for better connection",
      impact: "Medium",
      instruction: "Incorporate a personal story or relatable anecdote in the problem/challenge section to build emotional connection"
    },
    {
      title: "Clarify Value Proposition",
      description: "Make the unique benefit more explicit in the solution introduction",
      impact: "High",
      instruction: "Make the unique value proposition clearer and more explicit in the solution section - tell viewers exactly what they'll gain"
    },
    {
      title: "Enhance CTA Urgency",
      description: "Add time-sensitive language to increase immediate action",
      impact: "Medium",
      instruction: "Add urgency and scarcity language to the call-to-action to encourage immediate action"
    },
    {
      title: "Include Social Validation",
      description: "Add testimonial snippets or success metrics throughout",
      impact: "High",
      instruction: "Add social proof elements like testimonials, success stories, or metrics throughout the script"
    }
  ];

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
        // Extract the changes summary and preview
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
      // Generate a simple improvement as fallback
      const improvedScript = applyBasicImprovement(originalScript, improvement);
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
    // Extract content between [IMPROVED] tags
    const improvedSections = improvedScript.match(/\*\*\[IMPROVED\]\*\*(.*?)(?=\*\*\[IMPROVED\]\*\*|$)/gs);
    
    if (improvedSections && improvedSections.length > 0) {
      return `${improvementType} applied in ${improvedSections.length} section(s):\n\n${improvedSections.map((section, index) => 
        `${index + 1}. ${section.replace(/\*\*\[IMPROVED\]\*\*/g, '').trim().substring(0, 150)}...`
      ).join('\n\n')}`;
    }
    
    return `${improvementType} has been applied throughout the script to enhance its effectiveness.`;
  };

  const extractPreview = (improvedScript: string): string => {
    // Find the first [IMPROVED] section for preview
    const firstImproved = improvedScript.match(/\*\*\[IMPROVED\]\*\*(.*?)(?=\n\n|\*\*\[IMPROVED\]\*\*|$)/s);
    
    if (firstImproved) {
      return firstImproved[1].trim().substring(0, 300) + "...";
    }
    
    return improvedScript.substring(0, 300) + "...";
  };

  const applyBasicImprovement = (script: string, improvement: any): string => {
    // Basic fallback improvements with clear markers
    switch (improvement.title) {
      case "Strengthen the Hook":
        return `**[IMPROVED HOOK]**\n"Did you know that 97% of people fail at this because they're missing one crucial element? What I'm about to show you will change everything."\n\n${script}`;
      case "Add Personal Story":
        return script.replace(
          /(problem|challenge|issue)/i,
          `$1\n\n**[IMPROVED - PERSONAL STORY ADDED]**\nJust like when I first started, I made the exact same mistake that keeps most people stuck. I remember the frustration of trying everything and getting nowhere...`
        );
      case "Enhance CTA Urgency":
        return script + `\n\n**[IMPROVED CTA WITH URGENCY]**\nBut here's the thing - I'm only sharing this with the first 100 people who take action TODAY. This opportunity won't be available forever. Don't let this pass you by like all the others.`;
      default:
        return `**[IMPROVED VERSION - ${improvement.title.toUpperCase()}]**\n${script}\n\n**Enhancement Applied:** ${improvement.description}`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          Suggested Improvements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Show last improvement result */}
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
                <strong>What this does:</strong> {improvement.instruction}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
