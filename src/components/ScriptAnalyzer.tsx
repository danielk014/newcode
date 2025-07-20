
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Brain, Zap, Target, BarChart3, ArrowRight } from 'lucide-react';
import { ClickableTactic } from './ClickableTactic';
import { useLocation } from 'react-router-dom';

interface ScriptAnalyzerProps {
  analysis: any;
  onGenerate: () => void;
  currentStep?: number;
}

export const ScriptAnalyzer: React.FC<ScriptAnalyzerProps> = ({ analysis, onGenerate, currentStep }) => {
  const [activeTab, setActiveTab] = useState('analysis');
  const location = useLocation();

  const getTacticColor = (tactic: string) => {
    const colors = [
      'bg-blue-900/20 text-blue-200 border-blue-700/50',
      'bg-emerald-900/20 text-emerald-200 border-emerald-700/50',
      'bg-purple-900/20 text-purple-200 border-purple-700/50',
      'bg-amber-900/20 text-amber-200 border-amber-700/50',
      'bg-rose-900/20 text-rose-200 border-rose-700/50',
      'bg-indigo-900/20 text-indigo-200 border-indigo-700/50'
    ];
    return colors[tactic.length % colors.length];
  };

  const handleNextStep = () => {
    if (activeTab === 'analysis') {
      setActiveTab('synthesis');
    } else if (activeTab === 'synthesis') {
      setActiveTab('generate');
    }
  };

  const handleGenerateScript = () => {
    onGenerate();
  };

  const getButtonText = () => {
    if (activeTab === 'generate') {
      return 'Generate Script';
    }
    return 'Next Step';
  };

  const getButtonColor = () => {
    if (activeTab === 'generate') {
      return 'bg-emerald-600 hover:bg-emerald-700 border-emerald-500';
    }
    return 'bg-blue-600 hover:bg-blue-700 border-blue-500';
  };

  const getButtonClickHandler = () => {
    if (activeTab === 'generate') {
      return handleGenerateScript;
    }
    return handleNextStep;
  };

  return (
    <div className="space-y-6">
      <Card className="glass border-border/50 bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center border-b border-border/50">
          <CardTitle className="text-2xl flex items-center justify-center gap-2 text-foreground">
            <Brain className="w-6 h-6 text-blue-400" />
            Deep Script Analysis Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex w-full gap-2 bg-muted/50 p-2 border border-border/50">
              <TabsTrigger 
                value="analysis" 
                className="flex-1 border border-border/50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-500"
              >
                Analysis
              </TabsTrigger>
              <TabsTrigger 
                value="synthesis" 
                className="flex-1 border border-border/50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-500"
              >
                Synthesis
              </TabsTrigger>
              <TabsTrigger 
                value="generate" 
                className="flex-1 border border-border/50 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:border-emerald-500"
              >
                Generate
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="mt-6">
              <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
                {analysis.scriptAnalyses.map((scriptAnalysis: any, index: number) => (
                  <Card key={index} className="border-l-4 border-l-blue-500 h-fit bg-card/80 backdrop-blur-sm border-border/50">
                    <CardHeader className="border-b border-border/30">
                      <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                        <BarChart3 className="w-5 h-5 text-blue-400" />
                        Reference Script #{index + 1}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Basic Stats */}
                        <div className="grid grid-cols-3 gap-4 p-3 bg-muted/30 rounded-lg border border-border/30">
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Word Count</div>
                            <div className="font-bold text-lg text-foreground">{scriptAnalysis.wordCount}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Duration</div>
                            <div className="font-bold text-lg text-foreground">{scriptAnalysis.estimatedDuration}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Tactics</div>
                            <div className="font-bold text-lg text-foreground">{scriptAnalysis.tactics.length}</div>
                          </div>
                        </div>

                        {/* Script Structure Analysis */}
                        {scriptAnalysis.structure && (
                          <div className="space-y-3">
                            <h4 className="font-medium text-foreground">Script Structure:</h4>
                            <div className="space-y-2">
                              <div className="p-3 bg-blue-900/20 rounded border-l-2 border-blue-400 backdrop-blur-sm">
                                <div className="text-xs font-medium text-blue-300 mb-1">HOOK</div>
                                <div className="text-sm text-muted-foreground">{scriptAnalysis.structure.hook}</div>
                              </div>
                              <div className="p-3 bg-red-900/20 rounded border-l-2 border-red-400 backdrop-blur-sm">
                                <div className="text-xs font-medium text-red-300 mb-1">PROBLEM</div>
                                <div className="text-sm text-muted-foreground">{scriptAnalysis.structure.problem}</div>
                              </div>
                              <div className="p-3 bg-emerald-900/20 rounded border-l-2 border-emerald-400 backdrop-blur-sm">
                                <div className="text-xs font-medium text-emerald-300 mb-1">SOLUTION</div>
                                <div className="text-sm text-muted-foreground">{scriptAnalysis.structure.solution}</div>
                              </div>
                              <div className="p-3 bg-purple-900/20 rounded border-l-2 border-purple-400 backdrop-blur-sm">
                                <div className="text-xs font-medium text-purple-300 mb-1">CALL TO ACTION</div>
                                <div className="text-sm text-muted-foreground">{scriptAnalysis.structure.cta}</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Tactics with Strength and Timing */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-foreground">Detected Tactics:</h4>
                          <div className="grid gap-3">
                            {scriptAnalysis.tactics
                              .sort((a: any, b: any) => (b.strength || 0) - (a.strength || 0))
                              .map((tactic: any, tacticIndex: number) => (
                              <div key={tacticIndex} className="p-4 border rounded-lg bg-card/60 backdrop-blur-sm border-border/50 border-l-4 border-l-primary">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <Badge className={`${getTacticColor(tactic.name)} border`} variant="secondary">
                                      {tactic.name}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">
                                      {tactic.category}
                                    </Badge>
                                  </div>
                                  {tactic.strength && (
                                    <Badge className="text-xs font-bold text-emerald-200 bg-emerald-900/30 border-emerald-700/50 border">
                                      {tactic.strength}/10
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{tactic.description}</p>
                                {tactic.timestamps && (
                                  <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded border border-border/30">
                                    <span className="font-medium text-foreground">Timing:</span> {tactic.timestamps.join(', ')}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Hero's Journey Elements */}
                        {scriptAnalysis.heroJourneyElements && scriptAnalysis.heroJourneyElements.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-medium text-foreground">Hero's Journey Elements:</h4>
                            <div className="space-y-2">
                              {scriptAnalysis.heroJourneyElements.map((element: any, elemIndex: number) => (
                                <div key={elemIndex} className="p-3 border rounded bg-amber-900/20 border-amber-700/50 backdrop-blur-sm">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-amber-300">{element.stage}</span>
                                    <span className="text-xs text-amber-400">{element.timestamp}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{element.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Emotional Tone */}
                        {scriptAnalysis.emotionalTone && scriptAnalysis.emotionalTone.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-foreground">Emotional Tone:</h4>
                            <div className="flex flex-wrap gap-2">
                              {scriptAnalysis.emotionalTone.map((tone: string, toneIndex: number) => (
                                <Badge key={toneIndex} className="text-xs bg-rose-900/20 text-rose-300 border-rose-700/50 border">
                                  {tone}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Effectiveness Score */}
                        <div className="pt-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">Effectiveness Score</span>
                            <span className="text-sm font-bold text-emerald-400">{Math.min(95, scriptAnalysis.tactics.length * 12 + 20)}%</span>
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
                  className={`${getButtonColor()} text-white px-6 py-2 border font-medium`}
                >
                  {getButtonText()}
                  {activeTab === 'generate' ? <Zap className="w-4 h-4 ml-2" /> : <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="synthesis" className="mt-6">
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardHeader className="border-b border-border/30">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Target className="w-5 h-5 text-purple-400" />
                    Synthesized Tactics ({analysis.synthesizedTactics.length} Found)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {analysis.synthesizedTactics.map((tactic: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg bg-muted/20 backdrop-blur-sm border-border/50">
                        <div className="flex items-center justify-between mb-2">
                          <ClickableTactic 
                            name={tactic.name} 
                            currentStep={currentStep} 
                            analysis={analysis}
                          >
                            <span className="font-medium text-foreground hover:text-blue-400 cursor-pointer">{tactic.name}</span>
                          </ClickableTactic>
                          <Badge variant="outline" className="border-border/50 text-muted-foreground">{tactic.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{tactic.description}</p>
                      </div>
                    ))}
                  </div>
                  {analysis.insights && analysis.insights.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-3 text-foreground">Key Insights:</h4>
                      <ul className="space-y-2">
                        {analysis.insights.map((insight: string, index: number) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
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
                  className={`${getButtonColor()} text-white px-6 py-2 border font-medium`}
                >
                  {getButtonText()}
                  {activeTab === 'generate' ? <Zap className="w-4 h-4 ml-2" /> : <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="generate" className="mt-6">
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardHeader className="text-center border-b border-border/30">
                  <CardTitle className="flex items-center justify-center gap-2 text-foreground">
                    <Zap className="w-6 h-6 text-amber-400" />
                    Ready to Generate Your Script
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center p-6">
                  <div className="mb-6">
                    <div className="grid grid-cols-2 gap-6 max-w-md mx-auto mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{analysis.synthesizedTactics.length}</div>
                        <div className="text-sm text-muted-foreground">Tactics Ready</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-400">4</div>
                        <div className="text-sm text-muted-foreground">Sections Planned</div>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-6">
                      Your script will incorporate the most effective tactics from your reference scripts, 
                      structured for maximum engagement and conversion.
                    </p>
                  </div>
                  <Button 
                    onClick={handleGenerateScript} 
                    size="lg" 
                    className="px-8 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500 font-medium"
                  >
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
