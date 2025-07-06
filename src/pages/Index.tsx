
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
import { FileUploader } from '@/components/FileUploader';
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
  const [userInput, setUserInput] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const [detectedTactics, setDetectedTactics] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [scriptInputs, setScriptInputs] = useState(['']);

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
      title: "Input Your Scripts",
      icon: <FileText className="w-6 h-6" />,
      description: "Paste your high-performing reference scripts"
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
    setUserInput('');
    setSelectedFormat('');
    setGeneratedScript('');
    setDetectedTactics([]);
    setAnalysis(null);
    setScriptInputs(['']);
  };

  const handleScriptGenerated = (script: string, tactics: any[]) => {
    setGeneratedScript(script);
    setDetectedTactics(tactics);
    setCurrentStep(3);
  };

  const handleAnalysisComplete = (analysisResult: any) => {
    setAnalysis(analysisResult);
  };

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...scriptInputs];
    newInputs[index] = value;
    setScriptInputs(newInputs);
  };

  const handleAddInput = () => {
    if (scriptInputs.length < 5) {
      setScriptInputs([...scriptInputs, '']);
    }
  };

  const handleRemoveInput = (index: number) => {
    if (scriptInputs.length > 1) {
      const newInputs = scriptInputs.filter((_, i) => i !== index);
      setScriptInputs(newInputs);
    }
  };

  const handleScriptExtracted = (script: string, filename: string) => {
    // Add extracted script to inputs
    const emptyIndex = scriptInputs.findIndex(input => !input.trim());
    if (emptyIndex !== -1) {
      handleInputChange(emptyIndex, script);
    } else if (scriptInputs.length < 5) {
      setScriptInputs([...scriptInputs, script]);
    }
  };

  const handleAnalyzeScripts = async () => {
    setIsGenerating(true);
    setCurrentStep(2);
    
    // Simulate analysis process
    setTimeout(() => {
      const mockAnalysis = {
        scriptAnalyses: scriptInputs.filter(input => input.trim()).map((script, index) => ({
          wordCount: script.split(' ').length,
          estimatedDuration: `${Math.ceil(script.split(' ').length / 150)} min`,
          tactics: [
            { name: 'Hook', category: 'Attention', strength: 8, description: 'Strong opening statement' },
            { name: 'Social Proof', category: 'Credibility', strength: 7, description: 'Uses testimonials' }
          ],
          structure: {
            hook: 'Attention-grabbing opening',
            problem: 'Identifies pain point',
            solution: 'Presents clear solution',
            cta: 'Strong call to action'
          }
        })),
        synthesizedTactics: [
          { name: 'Pattern Interrupt', category: 'Attention', description: 'Breaks normal thought patterns' },
          { name: 'Authority Building', category: 'Credibility', description: 'Establishes expertise' }
        ],
        blueprint: {
          sections: [
            { name: 'Hook', purpose: 'Grab attention', duration: '0-5s', wordCount: '10-15', tactics: ['Pattern Interrupt'] },
            { name: 'Problem', purpose: 'Identify pain', duration: '5-15s', wordCount: '20-30', tactics: ['Pain Point'] },
            { name: 'Solution', purpose: 'Present offer', duration: '15-45s', wordCount: '50-80', tactics: ['Authority'] },
            { name: 'CTA', purpose: 'Drive action', duration: '45-60s', wordCount: '15-25', tactics: ['Urgency'] }
          ]
        }
      };
      
      setAnalysis(mockAnalysis);
      setIsGenerating(false);
    }, 3000);
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
                    Input Your Reference Scripts
                  </CardTitle>
                  <p className="text-gray-600">Upload or paste 1-5 high-performing scripts to analyze their success patterns</p>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="manual" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="manual">Manual Input</TabsTrigger>
                      <TabsTrigger value="upload">Upload Files</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="manual" className="space-y-4">
                      {scriptInputs.map((input, index) => (
                        <ScriptInputPanel
                          key={index}
                          index={index}
                          value={input}
                          onChange={(value) => handleInputChange(index, value)}
                          onRemove={() => handleRemoveInput(index)}
                          canRemove={scriptInputs.length > 1}
                        />
                      ))}
                      
                      <div className="flex gap-4 justify-between items-center">
                        {scriptInputs.length < 5 && (
                          <Button
                            variant="outline"
                            onClick={handleAddInput}
                            className="flex-1"
                          >
                            + Add Another Script
                          </Button>
                        )}
                        <Button
                          onClick={handleAnalyzeScripts}
                          disabled={!scriptInputs.some(input => input.trim())}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Analyze Scripts
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="upload" className="space-y-4">
                      <FileUploader 
                        onScriptExtracted={handleScriptExtracted}
                        maxFiles={5}
                      />
                      
                      {scriptInputs.some(input => input.trim()) && (
                        <div className="space-y-4">
                          <h4 className="font-medium">Extracted Scripts:</h4>
                          {scriptInputs.map((input, index) => (
                            input.trim() && (
                              <ScriptInputPanel
                                key={index}
                                index={index}
                                value={input}
                                onChange={(value) => handleInputChange(index, value)}
                                onRemove={() => handleRemoveInput(index)}
                                canRemove={scriptInputs.length > 1}
                              />
                            )
                          ))}
                          
                          <Button
                            onClick={handleAnalyzeScripts}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Analyze Scripts
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {currentStep === 1 && (
              <ViralFormatSelector 
                selectedFormat={selectedFormat}
                onFormatSelect={setSelectedFormat}
                onNext={handleNext}
                onBack={handleBack}
                userInput={userInput}
                setUserInput={setUserInput}
              />
            )}

            {currentStep === 2 && (
              <ScriptAnalyzer
                analysis={analysis}
                onGenerate={handleScriptGenerated}
                currentStep={currentStep}
                userInput={userInput}
                selectedFormat={selectedFormat}
                onScriptGenerated={handleScriptGenerated}
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
