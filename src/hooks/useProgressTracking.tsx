
import { useState, useEffect, useRef } from 'react';

interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  progress: number;
}

interface UseProgressTrackingProps {
  steps: Array<{ id: string; label: string }>;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export const useProgressTracking = ({ steps, onComplete, onError }: UseProgressTrackingProps) => {
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>(
    steps.map(step => ({ ...step, status: 'pending' as const, progress: 0 }))
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startStep = (stepId: string) => {
    setProgressSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status: 'active', progress: 0 }
        : step.status === 'active' 
          ? { ...step, status: 'pending' }
          : step
    ));
    
    const stepIndex = steps.findIndex(s => s.id === stepId);
    setCurrentStepIndex(stepIndex);
  };

  const updateStepProgress = (stepId: string, progress: number) => {
    setProgressSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, progress: Math.min(100, Math.max(0, progress)) } : step
    ));
  };

  const completeStep = (stepId: string) => {
    // Clear any running intervals for this step
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    setProgressSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status: 'completed', progress: 100 } : step
    ));
  };

  const errorStep = (stepId: string, errorMessage: string) => {
    setProgressSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status: 'error' } : step
    ));
    setError(errorMessage);
    if (onError) onError(errorMessage);
  };

  const simulateProgress = (stepId: string, duration: number = 30000) => {
    const step = progressSteps.find(s => s.id === stepId);
    if (!step) return;

    startStep(stepId);
    
    let progress = 0;
    const increment = 100 / (duration / 500); // Update every 500ms
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      progress += increment;
      if (progress >= 90) {
        progress = 90; // Don't reach 100% until actually complete
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
      updateStepProgress(stepId, progress);
    }, 500);
  };

  const reset = () => {
    setProgressSteps(steps.map(step => ({ ...step, status: 'pending' as const, progress: 0 })));
    setCurrentStepIndex(0);
    setOverallProgress(0);
    setIsComplete(false);
    setError(null);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // Calculate overall progress
  useEffect(() => {
    const totalProgress = progressSteps.reduce((sum, step) => sum + step.progress, 0);
    const overall = totalProgress / progressSteps.length;
    setOverallProgress(overall);
    
    const allCompleted = progressSteps.every(step => step.status === 'completed');
    if (allCompleted && !isComplete) {
      setIsComplete(true);
      if (onComplete) onComplete();
    }
  }, [progressSteps, onComplete, isComplete]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    progressSteps,
    currentStepIndex,
    overallProgress,
    isComplete,
    error,
    startStep,
    updateStepProgress,
    completeStep,
    errorStep,
    simulateProgress,
    reset
  };
};
