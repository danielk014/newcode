import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Brain, Zap, Target, BarChart3, Clock, ArrowRight } from 'lucide-react';
import { ClickableTactic } from './ClickableTactic';

interface ScriptAnalyzerProps {
  analysis: any;
  onGenerate: (script: string, tactics: any[]) => void;
  currentStep?: number;
}

export const ScriptAnalyzer: React.FC<ScriptAnalyzerProps> = ({ analysis, onGenerate, currentStep }) => {
  const [activeTab, setActiveTab] = useState('analysis');

  if (!analysis) {
    return (
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Brain className="w-6 h-6 text-blue-600 animate-pulse" />
            Analyzing Your Scripts...
          </CardTitle>
          <p className="text-gray-600">Our AI is examining your scripts for viral patterns and tactics</p>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  const getTacticColor = (tactic: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800'
    ];
    return colors[tactic.length % colors.length];
  };

  const handleNextStep = () => {
    if (activeTab === 'analysis') {
      setActiveTab('synthesis');
    } else if (activeTab === 'synthesis') {
      setActiveTab('blueprint');
    } else if (activeTab === 'blueprint') {
      setActiveTab('generate');
    }
    // Only call onGenerate when explicitly clicking the "Generate Script" button
  };

  const handleGenerateScript = () => {
    // Generate mock script and tactics based on analysis
    const mockScript = `
🔥 ATTENTION: This Changes Everything...

Stop scrolling for just 30 seconds because what I'm about to show you will completely transform how you approach [your industry].

Most people are struggling with [common problem] because they're doing it all wrong. They think [misconception], but here's the truth nobody talks about...

[Insert compelling story/case study from analysis]

The secret? It's not about working harder - it's about working smarter using these 3 proven strategies:

1. [Strategy based on detected tactic]
2. [Strategy based on detected tactic] 
3. [Strategy based on detected tactic]

I've helped over [number] people achieve [desired outcome], and now I want to help you too.

But here's the thing - this window of opportunity won't stay open forever.

Click the link in my bio RIGHT NOW to get started, or drop a comment below and I'll send you the details personally.

Don't let another day pass wondering "what if" - your future self will thank you for taking action today.

#transformation #success #breakthrough
    `.trim();

    const mockTactics = [
      { name: 'Pattern Interrupt', category: 'Attention', strength: 9, description: 'Opening with "Stop scrolling" breaks normal scroll behavior' },
      { name: 'Authority Building', category: 'Credibility', strength: 8, description: 'References helping many people previously' },
      { name: 'Social Proof', category: 'Credibility', strength: 7, description: 'Mentions number of people helped' },
      { name: 'Urgency', category: 'Action', strength: 8, description: 'Creates time pressure with "won\'t stay open forever"' },
      { name: 'FOMO', category: 'Emotional', strength: 7, description: 'Fear of missing out on opportunity' },
      { name: 'Direct CTA', category: 'Action', strength: 9, description: 'Clear call to action with multiple options' }
    ];

    onGenerate(mockScript, mockTactics);
  };

  const getButtonText = () => {
    if (activeTab === 'generate') {
      return 'Generate Script';
    }
    return 'Next Step';
  };

  const getButtonColor = () => {
    if (activeTab === 'generate') {
      return 'bg-green-600 hover:bg-green-700';
    }
    return 'bg-blue-600 hover:bg-blue-700';
  };

  const getButtonClickHandler = () => {
    if (activeTab === 'generate') {
      return handleGenerateScript;
    }
    return handleNextStep;
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            Deep Script Analysis Complete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex w-full gap-2 bg-muted p-2">
              <TabsTrigger value="analysis" className="flex-1 border border-black">Analysis</TabsTrigger>
              <TabsTrigger value="synthesis" className="flex-1 border border-black">Synthesis</TabsTrigger>
              <TabsTrigger value="blueprint" className="flex-1 border border-black">Blueprint</TabsTrigger>
              <TabsTrigger value="generate" className="flex-1 border border-black">Generate</TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="mt-6">
              <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
                {analysis.scriptAnalyses.map((scriptAnalysis: any, index: number) => (
                  <Card key={index} className="border-l-4 border-l-blue-500 h-fit">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        Reference Script #{index + 1}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Basic Stats */}
                        <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <div className="text-sm text-gray-600">Word Count</div>
                            <div className="font-bold text-lg">{scriptAnalysis.wordCount}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-600">Duration</div>
                            <div className="font-bold text-lg">{scriptAnalysis.estimatedDuration}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-600">Tactics</div>
                            <div className="font-bold text-lg">{scriptAnalysis.tactics.length}</div>
                          </div>
                        </div>

                        {/* Script Structure Analysis */}
                        {scriptAnalysis.structure && (
                          <div className="space-y-3">
                            <h4 className="font-medium text-gray-800">Script Structure:</h4>
                            <div className="space-y-2">
                              <div className="p-2 bg-blue-50 rounded border-l-2 border-blue-400">
                                <div className="text-xs font-medium text-blue-800">HOOK</div>
                                <div className="text-sm text-gray-700">{scriptAnalysis.structure.hook}</div>
                              </div>
                              <div className="p-2 bg-red-50 rounded border-l-2 border-red-400">
                                <div className="text-xs font-medium text-red-800">PROBLEM</div>
                                <div className="text-sm text-gray-700">{scriptAnalysis.structure.problem}</div>
                              </div>
                              <div className="p-2 bg-green-50 rounded border-l-2 border-green-400">
                                <div className="text-xs font-medium text-green-800">SOLUTION</div>
                                <div className="text-sm text-gray-700">{scriptAnalysis.structure.solution}</div>
                              </div>
                              <div className="p-2 bg-purple-50 rounded border-l-2 border-purple-400">
                                <div className="text-xs font-medium text-purple-800">CALL TO ACTION</div>
                                <div className="text-sm text-gray-700">{scriptAnalysis.structure.cta}</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Tactics with Strength and Timing */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-800">Detected Tactics:</h4>
                          <div className="grid gap-3">
                            {scriptAnalysis.tactics
                              .sort((a: any, b: any) => (b.strength || 0) - (a.strength || 0))
                              .map((tactic: any, tacticIndex: number) => (
                              <div key={tacticIndex} className="p-4 border rounded-lg bg-card shadow-sm border-l-4 border-l-primary">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <Badge className={getTacticColor(tactic.name)} variant="secondary">
                                      {tactic.name}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {tactic.category}
                                    </Badge>
                                  </div>
                                  {tactic.strength && (
                                    <Badge variant="outline" className="text-xs font-bold text-accent-foreground bg-accent">
                                      {tactic.strength}/10
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{tactic.description}</p>
                                {tactic.timestamps && (
                                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                                    <span className="font-medium">Timing:</span> {tactic.timestamps.join(', ')}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Hero's Journey Elements */}
                        {scriptAnalysis.heroJourneyElements && scriptAnalysis.heroJourneyElements.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-medium text-gray-800">Hero's Journey Elements:</h4>
                            <div className="space-y-2">
                              {scriptAnalysis.heroJourneyElements.map((element: any, elemIndex: number) => (
                                <div key={elemIndex} className="p-2 border rounded bg-yellow-50">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-yellow-800">{element.stage}</span>
                                    <span className="text-xs text-yellow-600">{element.timestamp}</span>
                                  </div>
                                  <p className="text-xs text-gray-600">{element.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Emotional Tone */}
                        {scriptAnalysis.emotionalTone && scriptAnalysis.emotionalTone.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-800">Emotional Tone:</h4>
                            <div className="flex flex-wrap gap-1">
                              {scriptAnalysis.emotionalTone.map((tone: string, toneIndex: number) => (
                                <Badge key={toneIndex} variant="outline" className="text-xs bg-pink-50 text-pink-700 border-pink-200">
                                  {tone}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Effectiveness Score */}
                        <div className="pt-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Effectiveness Score</span>
                            <span className="text-sm font-bold">{Math.min(95, scriptAnalysis.tactics.length * 12 + 20)}%</span>
                          </div>
                          <Progress value={Math.min(95, scriptAnalysis.tactics.length * 12 + 20)} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={getButtonClickHandler()}
                  className={`${getButtonColor()} text-white px-6 py-2 border border-black`}
                >
                  {getButtonText()}
                  {activeTab === 'generate' ? <Zap className="w-4 h-4 ml-2" /> : <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="synthesis" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    Synthesized Tactics ({analysis.synthesizedTactics.length} Found)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {analysis.synthesizedTactics.map((tactic: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <ClickableTactic name={tactic.name} currentStep={currentStep} analysis={analysis}>
                            <span className="font-medium">{tactic.name}</span>
                          </ClickableTactic>
                          <Badge variant="outline">{tactic.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{tactic.description}</p>
                      </div>
                    ))}
                  </div>
                  {analysis.insights && analysis.insights.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Key Insights:</h4>
                      <ul className="space-y-2">
                        {analysis.insights.map((insight: string, index: number) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={getButtonClickHandler()}
                  className={`${getButtonColor()} text-white px-6 py-2 border border-black`}
                >
                  {getButtonText()}
                  {activeTab === 'generate' ? <Zap className="w-4 h-4 ml-2" /> : <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="blueprint" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    Script Blueprint (Based on Your Scripts)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.blueprint?.sections?.map((section: any, index: number) => (
                      <div key={index} className="p-6 border rounded-lg bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 font-bold text-xl">{index + 1}</span>
                          </div>
                          
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                            <div className="md:col-span-2">
                              <h4 className="font-semibold text-lg mb-1">{section.name}</h4>
                              <p className="text-sm text-gray-600">{section.purpose}</p>
                            </div>
                            
                            <div className="flex flex-col items-start md:items-center">
                              <div className="text-sm font-medium text-gray-700 mb-1">{section.duration}</div>
                              <div className="text-xs text-gray-500">{section.wordCount} words</div>
                            </div>
                            
                            <div className="flex flex-wrap gap-1 justify-start md:justify-end">
                              {section.tactics?.map((tactic: string, tacticIndex: number) => (
                                <Badge key={tacticIndex} variant="secondary" className="text-xs whitespace-nowrap">
                                  {tactic}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center text-gray-500 py-8">
                        No blueprint data available. Please re-analyze your scripts.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={getButtonClickHandler()}
                  className={`${getButtonColor()} text-white px-6 py-2 border border-black`}
                >
                  {getButtonText()}
                  {activeTab === 'generate' ? <Zap className="w-4 h-4 ml-2" /> : <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="generate" className="mt-6">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-600" />
                    Ready to Generate Your Script
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    <div className="grid grid-cols-2 gap-6 max-w-md mx-auto mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{analysis.synthesizedTactics.length}</div>
                        <div className="text-sm text-gray-600">Tactics Ready</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{analysis.blueprint?.sections?.length || 0}</div>
                        <div className="text-sm text-gray-600">Sections Planned</div>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-6">
                      Your script will incorporate the most effective tactics from your reference scripts, 
                      structured for maximum engagement and conversion.
                    </p>
                  </div>
                  <Button onClick={handleGenerateScript} size="lg" className="px-8 bg-accent hover:bg-accent/90 text-accent-foreground border">
                    <Zap className="w-5 h-5 mr-2" />
                    Generate Script
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
