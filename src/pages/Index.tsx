
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, 
  Target, 
  Lightbulb, 
  FileText, 
  Wand2, 
  Play,
  ArrowRight,
  Sparkles,
  Brain,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';
import { ScriptGenerator } from '@/components/ScriptGenerator';
import { ScriptInputPanel } from '@/components/ScriptInputPanel';
import { ScriptGenerationProgress } from '@/components/ScriptGenerationProgress';
import { ScriptAnalyzer } from '@/components/ScriptAnalyzer';
import { ViralFormatSelector } from '@/components/ViralFormatSelector';
import { IndustryTemplates } from '@/components/IndustryTemplates';
import { FormatRecommendationTool } from '@/components/FormatRecommendationTool';
import AuthGuard from '@/components/AuthGuard';
import UserMenu from '@/components/UserMenu';
import { useLocation } from 'react-router-dom';

export default function Index() {
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [scripts, setScripts] = useState<string[]>(['']);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const [detectedTactics, setDetectedTactics] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  // Handle state restoration when returning from tactics library
  useEffect(() => {
    const state = location.state as any;
    if (state?.restoreStep && state?.restoreAnalysis) {
      setCurrentStep(state.restoreStep);
      setAnalysis(state.restoreAnalysis);
      // Clear the state to prevent it from being applied again
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const steps = [
    {
      title: "Input Your Topic",
      icon: <FileText className="w-6 h-6" />,
      description: "Tell us what you want to create content about"
    },
    {
      title: "Choose Format",
      icon: <Target className="w-6 h-6" />,
      description: "Select the best viral format for your content"
    },
    {
      title: "AI Analysis",
      icon: <Brain className="w-6 h-6" />,
      description: "Our AI analyzes and optimizes your script"
    },
    {
      title: "Generated Script",
      icon: <Sparkles className="w-6 h-6" />,
      description: "Get your viral-ready script with tactics mapped"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setScripts(['']);
    setSelectedFormat('');
    setGeneratedScript('');
    setDetectedTactics([]);
    setAnalysis(null);
  };

  const handleScriptGenerated = (script: string, tactics: any[]) => {
    setGeneratedScript(script);
    setDetectedTactics(tactics);
    setCurrentStep(3);
  };

  const handleAnalysisComplete = (analysisResult: any) => {
    setAnalysis(analysisResult);
  };

  const handleAddScript = () => {
    setScripts([...scripts, '']);
  };

  const handleRemoveScript = (index: number) => {
    if (scripts.length > 1) {
      const newScripts = scripts.filter((_, i) => i !== index);
      setScripts(newScripts);
    }
  };

  const handleScriptChange = (index: number, value: string) => {
    const newScripts = [...scripts];
    newScripts[index] = value;
    setScripts(newScripts);
  };

  if (generatedScript && currentStep === 3) {
    return (
      <ScriptGenerator 
        script={generatedScript}
        tactics={detectedTactics}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
                  <Wand2 className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  PitchArchitect
                </h1>
              </div>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Transform your ideas into viral scripts with AI-powered psychological tactics
              </p>
            </div>
            <UserMenu />
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-center">
              <div className="flex items-center space-x-4 bg-white rounded-full px-6 py-3 shadow-lg">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                      index === currentStep 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                        : index < currentStep 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {index < currentStep ? (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-0.5 mx-2 transition-all duration-300 ${
                        index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center mt-4">
              <h2 className="text-2xl font-semibold text-gray-800">{steps[currentStep].title}</h2>
              <p className="text-gray-600 mt-1">{steps[currentStep].description}</p>
            </div>
          </div>

          {/* Step Content */}
          <div className="max-w-4xl mx-auto">
            {currentStep === 0 && (
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl flex items-center justify-center gap-2">
                    <FileText className="w-6 h-6 text-blue-600" />
                    Add Your Reference Scripts
                  </CardTitle>
                  <p className="text-gray-600">
                    Paste your high-performing scripts so AI can analyze their successful tactics
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {scripts.map((script, index) => (
                    <ScriptInputPanel
                      key={index}
                      index={index}
                      value={script}
                      onChange={(value) => handleScriptChange(index, value)}
                      onRemove={() => handleRemoveScript(index)}
                      canRemove={scripts.length > 1}
                    />
                  ))}
                  
                  <div className="flex justify-between items-center pt-4">
                    <Button 
                      variant="outline" 
                      onClick={handleAddScript}
                      className="border border-black"
                    >
                      Add Another Script
                    </Button>
                    
                    <Button 
                      onClick={handleNext}
                      disabled={scripts.some(script => !script.trim())}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 border border-black"
                    >
                      Analyze Scripts
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 1 && (
              <ViralFormatSelector 
                selectedFormat={selectedFormat}
                onFormatSelect={setSelectedFormat}
              />
            )}

            {currentStep === 2 && (
              <ScriptAnalyzer
                analysis={analysis}
                onGenerate={handleScriptGenerated}
                currentStep={currentStep}
                scripts={scripts}
                onBack={handleBack}
                onAnalysisComplete={handleAnalysisComplete}
              />
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
