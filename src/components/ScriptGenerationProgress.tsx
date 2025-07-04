
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle, Zap, Brain, Target, FileText } from 'lucide-react';

interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  progress: number;
}

interface ScriptGenerationProgressProps {
  steps: ProgressStep[];
  overallProgress: number;
  currentStep: string;
  error?: string | null;
}

const stepIcons = {
  'analyzing': Brain,
  'generating': Zap,
  'validating': Target,
  'finalizing': FileText
};

export const ScriptGenerationProgress: React.FC<ScriptGenerationProgressProps> = ({
  steps,
  overallProgress,
  currentStep,
  error
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'active':
        return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl border-0 bg-card/90 backdrop-blur-sm">
      <CardHeader className="text-center pb-4 px-4 sm:px-6">
        <CardTitle className="text-lg sm:text-2xl flex flex-col sm:flex-row items-center justify-center gap-2">
          <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <span className="text-center">Generating Your Script</span>
        </CardTitle>
        <div className="mt-4">
          <Progress value={overallProgress} className="w-full h-2 sm:h-3" />
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            {Math.round(overallProgress)}% Complete
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 px-4 sm:px-6 pb-4 sm:pb-6">
        {error && (
          <div className="p-3 sm:p-4 border border-destructive/20 rounded-lg bg-destructive/5">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">Generation Error</span>
            </div>
            <p className="text-xs sm:text-sm text-destructive/80 mt-1">{error}</p>
          </div>
        )}
        
        <div className="space-y-2 sm:space-y-3">
          {steps.map((step, index) => {
            const StepIcon = stepIcons[step.id as keyof typeof stepIcons] || Clock;
            
            return (
              <div
                key={step.id}
                className={`p-3 sm:p-4 rounded-lg border transition-all duration-300 ${
                  step.status === 'active' ? 'ring-2 ring-primary/20' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <StepIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                      step.status === 'active' ? 'text-primary' : 
                      step.status === 'completed' ? 'text-accent' : 
                      step.status === 'error' ? 'text-destructive' : 'text-muted-foreground'
                    }`} />
                    <span className="font-medium text-sm sm:text-base">{step.label}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getStatusColor(step.status)}`}
                    >
                      {step.status}
                    </Badge>
                    {getStatusIcon(step.status)}
                  </div>
                </div>
                
                {step.status === 'active' && (
                  <div className="mt-2">
                    <Progress value={step.progress} className="w-full h-1.5 sm:h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round(step.progress)}% - {step.label}...
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            This process typically takes 30-60 seconds for high-quality results
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
