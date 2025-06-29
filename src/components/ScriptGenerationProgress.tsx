
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
    <Card className="w-full max-w-2xl mx-auto shadow-xl border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl flex items-center justify-center gap-2">
          <Zap className="w-6 h-6 text-blue-600" />
          Generating Your Viral Script
        </CardTitle>
        <div className="mt-4">
          <Progress value={overallProgress} className="w-full h-3" />
          <p className="text-sm text-gray-600 mt-2">
            {Math.round(overallProgress)}% Complete
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Generation Error</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        )}
        
        <div className="space-y-3">
          {steps.map((step, index) => {
            const StepIcon = stepIcons[step.id as keyof typeof stepIcons] || Clock;
            
            return (
              <div
                key={step.id}
                className={`p-4 rounded-lg border transition-all duration-300 ${
                  step.status === 'active' ? 'ring-2 ring-blue-200' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <StepIcon className={`w-5 h-5 ${
                      step.status === 'active' ? 'text-blue-600' : 
                      step.status === 'completed' ? 'text-green-600' : 
                      step.status === 'error' ? 'text-red-600' : 'text-gray-400'
                    }`} />
                    <span className="font-medium">{step.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(step.status)}
                    >
                      {step.status}
                    </Badge>
                    {getStatusIcon(step.status)}
                  </div>
                </div>
                
                {step.status === 'active' && (
                  <div className="mt-2">
                    <Progress value={step.progress} className="w-full h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round(step.progress)}% - {step.label}...
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            This process typically takes 30-60 seconds for high-quality results
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
