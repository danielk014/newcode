
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Brain, Zap, Target, BarChart3, ArrowRight } from 'lucide-react';
import { ClickableTactic } from './ClickableTactic';
import { ContentStyleSelector } from './ContentStyleSelector';
import { useLocation } from 'react-router-dom';
import { ScriptAnalysis } from '@/types/script';

interface ScriptAnalyzerProps {
  analysis: ScriptAnalysis;
  onGenerate: (style: string) => void;
  currentStep?: number;
  videoFormat?: any;
  generatedScript?: string;
  scriptInput?: any;
}

export const ScriptAnalyzer: React.FC<ScriptAnalyzerProps> = ({ analysis, onGenerate, currentStep, videoFormat, generatedScript, scriptInput }) => {
  const [activeTab, setActiveTab] = useState('analysis');
  const [selectedStyle, setSelectedStyle] = useState('educational');
  const location = useLocation();

  const getTacticColor = (tactic: string) => {
    const colors = [
      'bg-primary/20 text-primary',
      'bg-accent/20 text-accent',
      'bg-purple-500/20 text-purple-400',
      'bg-orange-500/20 text-orange-400',
      'bg-pink-500/20 text-pink-400',
      'bg-indigo-500/20 text-indigo-400'
    ];
    return colors[tactic.length % colors.length];
  };

  const handleNextStep = () => {
    if (activeTab === 'analysis') {
      setActiveTab('synthesis');
    } else if (activeTab === 'synthesis') {
      setActiveTab('generate');
    }
    // Only call onGenerate when explicitly clicking the "Generate Script" button
  };

  const handleGenerateScript = () => {
    onGenerate(selectedStyle);
  };

  const getButtonText = () => {
    if (activeTab === 'generate') {
      return 'Generate Script';
    }
    return 'Next Step';
  };

  const getButtonColor = () => {
    if (activeTab === 'generate') {
      return 'btn-futuristic text-white';
    }
    return 'btn-futuristic text-white';
  };

  const getButtonClickHandler = () => {
    if (activeTab === 'generate') {
      return handleGenerateScript;
    }
    return handleNextStep;
  };

  return (
    <div className="space-y-6">
      <Card className="glass-effect border-border/50 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Deep Script Analysis Complete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex w-full gap-2 glass-effect p-2">
              <TabsTrigger value="analysis" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white">Analysis</TabsTrigger>
              <TabsTrigger value="synthesis" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white">Synthesis</TabsTrigger>
              <TabsTrigger value="generate" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white">Generate</TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="mt-6">
              <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
                {analysis.scriptAnalyses.map((scriptAnalysis: any, index: number) => (
                  <Card key={index} className="glass-effect border-l-4 border-l-primary h-fit">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Reference Script #{index + 1}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Basic Stats */}
                        <div className="grid grid-cols-3 gap-4 p-3 bg-muted/20 rounded-lg">
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Word Count</div>
                            <div className="font-bold text-lg">{scriptAnalysis.wordCount}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Duration</div>
                            <div className="font-bold text-lg">{scriptAnalysis.estimatedDuration}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Tactics</div>
                            <div className="font-bold text-lg">{scriptAnalysis.tactics.length}</div>
                          </div>
                        </div>

                        {/* Script Structure Analysis */}
                        {scriptAnalysis.structure && (
                          <div className="space-y-3">
                            <h4 className="font-medium text-foreground">Script Structure:</h4>
                            <div className="space-y-2">
                              <div className="p-2 bg-blue-500/10 rounded border-l-2 border-blue-400">
                                <div className="text-xs font-medium text-blue-400">HOOK</div>
                                <div className="text-sm text-muted-foreground">{scriptAnalysis.structure.hook}</div>
                              </div>
                              <div className="p-2 bg-red-500/10 rounded border-l-2 border-red-400">
                                <div className="text-xs font-medium text-red-400">PROBLEM</div>
                                <div className="text-sm text-muted-foreground">{scriptAnalysis.structure.problem}</div>
                              </div>
                              <div className="p-2 bg-green-500/10 rounded border-l-2 border-green-400">
                                <div className="text-xs font-medium text-green-400">SOLUTION</div>
                                <div className="text-sm text-muted-foreground">{scriptAnalysis.structure.solution}</div>
                              </div>
                              <div className="p-2 bg-purple-500/10 rounded border-l-2 border-purple-400">
                                <div className="text-xs font-medium text-purple-400">CALL TO ACTION</div>
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
                            <h4 className="font-medium text-foreground">Hero's Journey Elements:</h4>
                            <div className="space-y-2">
                              {scriptAnalysis.heroJourneyElements.map((element: any, elemIndex: number) => (
                                <div key={elemIndex} className="p-2 border rounded bg-yellow-500/10 border-yellow-500/30">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-yellow-400">{element.stage}</span>
                                    <span className="text-xs text-yellow-500">{element.timestamp}</span>
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
                            <div className="flex flex-wrap gap-1">
                              {scriptAnalysis.emotionalTone.map((tone: string, toneIndex: number) => (
                                <Badge key={toneIndex} variant="outline" className="text-xs bg-pink-500/10 text-pink-400 border-pink-500/30">
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
              <Card className="glass-effect border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    Synthesized Tactics ({analysis.synthesizedTactics.length} Found)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {analysis.synthesizedTactics.map((tactic: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg bg-muted/20">
                        <div className="flex items-center justify-between mb-2">
                          <ClickableTactic 
                            name={tactic.name} 
                            currentStep={currentStep} 
                            analysis={analysis}
                            generatedScript={generatedScript}
                            scriptInput={scriptInput}
                            videoFormat={videoFormat}
                          >
                            <span className="font-medium">{tactic.name}</span>
                          </ClickableTactic>
                          <Badge variant="outline">{tactic.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{tactic.description}</p>
                      </div>
                    ))}
                  </div>
                  {analysis.insights && analysis.insights.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Key Insights:</h4>
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
                  className={`${getButtonColor()} text-white px-6 py-2 border border-black`}
                >
                  {getButtonText()}
                  {activeTab === 'generate' ? <Zap className="w-4 h-4 ml-2" /> : <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="generate" className="mt-6 space-y-6">
              {/* Content Style Selector */}
              <ContentStyleSelector
                detectedStyles={analysis.detectedStyles || []}
                selectedStyle={selectedStyle}
                onStyleSelect={setSelectedStyle}
                format={videoFormat?.format || 'long'}
              />
              
              {/* Generate Card */}
              <Card className="glass-effect border-border/50">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Zap className="w-6 h-6 text-primary" />
                    Ready to Generate Your Script
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    <div className="grid grid-cols-2 gap-6 max-w-md mx-auto mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{analysis.synthesizedTactics.length}</div>
                        <div className="text-sm text-muted-foreground">Tactics Ready</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-accent">4</div>
                        <div className="text-sm text-muted-foreground">Sections Planned</div>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-6">
                      Your script will incorporate the most effective tactics from your reference scripts, 
                      structured for maximum engagement and conversion.
                    </p>
                  </div>
                  <Button onClick={handleGenerateScript} size="lg" className="btn-futuristic text-white">
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
