
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Brain, FileText, Zap, Target, Lightbulb, BarChart3, CheckCircle, ArrowRight } from 'lucide-react';
import { ScriptAnalyzer } from '@/components/ScriptAnalyzer';
import { TacticMapper } from '@/components/TacticMapper';
import { ScriptGenerator } from '@/components/ScriptGenerator';
import { psychologicalTactics } from '@/utils/tacticAnalyzer';

interface ScriptInput {
  script1: string;
  script2: string;
  topic: string;
  targetLength: number;
  callToAction: string;
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [scriptInput, setScriptInput] = useState<ScriptInput>({
    script1: '',
    script2: '',
    topic: '',
    targetLength: 1400,
    callToAction: ''
  });
  const [analysis, setAnalysis] = useState<any>(null);
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const steps = [
    { id: 0, title: 'Input Scripts', icon: FileText },
    { id: 1, title: 'Analysis', icon: Brain },
    { id: 2, title: 'Generation', icon: Zap },
    { id: 3, title: 'Review', icon: CheckCircle }
  ];

  const handleAnalyze = async () => {
    if (!scriptInput.script1 || !scriptInput.script2 || !scriptInput.topic) {
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate analysis process
    setTimeout(() => {
      const mockAnalysis = {
        script1Tactics: psychologicalTactics.slice(0, 8),
        script2Tactics: psychologicalTactics.slice(5, 12),
        synthesizedTactics: psychologicalTactics.slice(0, 10),
        blueprint: [
          { section: "Hook", duration: "0-15s", tactics: ["Pattern Interrupt", "Curiosity Gap"] },
          { section: "Problem", duration: "15-45s", tactics: ["Pain Point", "Relatability"] },
          { section: "Solution", duration: "45s-2m", tactics: ["Authority", "Social Proof"] },
          { section: "Details", duration: "2-4m", tactics: ["Future Pacing", "Benefit Stacking"] },
          { section: "CTA", duration: "4-5m", tactics: ["Scarcity", "Clear Direction"] }
        ]
      };
      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
      setCurrentStep(1);
    }, 3000);
  };

  const handleGenerate = async () => {
    setCurrentStep(2);
    // Simulate script generation
    setTimeout(() => {
      const mockScript = `**Hook (0-15s)**
"Stop everything you're doing right now. If you've been struggling with ${scriptInput.topic.toLowerCase()}, what I'm about to show you will completely change how you approach this challenge."

**Problem Setup (15-45s)**
"I know exactly how frustrating it feels when you've tried everything, watched countless tutorials, but still feel stuck. You're not alone - 89% of people give up within the first month because they're missing this one crucial element."

**Solution Introduction (45s-2m)**
"After helping over 10,000 students achieve breakthrough results, I've discovered a simple framework that eliminates the guesswork. This isn't another complicated system - it's the exact method that took my worst student from zero to expert in just 30 days."

**Value Delivery (2-4m)**
"Here's what makes this different: First, we eliminate the overwhelm by focusing on just three core principles. Second, you'll see results in your first week, not months. And third, this works even if you've failed at this before."

**Call to Action (4-5m)**
"Ready to transform your approach to ${scriptInput.topic.toLowerCase()}? ${scriptInput.callToAction}. But here's the thing - I'm only sharing this with the first 100 people who take action today. Don't let this opportunity slip by like all the others."`;

      setGeneratedScript(mockScript);
      setCurrentStep(3);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              PitchArchitect
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AI-powered YouTube script writer that analyzes reference scripts and generates 
            compelling content using proven psychological tactics
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <React.Fragment key={step.id}>
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    isActive ? 'bg-blue-100 text-blue-700' : 
                    isCompleted ? 'bg-green-100 text-green-700' : 
                    'bg-gray-100 text-gray-500'
                  }`}>
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {currentStep === 0 && (
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Input Your Reference Scripts
                </CardTitle>
                <CardDescription>
                  Provide two high-performing scripts and your video details to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="script1" className="text-sm font-medium">Reference Script #1</Label>
                    <Textarea
                      id="script1"
                      placeholder="Paste your first reference script here..."
                      className="min-h-[200px] resize-none"
                      value={scriptInput.script1}
                      onChange={(e) => setScriptInput({...scriptInput, script1: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="script2" className="text-sm font-medium">Reference Script #2</Label>
                    <Textarea
                      id="script2"
                      placeholder="Paste your second reference script here..."
                      className="min-h-[200px] resize-none"
                      value={scriptInput.script2}
                      onChange={(e) => setScriptInput({...scriptInput, script2: e.target.value})}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic" className="text-sm font-medium">Video Topic</Label>
                    <Input
                      id="topic"
                      placeholder="e.g., How to learn Spanish fast"
                      value={scriptInput.topic}
                      onChange={(e) => setScriptInput({...scriptInput, topic: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="length" className="text-sm font-medium">Target Length (words)</Label>
                    <Input
                      id="length"
                      type="number"
                      placeholder="1400"
                      value={scriptInput.targetLength}
                      onChange={(e) => setScriptInput({...scriptInput, targetLength: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cta" className="text-sm font-medium">Call to Action</Label>
                    <Input
                      id="cta"
                      placeholder="Download my free guide"
                      value={scriptInput.callToAction}
                      onChange={(e) => setScriptInput({...scriptInput, callToAction: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <Button 
                    onClick={handleAnalyze}
                    disabled={!scriptInput.script1 || !scriptInput.script2 || !scriptInput.topic || isAnalyzing}
                    className="px-8 py-3 text-lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Brain className="w-5 h-5 mr-2 animate-pulse" />
                        Analyzing Scripts...
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5 mr-2" />
                        Analyze Scripts
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 1 && analysis && (
            <ScriptAnalyzer 
              analysis={analysis} 
              onGenerate={handleGenerate}
            />
          )}

          {currentStep === 2 && (
            <div className="text-center py-12">
              <div className="animate-pulse">
                <Zap className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Generating Your Script</h2>
                <p className="text-gray-600 mb-6">Applying psychological tactics and creating compelling content...</p>
                <Progress value={75} className="w-64 mx-auto" />
              </div>
            </div>
          )}

          {currentStep === 3 && generatedScript && (
            <ScriptGenerator 
              script={generatedScript}
              tactics={analysis?.synthesizedTactics || []}
              onRestart={() => {
                setCurrentStep(0);
                setScriptInput({
                  script1: '',
                  script2: '',
                  topic: '',
                  targetLength: 1400,
                  callToAction: ''
                });
                setAnalysis(null);
                setGeneratedScript('');
              }}
            />
          )}
        </div>

        {/* Features Section */}
        {currentStep === 0 && (
          <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center p-6 border-0 bg-white/60 backdrop-blur-sm">
              <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Deep Analysis</h3>
              <p className="text-sm text-gray-600">
                Identifies 20+ psychological tactics in your reference scripts
              </p>
            </Card>
            <Card className="text-center p-6 border-0 bg-white/60 backdrop-blur-sm">
              <BarChart3 className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Smart Generation</h3>
              <p className="text-sm text-gray-600">
                Creates original scripts using proven engagement techniques
              </p>
            </Card>
            <Card className="text-center p-6 border-0 bg-white/60 backdrop-blur-sm">
              <Lightbulb className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Tactic Mapping</h3>
              <p className="text-sm text-gray-600">
                Shows exactly where each psychological principle is applied
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
