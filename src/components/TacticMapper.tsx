
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Clock, BarChart3 } from 'lucide-react';

interface TacticMapperProps {
  tactics: any[];
  scriptSections?: any[];
}

export const TacticMapper: React.FC<TacticMapperProps> = ({ tactics, scriptSections }) => {
  const tacticCategories = {
    'Hook': ['Pattern Interrupt', 'Curiosity Gap', 'Shocking Statistics'],
    'Narrative': ['Open Loops', 'Future Pacing', 'Story Arcs'],
    'Persuasion': ['Social Proof', 'Scarcity', 'Authority', 'Reciprocity'],
    'Engagement': ['Direct Address', 'Rhetorical Questions', 'Pattern Variation'],
    'Emotional': ['Fear Appeal', 'Aspirational Imagery', 'Empathy Building'],
    'Retention': ['Breadcrumbing', 'Micro Commitments', 'Segmentation']
  };

  return (
    <div className="space-y-6">
      <Card className="glass-effect border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Tactic Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(tacticCategories).map(([category, categoryTactics]) => (
              <div key={category} className="p-4 border border-border rounded-lg bg-muted/20">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">{category}</h4>
                  <Badge variant="secondary">{categoryTactics.length}</Badge>
                </div>
                <Progress value={Math.random() * 100} className="h-2 mb-3" />
                <div className="space-y-1">
                  {categoryTactics.slice(0, 3).map((tactic, index) => (
                    <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      {tactic}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
