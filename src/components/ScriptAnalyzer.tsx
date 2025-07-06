
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Brain, Zap, Target, Lightbulb, BarChart3, ExternalLink } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface ScriptAnalyzerProps {
  analysis: any;
  onGenerate: () => void;
  currentStep: number;
}

export function ScriptAnalyzer({ analysis, onGenerate, currentStep }: ScriptAnalyzerProps) {
  const location = useLocation();
  
  // Create state to pass to tactics library
  const tacticsNavigationState = {
    from: location.pathname,
    currentStep: currentStep,
    analysis: analysis
  };

  // Safely extract tactics array
  const synthesizedTactics = Array.isArray(analysis?.synthesizedTactics) 
    ? analysis.synthesizedTactics 
    : [];

  // Safely extract insights array
  const insights = Array.isArray(analysis?.insights) 
    ? analysis.insights 
    : [];

  // Safely extract blueprint string
  const blueprint = typeof analysis?.blueprint === 'string' 
    ? analysis.blueprint 
    : 'Blueprint analysis in progress...';

  return (
    <div className="space-y-6">
      {/* Analysis Results Header */}
      <Card className="shadow-lg border border-border bg-card">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl flex items-center justify-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Deep Script Analysis Complete
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            AI has identified viral tactics and psychological triggers in your reference scripts
          </p>
        </CardHeader>
      </Card>

      {/* Synthesized Viral Tactics */}
      <Card className="shadow-lg border border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Synthesized Viral Tactics
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Common psychological patterns found across your reference scripts
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {synthesizedTactics.length > 0 ? (
              synthesizedTactics.map((tactic: any, index: number) => (
                <div key={index} className="p-4 bg-accent/50 rounded-lg border border-border">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-foreground">
                      {typeof tactic === 'string' ? tactic : tactic?.name || `Tactic ${index + 1}`}
                    </h4>
                    {typeof tactic === 'object' && tactic?.category && (
                      <Badge variant="secondary" className="text-xs">
                        {tactic.category}
                      </Badge>
                    )}
                  </div>
                  {typeof tactic === 'object' && tactic?.description && (
                    <p className="text-sm text-muted-foreground mb-2">{tactic.description}</p>
                  )}
                  {typeof tactic === 'object' && tactic?.frequency && (
                    <div className="text-xs text-muted-foreground">
                      <strong>Found in:</strong> {tactic.frequency} scripts
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 bg-accent/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">No specific tactics identified in the analysis.</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-center pt-4">
            <Button variant="outline" asChild>
              <Link 
                to="/tactics" 
                state={tacticsNavigationState}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Explore Full Tactics Library
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Blueprint Section */}
      <Card className="shadow-lg border border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            Generated Blueprint
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Strategic framework derived from your reference scripts
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-accent/30 p-4 rounded-lg border border-border">
            <div className="whitespace-pre-wrap text-sm text-foreground">
              {blueprint}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card className="shadow-lg border border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.length > 0 ? (
              insights.map((insight: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-accent/30 rounded-lg border border-border">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-foreground">{insight}</p>
                </div>
              ))
            ) : (
              <div className="p-3 bg-accent/30 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Analysis insights are being processed...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generate Script Button */}
      <div className="flex justify-center pt-6">
        <Button 
          onClick={onGenerate}
          size="lg"
          className="px-8 py-3"
        >
          <Zap className="w-5 h-5 mr-2" />
          Generate Viral Script
        </Button>
      </div>
    </div>
  );
}
