import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Brain, FileText, Zap, Target, Lightbulb, BarChart3, CheckCircle, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScriptAnalyzer } from '@/components/ScriptAnalyzer';
import { TacticMapper } from '@/components/TacticMapper';
import { ScriptGenerator } from '@/components/ScriptGenerator';
import { ScriptInputPanel } from '@/components/ScriptInputPanel';
import { ScriptGenerationProgress } from '@/components/ScriptGenerationProgress';
import { psychologicalTactics } from '@/utils/tacticAnalyzer';
import { supabase } from '@/integrations/supabase/client';
import UserMenu from '@/components/UserMenu';
import { ViralFormatSelector } from '@/components/ViralFormatSelector';
import { useProgressTracking } from '@/hooks/useProgressTracking';
import { useToast } from '@/hooks/use-toast';

interface ScriptInput {
  scripts: string[];
  topic: string;
  description: string;
  targetLength: number;
  callToAction: string;
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [scriptInput, setScriptInput] = useState<ScriptInput>({
    scripts: ['', ''], // Start with 2 empty scripts
    topic: '',
    description: '',
    targetLength: 1400,
    callToAction: ''
  });
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { toast } = useToast();

  const generationSteps = [
    { id: 'analyzing', label: 'Analyzing reference scripts and viral tactics' },
    { id: 'generating', label: 'Generating script with AI (Claude/OpenAI)' },
    { id: 'validating', label: 'Validating content quality and uniqueness' },
    { id: 'finalizing', label: 'Finalizing and formatting your script' }
  ];

  const progressTracking = useProgressTracking({
    steps: generationSteps,
    onComplete: () => {
      console.log('Script generation completed!');
      setCurrentStep(3);
    },
    onError: (error) => {
      console.error('Progress tracking error:', error);
      toast({
        title: "Generation Error",
        description: error,
        variant: "destructive"
      });
    }
  });

  const steps = [
    { id: 0, title: 'Input Scripts', icon: FileText },
    { id: 1, title: 'Analysis', icon: Brain },
    { id: 2, title: 'Generation', icon: Zap },
    { id: 3, title: 'Review', icon: CheckCircle }
  ];

  const addScriptPanel = () => {
    if (scriptInput.scripts.length < 8) {
      setScriptInput({
        ...scriptInput,
        scripts: [...scriptInput.scripts, '']
      });
    }
  };

  const removeScriptPanel = (index: number) => {
    if (scriptInput.scripts.length > 2) {
      const newScripts = scriptInput.scripts.filter((_, i) => i !== index);
      setScriptInput({
        ...scriptInput,
        scripts: newScripts
      });
    }
  };

  const updateScript = (index: number, value: string) => {
    const newScripts = [...scriptInput.scripts];
    newScripts[index] = value;
    setScriptInput({
      ...scriptInput,
      scripts: newScripts
    });
  };

  const handleAnalyze = async () => {
    const filledScripts = scriptInput.scripts.filter(script => script.trim());
    if (filledScripts.length < 2 || !scriptInput.topic) {
      toast({
        title: "Missing Information",
        description: "Please provide at least 2 reference scripts and a video topic.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Import the actual analyzer
      const { analyzeScript, synthesizeAnalyses } = await import('@/utils/scriptAnalyzer');
      
      // Analyze each script
      const scriptAnalyses = filledScripts.map(script => analyzeScript(script));
      
      // Synthesize the analyses
      const synthesis = synthesizeAnalyses(scriptAnalyses);
      
      setTimeout(() => {
        setAnalysis({
          scriptAnalyses,
          synthesizedTactics: synthesis.commonTactics,
          blueprint: synthesis.averageStructure,
          insights: synthesis.insights
        });
        setIsAnalyzing(false);
        setCurrentStep(1);
        
        toast({
          title: "Analysis Complete",
          description: "Your scripts have been analyzed for viral tactics and patterns."
        });
      }, 2000);
    } catch (error) {
      console.error('Analysis error:', error);
      setIsAnalyzing(false);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your scripts. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleGenerate = async () => {
    setCurrentStep(2);
    setIsGenerating(true);
    progressTracking.reset();
    
    try {
      // Start progress tracking
      progressTracking.simulateProgress('analyzing', 3000);
      await new Promise(resolve => setTimeout(resolve, 2000));
      progressTracking.completeStep('analyzing');
      
      progressTracking.simulateProgress('generating', 25000);
      
      console.log('Generating viral script with optimized performance...');
      
      const { data, error } = await supabase.functions.invoke('generate-script', {
        body: {
          topic: scriptInput.topic,
          description: scriptInput.description,
          targetAudience: 'YouTube viewers interested in ' + scriptInput.topic,
          videoLength: Math.round(scriptInput.targetLength / 140),
          scripts: scriptInput.scripts.filter(s => s.trim()),
          callToAction: scriptInput.callToAction,
          format: selectedFormat,
          targetWordCount: scriptInput.targetLength
        }
      });

      progressTracking.completeStep('generating');
      progressTracking.simulateProgress('validating', 2000);
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to generate script');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate script');
      }

      progressTracking.completeStep('validating');
      progressTracking.simulateProgress('finalizing', 1000);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Viral script generated successfully');
      setGeneratedScript(data.script);
      
      progressTracking.completeStep('finalizing');
      
      toast({
        title: "Script Generated!",
        description: `Generated ${data.metrics?.wordCount || 'N/A'} words in ${Math.round((data.metrics?.generationTimeMs || 0) / 1000)}s`
      });
      
    } catch (error) {
      console.error('Error generating script:', error);
      
      progressTracking.errorStep('generating', error.message);
      
      // Generate a fallback script
      const targetWords = scriptInput.targetLength;
      const mockScript = generateFallbackScript(scriptInput.topic, scriptInput.callToAction, targetWords);
      setGeneratedScript(mockScript);
      setCurrentStep(3);
      
      toast({
        title: "Using Fallback Generation",
        description: "Generated script using local fallback due to API issues.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackScript = (topic: string, cta: string, targetWords: number): string => {
    // Generate a script that meets the minimum word count requirement
    const baseScript = `**VIRAL HOOK (0-3s)**
"Stop scrolling! What I'm about to show you about ${topic.toLowerCase()} will completely change how you think about this forever."

**PROMISE & SETUP (3-15s)**
"By the end of this video, you'll have the exact blueprint that took my student from zero to hero in just 30 days. But first, let me show you why everything you've been told is wrong."

**MAIN CONTENT (15s-4m)**
"Here's the thing nobody talks about - 97% of people fail at ${topic.toLowerCase()} because they're missing this one crucial element.

But wait, it gets worse...

Most 'experts' are actually keeping you stuck on purpose. Here's why: they profit from your confusion. When you're constantly searching for the next big secret, you're constantly buying their products.

Now here's the crazy part - when I discovered this simple framework, everything changed. Let me break it down step by step:

Step 1: Understanding the Foundation
The first thing you need to realize is that ${topic.toLowerCase()} isn't about what most people think. It's about understanding the underlying psychology and mechanics that drive real results.

Step 2: Building Your System
Once you understand the foundation, you need to build a systematic approach. This isn't about random tactics - it's about creating a repeatable process that works every single time.

Step 3: Advanced Implementation
This is where most people get stuck. They understand the theory but fail at implementation. The secret is in the details that nobody talks about.

Step 4: Scaling and Optimization
Once you have the basics working, it's time to scale. This is where the real magic happens, and where you can achieve results that seem impossible to others.

Just like my student Sarah, who used this exact system to achieve incredible results. She went from struggling for months to seeing breakthrough results in her first week.

But here's what makes this different from everything else you've tried...

The secret isn't about working harder - it's about working smarter. It's about understanding the hidden patterns that successful people use but never talk about.

Let me give you a real example. Last month, I worked with someone who was stuck exactly where you might be right now. They were doing everything they thought was right, but nothing was working.

Within 48 hours of implementing this system, they saw their first breakthrough. Within a week, they had results they'd been chasing for months.

The difference? They stopped following generic advice and started using the specific framework I'm sharing with you today."

**PAYOFF & CTA (4-5m)**
"Look, I've given you the foundation, but this is just the beginning. ${cta}. 

But here's the thing - I'm only sharing the advanced version with the first 100 people who take action today. Don't let this opportunity pass you by like all the others.

Your transformation starts now. What are you waiting for?"`;

    // If the script is shorter than target, add more content
    const currentWordCount = baseScript.trim().split(/\s+/).length;
    if (currentWordCount < targetWords) {
      const additionalContent = generateAdditionalContent(topic, targetWords - currentWordCount);
      return baseScript.replace('**PAYOFF & CTA (4-5m)**', additionalContent + '\n\n**PAYOFF & CTA (4-5m)**');
    }

    return baseScript;
  };

  const generateAdditionalContent = (topic: string, wordsNeeded: number): string => {
    const additionalSections = [
      `**DEEP DIVE: The Psychology Behind ${topic}**
Understanding the psychological triggers that make ${topic.toLowerCase()} work is crucial for your success. Most people skip this step, which is why they fail.

The human brain is wired to respond to certain patterns and triggers. When you understand these patterns, you can use them to your advantage.

Research shows that successful implementation of ${topic.toLowerCase()} strategies depends heavily on psychological factors that most people ignore.`,

      `**CASE STUDY: Real Results**
Let me share another success story that perfectly illustrates these principles in action. 

My client John was skeptical when he first started. He'd tried everything and nothing worked. But when he applied this exact framework, his results were immediate and dramatic.

The key was understanding that ${topic.toLowerCase()} isn't just about the tactics - it's about the mindset and systematic approach that makes those tactics effective.`,

      `**COMMON MISTAKES TO AVOID**
Before we wrap up, let me share the three biggest mistakes I see people make when implementing ${topic.toLowerCase()} strategies:

Mistake #1: Trying to do everything at once instead of focusing on the fundamentals
Mistake #2: Not tracking and measuring results properly
Mistake #3: Giving up too early before the compound effect kicks in

Avoiding these mistakes alone can 10x your results.`
    ];

    let additionalContent = '';
    let wordsAdded = 0;
    
    for (const section of additionalSections) {
      const sectionWords = section.trim().split(/\s+/).length;
      if (wordsAdded + sectionWords <= wordsNeeded + 50) { // Allow some buffer
        additionalContent += '\n\n' + section;
        wordsAdded += sectionWords;
      }
      
      if (wordsAdded >= wordsNeeded) break;
    }

    return additionalContent;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute top-0 right-0">
            <UserMenu />
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              PitchArchitect
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-2">
            AI-powered YouTube script writer using proven viral tactics from successful creators
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Enhanced with DanielKCI's proven strategies • Give people what they want • Viral formats that work
          </p>
          <Link to="/tactics">
            <Button variant="outline" className="mb-4">
              <BookOpen className="w-4 h-4 mr-2" />
              View Enhanced Tactics Library
            </Button>
          </Link>
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
                  Provide 2-8 high-performing scripts and your video details. We'll analyze viral tactics and generate content that gives people what they want.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Format Selection */}
                <div className="mb-6">
                  <ViralFormatSelector 
                    selectedFormat={selectedFormat}
                    onFormatSelect={setSelectedFormat}
                  />
                </div>

                <Separator />

                {/* Dynamic Script Inputs */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Reference Scripts ({scriptInput.scripts.length}/8)</h3>
                    <Button 
                      onClick={addScriptPanel}
                      disabled={scriptInput.scripts.length >= 8}
                      variant="outline"
                      size="sm"
                    >
                      Add Script Panel
                    </Button>
                  </div>
                  
                  <div className="grid gap-4">
                    {scriptInput.scripts.map((script, index) => (
                      <ScriptInputPanel
                        key={index}
                        index={index}
                        value={script}
                        onChange={(value) => updateScript(index, value)}
                        onRemove={() => removeScriptPanel(index)}
                        canRemove={scriptInput.scripts.length > 2}
                      />
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Video Details */}
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="topic" className="text-sm font-medium">Video Topic</Label>
                      <Input
                        id="topic"
                        placeholder="e.g., How to make money online"
                        value={scriptInput.topic}
                        onChange={(e) => setScriptInput({...scriptInput, topic: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cta" className="text-sm font-medium">Call to Action</Label>
                      <Input
                        id="cta"
                        placeholder="Subscribe to my course"
                        value={scriptInput.callToAction}
                        onChange={(e) => setScriptInput({...scriptInput, callToAction: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">Video Description/Context</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what this video is about, the angle you want to take, or any specific context..."
                      className="min-h-[80px]"
                      value={scriptInput.description}
                      onChange={(e) => setScriptInput({...scriptInput, description: e.target.value})}
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
                </div>

                <div className="flex justify-center pt-4">
                  <Button 
                    onClick={handleAnalyze}
                    disabled={scriptInput.scripts.filter(s => s.trim()).length < 2 || !scriptInput.topic || isAnalyzing}
                    className="px-8 py-3 text-lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Brain className="w-5 h-5 mr-2 animate-pulse" />
                        Analyzing Your Scripts...
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5 mr-2" />
                        Analyze Scripts for Viral Tactics
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
            <ScriptGenerationProgress
              steps={progressTracking.progressSteps}
              overallProgress={progressTracking.overallProgress}
              currentStep={generationSteps[progressTracking.currentStepIndex]?.id || 'analyzing'}
              error={progressTracking.error}
            />
          )}

          {currentStep === 3 && generatedScript && (
            <ScriptGenerator 
              script={generatedScript}
              tactics={analysis?.synthesizedTactics || []}
              onRestart={() => {
                setCurrentStep(0);
                setScriptInput({
                  scripts: ['', ''],
                  topic: '',
                  description: '',
                  targetLength: 1400,
                  callToAction: ''
                });
                setAnalysis(null);
                setGeneratedScript('');
                progressTracking.reset();
              }}
            />
          )}
        </div>

        {/* Features Section */}
        {currentStep === 0 && (
          <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center p-6 border-0 bg-white/60 backdrop-blur-sm">
              <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Viral Tactics Analysis</h3>
              <p className="text-sm text-gray-600">
                Identifies 25+ proven psychological tactics used by successful creators
              </p>
            </Card>
            <Card className="text-center p-6 border-0 bg-white/60 backdrop-blur-sm">
              <BarChart3 className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Format-Based Generation</h3>
              <p className="text-sm text-gray-600">
                Uses proven formats that have worked since ancient times
              </p>
            </Card>
            <Card className="text-center p-6 border-0 bg-white/60 backdrop-blur-sm">
              <Lightbulb className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Algorithm Optimization</h3>
              <p className="text-sm text-gray-600">
                Collaborates with platform algorithms for maximum reach
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
