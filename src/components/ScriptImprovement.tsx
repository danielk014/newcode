
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ScriptImprovementProps {
  originalScript: string;
  onImprovedScript: (improvedScript: string, improvement: string) => void;
}

export const ScriptImprovement: React.FC<ScriptImprovementProps> = ({
  originalScript,
  onImprovedScript
}) => {
  const [isImproving, setIsImproving] = useState(false);
  const [currentImprovement, setCurrentImprovement] = useState<string>('');

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
        onImprovedScript(data.improvedScript, improvement.title);
      }
    } catch (error) {
      console.error('Error improving script:', error);
      // Generate a simple improvement as fallback
      const improvedScript = applyBasicImprovement(originalScript, improvement);
      onImprovedScript(improvedScript, improvement.title);
    } finally {
      setIsImproving(false);
      setCurrentImprovement('');
    }
  };

  const applyBasicImprovement = (script: string, improvement: any): string => {
    // Basic fallback improvements
    switch (improvement.title) {
      case "Strengthen the Hook":
        return script.replace(
          /^(.*?)$/m,
          "**IMPROVED HOOK:** \"Did you know that 97% of people fail at this because they're missing one crucial element? What I'm about to show you will change everything.\"\n\n$1"
        );
      case "Add Personal Story":
        return script.replace(
          /(problem|challenge|issue)/i,
          "$1\n\n**PERSONAL CONNECTION:** Just like when I first started, I made the exact same mistake that keeps most people stuck..."
        );
      case "Enhance CTA Urgency":
        return script.replace(
          /(call.to.action|cta)/i,
          "$1\n\n**URGENT:** But here's the thing - I'm only sharing this with the first 100 people who take action TODAY. Don't let this opportunity pass you by."
        );
      default:
        return `**IMPROVED VERSION:**\n${script}\n\n**Enhancement Applied:** ${improvement.description}`;
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
              <p className="text-sm text-gray-600">{improvement.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
