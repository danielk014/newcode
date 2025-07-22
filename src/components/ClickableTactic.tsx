import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface ClickableTacticProps {
  name: string;
  children: React.ReactNode;
  currentStep?: number;
  analysis?: any;
  generatedScript?: string;
  scriptInput?: any;
  videoFormat?: any;
}

export const ClickableTactic: React.FC<ClickableTacticProps> = ({ 
  name, 
  children, 
  currentStep, 
  analysis,
  generatedScript,
  scriptInput,
  videoFormat 
}) => {
  const location = useLocation();
  
  return (
    <Link 
      to={`/tactics?tactic=${encodeURIComponent(name)}`}
      state={{ 
        from: location.pathname,
        currentStep,
        analysis,
        generatedScript,
        scriptInput,
        videoFormat,
        preserveState: true
      }}
      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
    >
      {children}
    </Link>
  );
};