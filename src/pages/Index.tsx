
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Wand2, Save, Sparkles, Target, Library, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ScriptGenerationForm } from '@/components/ScriptGenerationForm';
import { ScriptAnalyzer } from '@/components/ScriptAnalyzer';
import { ScriptImprovement } from '@/components/ScriptImprovement';
import { SentimentAnalyzer } from '@/components/SentimentAnalyzer';
import { SavedScripts } from '@/components/SavedScripts';
import { RecentScripts, addToRecentScripts } from '@/components/RecentScripts';
import { TacticMapper } from '@/components/TacticMapper';
import { IndustryTemplates } from '@/components/IndustryTemplates';
import { useAuth } from '@/components/AuthProvider';
import { Link } from 'react-router-dom';

const Index = () => {
  const [generatedScript, setGeneratedScript] = useState('');
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveIndustry, setSaveIndustry] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const scriptEndRef = useRef<HTMLDivElement>(null);

  const scrollToScript = () => {
    if (scriptEndRef.current) {
      scriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const startProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);
  };

  const completeProgress = () => {
    setProgress(100);
  };

  const handleScriptGeneration = async (inputs: any, tactics: any[]) => {
    setIsGenerating(true);
    startProgress();
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-script', {
        body: { inputs, tactics }
      });

      if (error) throw error;

      const script = data.script;
      setGeneratedScript(script);
      
      // Add to recent scripts with a meaningful title
      const scriptTitle = inputs.topic ? 
        `Script about ${inputs.topic}` : 
        `Generated Script - ${new Date().toLocaleDateString()}`;
      
      addToRecentScripts(scriptTitle, script);
      
      completeProgress();
      
      setTimeout(scrollToScript, 500);
      
      toast({
        title: "Script Generated!",
        description: "Your script has been generated successfully."
      });
    } catch (error) {
      console.error('Error generating script:', error);
      toast({
        title: "Generation Failed",
        description: "Could not generate script. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScriptAnalysis = async () => {
    if (!generatedScript.trim()) {
      toast({
        title: "No Script to Analyze",
        description: "Please generate a script first",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-scripts', {
        body: { script: generatedScript }
      });

      if (error) throw error;

      setAnalysisResults(data);
      toast({
        title: "Analysis Complete!",
        description: "Script analysis has been completed."
      });
    } catch (error) {
      console.error('Error analyzing script:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze script. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveScript = async () => {
    if (!generatedScript?.trim() || !saveTitle.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a title and script content",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('saved_scripts')
        .insert({
          user_id: user?.id,
          title: saveTitle,
          content: generatedScript,
          industry: saveIndustry || null,
          language: 'en',
          word_count: generatedScript.split(' ').length
        });

      if (error) throw error;

      toast({
        title: "Script Saved!",
        description: `"${saveTitle}" has been saved to your library`
      });

      setSaveTitle('');
      setSaveIndustry('');
    } catch (error) {
      console.error('Error saving script:', error);
      toast({
        title: "Save Failed",
        description: "Could not save script",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const loadScript = (script: string, title: string) => {
    setGeneratedScript(script);
    setSaveTitle(`${title} - Enhanced`);
    setTimeout(scrollToScript, 100);
    
    toast({
      title: "Script Loaded",
      description: `Loaded "${title}" into the editor`
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 mb-3">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Script Generator
              </h1>
              <p className="text-gray-600 text-sm">Create compelling scripts with AI-powered assistance</p>
            </div>
            <div className="flex gap-2">
              <Link 
                to="/tactics"
                state={{ 
                  from: '/',
                  currentScript: generatedScript,
                  saveTitle,
                  saveIndustry
                }}
              >
                <Button variant="outline" size="sm">
                  <Target className="w-4 h-4 mr-2" />
                  Enhanced Tactics Library
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pb-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Input Panel */}
          <div className="lg:col-span-2 space-y-6">
            <ScriptGenerationForm onGenerate={handleScriptGeneration} isGenerating={isGenerating} />

            {/* Industry Templates */}
            <IndustryTemplates onTemplateSelect={loadScript} />

            {/* Generated Script Section */}
            {(generatedScript || isGenerating) && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Generated Script
                    {progress > 0 && progress < 100 && (
                      <Badge variant="secondary" className="ml-2">Generating...</Badge>
                    )}
                  </CardTitle>
                  {progress > 0 && progress < 100 && (
                    <Progress value={progress} className="w-full" />
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {isGenerating ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Generating your script...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Textarea
                        value={generatedScript}
                        onChange={(e) => setGeneratedScript(e.target.value)}
                        className="min-h-[300px] text-sm"
                        placeholder="Your generated script will appear here..."
                      />
                      
                      <div className="flex gap-2 flex-wrap">
                        <Button 
                          onClick={handleScriptAnalysis}
                          disabled={isAnalyzing || !generatedScript.trim()}
                          variant="outline"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          {isAnalyzing ? 'Analyzing...' : 'Analyze Script'}
                        </Button>

                        {user && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline">
                                <Save className="w-4 h-4 mr-2" />
                                Save Script
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Save Script</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Input
                                  placeholder="Script title..."
                                  value={saveTitle}
                                  onChange={(e) => setSaveTitle(e.target.value)}
                                />
                                <Input
                                  placeholder="Industry (optional)"
                                  value={saveIndustry}
                                  onChange={(e) => setSaveIndustry(e.target.value)}
                                />
                                <Button onClick={saveScript} disabled={isSaving} className="w-full">
                                  <Save className="w-4 h-4 mr-2" />
                                  {isSaving ? 'Saving...' : 'Save Script'}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  )}
                  <div ref={scriptEndRef} />
                </CardContent>
              </Card>
            )}

            {/* Analysis and Enhancement Tools */}
            {analysisResults && (
              <Tabs defaultValue="analysis" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  <TabsTrigger value="improvement">Improvement</TabsTrigger>
                  <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
                  <TabsTrigger value="tactics">Tactics</TabsTrigger>
                </TabsList>
                
                <TabsContent value="analysis">
                  <ScriptAnalyzer />
                </TabsContent>
                
                <TabsContent value="improvement">
                  <ScriptImprovement 
                    onScriptImproved={(improvedScript) => {
                      setGeneratedScript(improvedScript);
                      addToRecentScripts(
                        saveTitle ? `${saveTitle} - Improved` : 'Improved Script',
                        improvedScript
                      );
                    }}
                  />
                </TabsContent>
                
                <TabsContent value="sentiment">
                  <SentimentAnalyzer />
                </TabsContent>
                
                <TabsContent value="tactics">
                  <TacticMapper tactics={[]} />
                </TabsContent>
              </Tabs>
            )}
          </div>

          {/* Right Column - Scripts & Tools */}
          <div className="space-y-6">
            {/* Recent Scripts */}
            <RecentScripts onLoadScript={loadScript} />
            
            {/* Saved Scripts */}
            <SavedScripts onLoadScript={loadScript} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
