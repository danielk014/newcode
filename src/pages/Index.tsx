import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Brain, FileText, Zap, Target, Lightbulb, BarChart3, CheckCircle, ArrowRight, BookOpen, Upload, Languages } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScriptAnalyzer } from '@/components/ScriptAnalyzer';
import { TacticMapper } from '@/components/TacticMapper';
import { ScriptGenerator } from '@/components/ScriptGenerator';
import { ScriptInputPanel } from '@/components/ScriptInputPanel';
import { ScriptGenerationProgress } from '@/components/ScriptGenerationProgress';
import { FileUploader } from '@/components/FileUploader';
import { SentimentAnalyzer } from '@/components/SentimentAnalyzer';
import { IndustryTemplates } from '@/components/IndustryTemplates';
import { ScriptTranslator } from '@/components/ScriptTranslator';
import { SavedScripts } from '@/components/SavedScripts';
import { psychologicalTactics } from '@/utils/tacticAnalyzer';
import { supabase } from '@/integrations/supabase/client';
import UserMenu from '@/components/UserMenu';
import { ViralFormatSelector } from '@/components/ViralFormatSelector';
import { SimplifiedFormatSelector } from '@/components/SimplifiedFormatSelector';
import { ContentStyleSelector } from '@/components/ContentStyleSelector';
import { useProgressTracking } from '@/hooks/useProgressTracking';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';
import logger from '@/utils/logger';

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
  const [selectedFormat, setSelectedFormat] = useState<string>('Copy Reference Script Format'); // Legacy format
  const [videoFormat, setVideoFormat] = useState({
    format: 'long' as const,
    platform: 'YouTube',
    targetWordCount: 1400,
    estimatedDuration: '10 minutes'
  });
  const [contentStyle, setContentStyle] = useState('educational');
  const [analysis, setAnalysis] = useState<any>(null);
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { toast } = useToast();
  const location = useLocation();

  // Handle state restoration when returning from TacticsLibrary
  useEffect(() => {
    const navigationState = location.state as any;
    if (navigationState?.preserveState) {
      if (navigationState?.currentStep !== undefined) {
        setCurrentStep(navigationState.currentStep);
      }
      if (navigationState?.analysis) {
        setAnalysis(navigationState.analysis);
      }
      if (navigationState?.generatedScript) {
        setGeneratedScript(navigationState.generatedScript);
      }
      if (navigationState?.scriptInput) {
        setScriptInput(navigationState.scriptInput);
      }
      if (navigationState?.videoFormat) {
        setVideoFormat(navigationState.videoFormat);
      }
      
      // Clear the navigation state to prevent re-triggering
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location.state]);

  const generationSteps = [
    { id: 'analyzing', label: 'Analyzing reference scripts and viral tactics' },
    { id: 'generating', label: 'Generating script' },
    { id: 'validating', label: 'Validating content quality and uniqueness' },
    { id: 'finalizing', label: 'Finalizing and formatting your script' }
  ];

  const progressTracking = useProgressTracking({
    steps: generationSteps,
    onComplete: () => {
      logger.log('Script generation completed!');
      setCurrentStep(3);
    },
    onError: (error) => {
      logger.error('Progress tracking error:', error);
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

  const handleFileScriptExtracted = (script: string, filename: string) => {
    // Find first empty script slot or add new one
    const emptyIndex = scriptInput.scripts.findIndex(s => !s.trim());
    if (emptyIndex >= 0) {
      updateScript(emptyIndex, script);
    } else if (scriptInput.scripts.length < 8) {
      setScriptInput({
        ...scriptInput,
        scripts: [...scriptInput.scripts, script]
      });
    }
  };

  const handleTemplateSelect = (content: string, title: string) => {
    const emptyIndex = scriptInput.scripts.findIndex(s => !s.trim());
    if (emptyIndex >= 0) {
      updateScript(emptyIndex, content);
    } else if (scriptInput.scripts.length < 8) {
      setScriptInput({
        ...scriptInput,
        scripts: [...scriptInput.scripts, content]
      });
    }
  };

  const handleLoadSavedScript = (script: string, title: string) => {
    const emptyIndex = scriptInput.scripts.findIndex(s => !s.trim());
    if (emptyIndex >= 0) {
      updateScript(emptyIndex, script);
    } else if (scriptInput.scripts.length < 8) {
      setScriptInput({
        ...scriptInput,
        scripts: [...scriptInput.scripts, script]
      });
    }
  };

  const handleAnalyze = async () => {
    const filledScripts = scriptInput.scripts.filter(script => script.trim());
    
    // Enhanced validation with better error messages
    if (filledScripts.length < 2) {
      toast({
        title: "Not Enough Scripts",
        description: "Please provide at least 2 reference scripts to analyze.",
        variant: "destructive"
      });
      return;
    }
    
    if (!scriptInput.topic || !scriptInput.topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a video topic before proceeding with analysis.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      logger.log('Starting deep script analysis with Claude AI...');
      logger.log('Scripts to analyze:', filledScripts.length);
      logger.log('Topic:', scriptInput.topic);
      
      const { data, error } = await supabase.functions.invoke('analyze-scripts', {
        body: { 
          scripts: filledScripts,
          videoFormat: videoFormat
        }
      });

      if (error) {
        logger.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to analyze scripts');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze scripts');
      }

      const analysisData = data.analysis;
      
      setAnalysis({
        scriptAnalyses: analysisData.scriptAnalyses,
        synthesizedTactics: analysisData.synthesis.commonTactics,
        blueprint: analysisData.synthesis.blueprint,
        insights: analysisData.synthesis.insights
      });
      
      setIsAnalyzing(false);
      setCurrentStep(1);
      
    } catch (error) {
      logger.error('Analysis error:', error);
      setIsAnalyzing(false);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your scripts. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleGenerate = async (style?: string) => {
    if (style) {
      setContentStyle(style);
    }
    // Enhanced validation with detailed logging
    logger.log('Generate button clicked');
    logger.log('Current topic:', scriptInput.topic);
    logger.log('Topic length:', scriptInput.topic?.length || 0);
    logger.log('Topic trimmed:', scriptInput.topic?.trim());
    
    if (!scriptInput.topic || !scriptInput.topic.trim()) {
      logger.error('Topic validation failed - topic is empty or whitespace only');
      toast({
        title: "Topic Required",
        description: "Please enter a video topic before generating the script.",
        variant: "destructive"
      });
      return;
    }

    const filledScripts = scriptInput.scripts.filter(s => s.trim());
    if (filledScripts.length < 2) {
      logger.error('Scripts validation failed - not enough scripts');
      toast({
        title: "Scripts Required",
        description: "Please provide at least 2 reference scripts.",
        variant: "destructive"
      });
      return;
    }


    logger.log('Validation passed, proceeding with generation');
    setCurrentStep(2);
    setIsGenerating(true);
    progressTracking.reset();
    
    try {
      // Start progress tracking
      progressTracking.simulateProgress('analyzing', 3000);
      await new Promise(resolve => setTimeout(resolve, 2000));
      progressTracking.completeStep('analyzing');
      
      // Start generating step
      progressTracking.simulateProgress('generating', 30000);
      
      logger.log('Generating viral script with optimized performance...');
      logger.log('Topic:', scriptInput.topic);
      logger.log('Scripts count:', scriptInput.scripts.filter(s => s.trim()).length);
      
      const { data, error } = await supabase.functions.invoke('generate-script', {
        body: {
          topic: scriptInput.topic.trim(),
          description: scriptInput.description.trim(),
          targetAudience: videoFormat.platform === 'youtube' ? 'YouTube viewers interested in ' + scriptInput.topic.trim() : 
                          videoFormat.platform === 'tiktok' ? 'TikTok users interested in ' + scriptInput.topic.trim() :
                          'Social media users interested in ' + scriptInput.topic.trim(),
          analysis: analysis,
          scripts: scriptInput.scripts.filter(s => s.trim()),
          callToAction: scriptInput.callToAction.trim(),
          videoFormat: {
            ...videoFormat,
            style: contentStyle
          },
          targetWordCount: videoFormat.targetWordCount
        }
      });

      // Complete generating step immediately after API call
      progressTracking.completeStep('generating');
      
      if (error) {
        logger.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to generate script');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate script');
      }

      // Start and complete validation quickly
      progressTracking.simulateProgress('validating', 1000);
      await new Promise(resolve => setTimeout(resolve, 500));
      progressTracking.completeStep('validating');
      
      // Start and complete finalizing
      progressTracking.simulateProgress('finalizing', 500);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      logger.log('Viral script generated successfully');
      setGeneratedScript(data.script);
      
      // Log word count for debugging
      const actualWordCount = data.wordCount || targetWordCount;
      logger.log(`Generated script: ${actualWordCount} words`);
      
      progressTracking.completeStep('finalizing');
      
    } catch (error) {
      logger.error('Error generating script:', error);
      
      progressTracking.errorStep('generating', error.message);
      
      // Generate a fallback script
      const mockScript = generateFallbackScript(scriptInput.topic, scriptInput.callToAction, videoFormat);
      setGeneratedScript(mockScript);
      setCurrentStep(3);
      
      // Reduced toast notification
      toast({
        title: "Using Fallback Generation",
        description: "Generated script using local fallback.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackScript = (topic: string, cta: string, format: typeof videoFormat): string => {
    const isShortForm = format.format === 'short';
    const targetWords = format.targetWordCount;
    
    if (isShortForm) {
      // Short-form script
      return `What if I told you that ${topic.toLowerCase()} is completely different from what you've been taught?

In the next 30 seconds, I'm going to show you the exact method that changed everything for me.

First, forget everything you think you know. The traditional approach doesn't work because it ignores this one crucial element.

Here's what actually works: [demonstrates quick technique or insight]

The key is understanding that ${topic.toLowerCase()} isn't about complexity - it's about this simple principle that 99% of people miss.

Try this today: [specific action step]

${cta || 'Follow for more game-changing insights like this.'}

Trust me, once you see this in action, you'll never go back to the old way.`;
    }
    
    // Long-form script generation continues as before
    const baseScript = `What I'm about to reveal about ${topic.toLowerCase()} will completely transform your understanding and results forever. But first, let me show you why 97% of people fail at this."

**PROMISE & SETUP (3-15s)**
"By the end of this video, you'll have the exact step-by-step blueprint that took my student from complete beginner to achieving incredible results in just 30 days. But here's the thing - everything you've been told about ${topic.toLowerCase()} is probably wrong, and I'm going to prove it to you right now."

**PROBLEM REVELATION (15s-45s)**
"Here's the shocking truth that nobody talks about - 97% of people who try ${topic.toLowerCase()} fail not because they don't work hard enough, but because they're following outdated strategies that were designed to keep them stuck.

The industry doesn't want you to know this, but there's a specific reason why some people succeed while others struggle for years without results. And it all comes down to one crucial element that most people completely ignore.

But wait, it gets worse. Most so-called 'experts' are actually profiting from your confusion. When you're constantly searching for the next secret or tactic, you're constantly buying their products, courses, and services. They have a vested interest in keeping you on this endless hamster wheel of frustration."

**SOLUTION FRAMEWORK (45s-3m)**
"Now here's where everything changes. When I discovered this simple but powerful framework, my entire approach to ${topic.toLowerCase()} was revolutionized. Let me break down this game-changing system step by step:

**Step 1: Foundation Mastery**
The first thing you need to understand is that ${topic.toLowerCase()} isn't about what most people think. It's about understanding the underlying psychology and mechanics that drive real, sustainable results. Most people skip this foundational step, which is why they struggle.

Think about it this way - you wouldn't build a house without a solid foundation, yet that's exactly what most people do with ${topic.toLowerCase()}. They jump straight to tactics and strategies without understanding the core principles that make everything work.

**Step 2: Strategic System Building**
Once you have the foundation in place, you need to build a systematic approach that works every single time. This isn't about random tactics or hoping for the best - it's about creating a repeatable process that generates consistent results.

The key here is understanding that success in ${topic.toLowerCase()} follows predictable patterns. When you know these patterns and how to leverage them, you can achieve results that seem impossible to others.

**Step 3: Advanced Implementation Secrets**
This is where most people get stuck. They understand the theory but fail at implementation. The secret lies in the specific details that nobody talks about - the micro-adjustments, the timing, the psychological triggers that make all the difference.

For example, there's a specific sequence you need to follow, and if you get it wrong, nothing else matters. But when you get it right, the results are almost immediate and dramatic.

**Step 4: Scaling and Optimization**
Once you have the basics working, it's time to scale and optimize for maximum impact. This is where the real magic happens, and where you can achieve results that completely transform your situation.

The scaling process involves specific leverage points that multiply your efforts. Instead of working harder, you're working smarter by understanding these hidden accelerators that most people never discover."

**PROOF AND SOCIAL VALIDATION (3m-4m)**
"Just like my student Sarah, who used this exact system to achieve incredible results. She went from struggling for months with traditional approaches to seeing breakthrough results in her first week of implementing this framework.

But Sarah isn't the only one. I've worked with hundreds of people who were stuck exactly where you might be right now. They were doing everything they thought was right, following all the conventional advice, but nothing was working.

Within 48 hours of implementing this system, they saw their first breakthrough. Within a week, they had results they'd been chasing for months or even years. The difference? They stopped following generic advice and started using this specific framework.

Let me give you another real example. Last month, I worked with someone who had tried everything - spent thousands on courses, watched countless videos, followed every guru's advice. They were frustrated, exhausted, and ready to give up.

But then they discovered this approach. Within the first 48 hours, they had their first major breakthrough. Within two weeks, they had completely transformed their results. The transformation was so dramatic that their friends and family couldn't believe it was the same person.

The secret isn't about working harder - it's about working smarter. It's about understanding the hidden patterns and psychological triggers that successful people use but rarely talk about openly."

**ADVANCED INSIGHTS (4m-4m30s)**
"Here's something most people don't realize - the difference between those who succeed and those who don't isn't talent, luck, or even hard work. It's about having the right information and applying it in the right sequence.

Think about the most successful people in ${topic.toLowerCase()} - they all follow similar patterns, use similar psychological principles, and implement similar strategic frameworks. The difference is they understand the underlying mechanics that drive results.

When you understand these mechanics, you can reverse-engineer success and create your own breakthrough results. It's like having a blueprint that shows you exactly what to do, when to do it, and how to do it for maximum impact."

**CALL TO ACTION (4m30s-5m)**
"Look, I've given you the foundation and framework, but this is just the beginning. ${cta}.

Here's the thing - I'm only sharing the complete, advanced version of this system with people who are serious about creating real change in their lives. This isn't for everyone. It's only for people who are committed to taking action and implementing what they learn.

But if you're ready to stop struggling and start seeing real results, if you're tired of trying things that don't work and ready for a proven system that does, then this is your moment.

Don't let this opportunity pass you by like all the others. Your transformation starts right now. The question is: are you ready to take action, or are you going to let fear and hesitation keep you stuck where you are?

The choice is yours, but choose quickly. Success in ${topic.toLowerCase()} isn't about someday - it's about today. What are you waiting for?"`;

    // Calculate current word count and add more content if needed
    let currentWordCount = baseScript.trim().split(/\s+/).length;
    let finalScript = baseScript;

    if (currentWordCount < targetWords) {
      const additionalContent = generateDetailedAdditionalContent(topic, targetWords - currentWordCount);
      finalScript = baseScript.replace('**CALL TO ACTION (4m30s-5m)**', additionalContent + '\n\n**CALL TO ACTION (4m30s-5m)**');
    }

    return finalScript;
  };

  const generateDetailedAdditionalContent = (topic: string, wordsNeeded: number): string => {
    const expansionSections = [
      `**DEEP DIVE: The Psychology Behind ${topic}**
Understanding the psychological triggers that make ${topic.toLowerCase()} work is absolutely crucial for your success. This isn't just theory - this is the practical psychology that separates those who succeed from those who struggle.

The human brain is wired to respond to certain patterns and triggers. When you understand these patterns, you can use them to your advantage in ways that feel almost unfair. Research shows that successful implementation of ${topic.toLowerCase()} strategies depends heavily on psychological factors that most people completely ignore.

For instance, there's a specific cognitive bias that affects how people perceive value and make decisions. When you understand how to leverage this bias ethically, you can dramatically improve your results. Most people fight against human psychology instead of working with it, which is why they struggle.

The most successful practitioners of ${topic.toLowerCase()} understand that it's not just about the tactics - it's about the psychological framework that makes those tactics effective. They know how to trigger the right mental states, create the right associations, and guide people through predictable psychological processes.`,

      `**CASE STUDY: Advanced Implementation**
Let me share a detailed case study that perfectly illustrates these principles in action. This story will show you exactly how powerful this approach can be when implemented correctly.

My client John was extremely skeptical when he first started. He'd been burned before by promises that didn't deliver, and he'd tried virtually everything available in the ${topic.toLowerCase()} space. He was frustrated, cynical, and honestly ready to give up completely.

But when he applied this exact framework - not just the surface-level tactics, but the deep psychological principles and systematic approach - his results were immediate and dramatic. Within the first 72 hours, he saw changes that he hadn't experienced in months of previous effort.

The key was understanding that ${topic.toLowerCase()} isn't just about the obvious strategies everyone talks about. It's about the subtle psychological elements, the timing, the sequence, and the mindset that makes everything else work.

John's breakthrough came when he realized he'd been focusing on the wrong things entirely. Instead of chasing tactics, he started focusing on the underlying psychology and systematic approach. The results spoke for themselves - within two weeks, he had completely transformed his situation.

What made John's case particularly interesting was how quickly he was able to scale his results once he understood the core principles. Because he wasn't just copying tactics, but truly understood the psychology behind why things work, he could adapt and optimize in real-time.`,

      `**COMMON MISTAKES AND HOW TO AVOID THEM**
Before we wrap up, let me share the five biggest mistakes I see people make when implementing ${topic.toLowerCase()} strategies. Avoiding these mistakes alone can 10x your results, and I see people make them over and over again.

**Mistake #1: Trying to do everything at once instead of focusing on the fundamentals**
Most people try to implement every tactic they've ever heard about simultaneously. This creates confusion, overwhelm, and ultimately failure. The key is to master the fundamentals first, then layer on advanced strategies once you have a solid foundation.

**Mistake #2: Not tracking and measuring results properly**
You can't improve what you don't measure. Most people operate on feelings and assumptions instead of hard data. When you start tracking the right metrics and making data-driven decisions, your results improve dramatically.

**Mistake #3: Giving up too early before the compound effect kicks in**
Success in ${topic.toLowerCase()} often follows a compound curve - slow at first, then exponential. Most people give up during the slow phase, right before they would have seen breakthrough results. Understanding this timeline is crucial for long-term success.

**Mistake #4: Following generic advice instead of understanding core principles**
Generic advice rarely works because it doesn't account for individual situations and psychology. When you understand the core principles, you can adapt them to your specific circumstances for maximum effectiveness.

**Mistake #5: Focusing on tactics instead of psychology**
The biggest mistake is thinking that ${topic.toLowerCase()} is about tactics and strategies. The real secret is understanding the psychology that makes those tactics work. When you focus on psychology first, the tactics become much more effective.`,

      `**THE TRANSFORMATION MINDSET**
Here's what I want you to understand about transformation in ${topic.toLowerCase()} - it's not just about changing what you do, it's about changing how you think about what you do.

Most people approach ${topic.toLowerCase()} with a scarcity mindset, focused on what they lack and what they can't do. But the most successful practitioners operate from an abundance mindset, focused on possibilities and opportunities.

This mindset shift isn't just motivational fluff - it has practical, measurable impacts on your results. When you approach ${topic.toLowerCase()} from the right psychological frame, you make better decisions, take more effective actions, and persist through challenges that stop other people.

The transformation process involves rewiring your brain's default patterns and responses. This isn't as complicated as it sounds, but it does require understanding how your brain works and how to consciously direct its focus and energy.

When you master this psychological transformation, everything else becomes easier. The tactics work better, the strategies are more effective, and the results come faster and more consistently. This is why psychology is the foundation of everything else.`,

      `**IMPLEMENTATION ROADMAP**
Let me give you a clear roadmap for implementing everything we've discussed. This isn't just theory - this is your practical action plan for the next 30 days.

**Week 1: Foundation Building**
Focus entirely on mastering the psychological fundamentals. Don't worry about advanced tactics yet. Your goal is to rewire your mindset and establish the right mental framework.

**Week 2: System Implementation**
Start implementing the systematic approach we discussed. Focus on consistency and building sustainable habits rather than trying to achieve perfect results immediately.

**Week 3: Optimization and Refinement**
Begin tracking your results and making data-driven adjustments. This is where you start to see the compound effect beginning to take hold.

**Week 4: Scaling and Acceleration**
Start implementing the advanced scaling strategies. By this point, you should have solid momentum and be ready to amplify your results.

Remember, this is a process, not an event. Each week builds on the previous one, creating a compound effect that leads to breakthrough results.`
    ];

    let additionalContent = '';
    let wordsAdded = 0;
    
    for (const section of expansionSections) {
      const sectionWords = section.trim().split(/\s+/).length;
      if (wordsAdded + sectionWords <= wordsNeeded + 100) {
        additionalContent += '\n\n' + section;
        wordsAdded += sectionWords;
        
        if (wordsAdded >= wordsNeeded) break;
      }
    }

    return additionalContent;
  };

  return (
    <div className="min-h-screen w-full gradient-bg-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="py-6 sm:py-8 mb-3">
          <div className="max-w-5xl mx-auto">
            {/* Top bar with user menu */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div className="text-left">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
                    PitchArchitect
                  </h1>
                  <p className="text-sm text-muted-foreground hidden sm:block">
                    Professional Script Generation
                  </p>
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
              
              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 max-w-md mx-auto">
                <Button variant="outline" size="default" asChild className="flex-1 sm:flex-none border-border hover:bg-accent/50">
                  <Link to="/enhanced-tactics">
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Enhanced Tactics Library
                  </Link>
                </Button>
                <Button variant="outline" size="default" asChild className="flex-1 sm:flex-none border-border hover:bg-accent/50">
                  <Link to="/saved-scripts">
                    <FileText className="w-4 h-4 mr-2" />
                    My Saved Scripts
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Progress Steps - Minimized gap to bring closer to Enhanced Tactics Library */}
        <div className="flex justify-center mb-0">
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-3">
            <div className="flex items-center space-x-2 sm:space-x-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                        : isCompleted 
                        ? 'bg-green-500/10 text-green-600 border border-green-500/20' 
                        : 'bg-muted/50 text-muted-foreground border border-border/50'
                    }`}>
                      <div className={`p-1 rounded-lg ${
                        isActive 
                          ? 'bg-primary-foreground/20'
                          : isCompleted
                          ? 'bg-green-500/20'
                          : 'bg-muted'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium whitespace-nowrap hidden sm:block">{step.title}</span>
                      <span className="text-xs font-medium sm:hidden">{step.id + 1}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-6 sm:w-8 h-0.5 mx-1 sm:mx-2 transition-colors duration-300 ${
                        isCompleted ? 'bg-green-500/30' : 'bg-border/30'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {currentStep === 0 && (
            <Card className="glass-effect border-border/50 shadow-2xl">
              <CardHeader className="text-center pb-4 px-6">
                <CardTitle className="text-xl flex items-center justify-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Input Your Reference Scripts
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Multiple ways to add scripts: copy-paste, upload files
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 px-6 pb-6">
                {/* Script Input Methods */}
                <Tabs defaultValue="manual" className="w-full">
                  <TabsList className="flex w-full gap-2 bg-muted p-2">
                    <TabsTrigger 
                      value="manual"
                      className="text-xs sm:text-sm flex-1"
                    >
                      Manual Input
                    </TabsTrigger>
                    <TabsTrigger 
                      value="upload"
                      className="text-xs sm:text-sm flex-1 bg-primary/10 text-primary border border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Upload Files
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="manual" className="mt-4 sm:mt-6">
                    {/* Dynamic Script Inputs */}
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base sm:text-lg font-semibold">Reference Scripts ({scriptInput.scripts.length}/8)</h3>
                      </div>
                      
                      <div className="grid gap-3 sm:gap-4">
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
                      
                      <div className="flex justify-end">
                        <Button 
                          onClick={addScriptPanel}
                          disabled={scriptInput.scripts.length >= 8}
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm"
                        >
                          + Add Script
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="upload" className="mt-4 sm:mt-6">
                    <FileUploader 
                      onScriptExtracted={handleFileScriptExtracted}
                      maxFiles={5}
                    />
                  </TabsContent>
                </Tabs>

                <Separator />

                {/* Video Details */}
                <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic" className="text-xs sm:text-sm font-medium text-foreground">
                      Video Topic <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="topic"
                      placeholder="e.g., How to make money online"
                      value={scriptInput.topic}
                      onChange={(e) => setScriptInput({...scriptInput, topic: e.target.value})}
                      className={`text-xs sm:text-sm ${!scriptInput.topic.trim() ? 'border-red-300 focus:border-red-500' : ''}`}
                      required
                    />
                    {!scriptInput.topic.trim() && (
                      <p className="text-xs text-red-500 mt-1">Topic is required to proceed</p>
                    )}
                  </div>
                    <div className="space-y-2">
                      <Label htmlFor="cta" className="text-xs sm:text-sm font-medium">Call to Action</Label>
                      <Input
                        id="cta"
                        placeholder="Subscribe to my course"
                        value={scriptInput.callToAction}
                        onChange={(e) => setScriptInput({...scriptInput, callToAction: e.target.value})}
                        className="text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs sm:text-sm font-medium">Video Description/Context</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what this video is about, the angle you want to take, or any specific context..."
                      className="min-h-[60px] sm:min-h-[80px] text-xs sm:text-sm"
                      value={scriptInput.description}
                      onChange={(e) => setScriptInput({...scriptInput, description: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2 hidden">
                    <Label htmlFor="length" className="text-xs sm:text-sm font-medium">Minimum Amount of Words</Label>
                    <Input
                      id="length"
                      type="number"
                      placeholder="1400"
                      value={scriptInput.targetLength}
                      onChange={(e) => setScriptInput({...scriptInput, targetLength: parseInt(e.target.value)})}
                      className="text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <Separator />

                {/* Simplified Format Selector */}
                <div className="space-y-2">
                  <SimplifiedFormatSelector
                    selectedFormat={videoFormat}
                    onFormatChange={(format) => {
                      setVideoFormat(format);
                      setScriptInput({
                        ...scriptInput,
                        targetLength: format.targetWordCount
                      });
                    }}
                  />
                </div>

                <div className="flex justify-center pt-4 sm:pt-6">
                  <Button 
                    onClick={handleAnalyze}
                    disabled={scriptInput.scripts.filter(s => s.trim()).length < 2 || !scriptInput.topic || isAnalyzing}
                    className="w-full sm:w-auto btn-futuristic text-white"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-pulse"></div>
                        <div className="relative flex items-center justify-center">
                          <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="hidden sm:inline">Analyzing Your Scripts...</span>
                          <span className="sm:hidden">Analyzing...</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        <span className="hidden sm:inline">Analyze Scripts for Viral Tactics</span>
                        <span className="sm:hidden">Analyze Scripts</span>
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
              currentStep={currentStep}
              videoFormat={videoFormat}
              generatedScript={generatedScript}
              scriptInput={scriptInput}
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
          <div className="mt-12 mb-8 max-w-5xl mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">Powerful Features</h3>
              <p className="text-sm text-muted-foreground">Everything you need for professional script generation</p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="text-center p-6 border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2 text-foreground">File Upload</h4>
                <p className="text-sm text-muted-foreground">
                  Upload TXT, PDF, DOC files for instant script extraction
                </p>
              </Card>
              <Card className="text-center p-6 border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2 text-foreground">AI Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Analyze emotional tone and engagement potential with AI
                </p>
              </Card>
              <Card className="text-center p-6 border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Languages className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2 text-foreground">Translation</h4>
                <p className="text-sm text-muted-foreground">
                  Translate scripts to 15+ languages while preserving impact
                </p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
