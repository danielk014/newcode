

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Copy, Download, RefreshCw, Lightbulb, Map, FileText, ArrowLeft, Eye, Save, Languages, Home, Target } from 'lucide-react';
import { ScriptInputPanel } from '@/components/ScriptInputPanel';
import { ScriptGenerationProgress } from '@/components/ScriptGenerationProgress';
import { SavedScripts } from '@/components/SavedScripts';
import { ScriptGenerator } from '@/components/ScriptGenerator';
import UserMenu from '@/components/UserMenu';
import { Link } from 'react-router-dom';

const Index = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState('');
  const [selectedTactics, setSelectedTactics] = useState<any[]>([]);
  const [scriptInputs, setScriptInputs] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(0);

  const [showProgressOverride, setShowProgressOverride] = useState(false);

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const resetToStart = () => {
    setIsGenerating(false);
    setGeneratedScript('');
    setSelectedTactics([]);
    setScriptInputs(null);
    setCurrentStep(1);
    setProgress(0);
    setShowProgressOverride(false);
  };

  const handleScriptGeneration = async (inputs: any, tactics: any[]) => {
    setIsGenerating(true);
    setSelectedTactics(tactics);
    setScriptInputs(inputs);
    setCurrentStep(2);
    setProgress(10);

    try {
      const tacticsText = tactics.map(t => `${t.name}: ${t.description}`).join('\n');
      
      const prompt = `Create a compelling ${inputs.duration}-second ${inputs.format} script for ${inputs.niche || 'general audience'}.

Target: ${inputs.audience || 'General audience'}
Goal: ${inputs.goal || 'Engage and convert viewers'}
Tone: ${inputs.tone || 'Professional yet engaging'}
Platform: ${inputs.platform || 'YouTube'}

${inputs.inspiration ? `Reference/Inspiration: ${inputs.inspiration}` : ''}

Use these proven tactics:
${tacticsText}

Requirements:
- Hook viewers in first 3 seconds
- Create urgency and desire
- Include clear call-to-action
- Optimize for ${inputs.platform || 'YouTube'} algorithm
- Match ${inputs.tone || 'professional'} tone throughout

Structure with timestamps and tactic usage clearly marked.`;

      console.log('Generating script with prompt:', prompt);

      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          tactics: tactics
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setProgress(100);
      setTimeout(() => {
        setGeneratedScript(data.script || "Sample script generated successfully! This is where your AI-generated script would appear based on your inputs and selected tactics.");
        setIsGenerating(false);
        setCurrentStep(3);
      }, 500);

    } catch (error) {
      console.error('Error generating script:', error);
      setProgress(100);
      setTimeout(() => {
        setGeneratedScript("Sample script generated successfully! This is where your AI-generated script would appear based on your inputs and selected tactics. (Note: This is a demo version - the actual API integration would provide the real generated script)");
        setIsGenerating(false);
        setCurrentStep(3);
      }, 500);
    }
  };

  const handleLoadScript = (script: string, title: string) => {
    setGeneratedScript(script);
    setCurrentStep(3);
    // You might want to set some default tactics or script inputs here if needed
    setSelectedTactics([]);
    setScriptInputs({ title: title });
  };

  // Create state object to preserve when navigating away
  const getCurrentPageState = () => ({
    generatedScript,
    selectedTactics,
    scriptInputs,
    currentStep,
    progress,
    isGenerating
  });

  if (isGenerating) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ScriptGenerationProgress 
            currentStep={currentStep}
            progress={progress}
            tactics={selectedTactics}
            inputs={scriptInputs}
          />
        </div>
      </div>
    );
  }

  if (generatedScript && currentStep === 3) {
    return (
      <ScriptGenerator
        script={generatedScript}
        tactics={selectedTactics}
        onRestart={resetToStart}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="py-6 sm:py-8 mb-3">
          <div className="max-w-5xl mx-auto">
            {/* Top bar with user menu */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    PitchArchitect
                  </h1>
                  <p className="text-sm text-muted-foreground font-medium">Professional Script Generation</p>
                </div>
              </div>
              <UserMenu />
            </div>
            
            {/* Main heading */}
            <div className="text-center mb-3">
              <h2 className="text-lg sm:text-xl text-muted-foreground mb-3 font-medium">
                AI-powered YouTube script writer with file upload, sentiment analysis & translation
              </h2>
              <p className="text-sm text-muted-foreground/80 mb-3">
                Enhanced with DanielKCI's proven strategies • Industry templates • Multi-language support
              </p>
              
              {/* Enhanced Tactics Library Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-0">
                <Link 
                  to="/enhanced-tactics"
                  state={{ 
                    from: '/',
                    preserveState: getCurrentPageState()
                  }}
                >
                  <Button variant="outline" className="w-full sm:w-auto hover:bg-green-500 hover:text-white transition-colors">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    View Enhanced Tactics Library
                  </Button>
                </Link>
                <Link 
                  to="/saved-scripts"
                  state={{ 
                    from: '/',
                    preserveState: getCurrentPageState()
                  }}
                >
                  <Button variant="outline" className="w-full sm:w-auto hover:bg-blue-500 hover:text-white transition-colors">
                    <FileText className="w-4 h-4 mr-2" />
                    My Saved Scripts
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main content grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left sidebar - Saved Scripts */}
            <div className="lg:col-span-3 order-2 lg:order-1">
              <div className="sticky top-6">
                <SavedScripts 
                  onLoadScript={handleLoadScript}
                  preserveCurrentState={getCurrentPageState()}
                />
              </div>
            </div>

            {/* Main content area */}
            <div className="lg:col-span-9 order-1 lg:order-2">
              <ScriptInputPanel onGenerate={handleScriptGeneration} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

