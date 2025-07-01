import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Brain, Zap, Target, BarChart3, Clock, ArrowRight } from 'lucide-react';
import { ClickableTactic } from './ClickableTactic';

interface ScriptAnalyzerProps {
  analysis: any;
  onGenerate: () => void;
}

export const ScriptAnalyzer: React.FC<ScriptAnalyzerProps> = ({ analysis, onGenerate }) => {
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
          <Tabs defaultValue="analysis" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="synthesis">Synthesis</TabsTrigger>
              <TabsTrigger value="blueprint">Blueprint</TabsTrigger>
              <TabsTrigger value="generate">Generate</TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                {analysis.scriptAnalyses.map((scriptAnalysis: any, index: number) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        Reference Script #{index + 1}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Word Count</span>
                          <span>{scriptAnalysis.wordCount}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Est. Duration</span>
                          <span>{scriptAnalysis.estimatedDuration}m</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Tactics Detected</span>
                          <span>{scriptAnalysis.tactics.length}</span>
                        </div>
                        <Progress value={Math.min(85, scriptAnalysis.tactics.length * 10)} className="h-2" />
                        <div className="flex flex-wrap gap-2">
                          {scriptAnalysis.tactics.slice(0, 5).map((tactic: any, tacticIndex: number) => (
                            <Badge key={tacticIndex} className={getTacticColor(tactic.name)}>
                              {tactic.name}
                            </Badge>
                          ))}
                        </div>
                        {scriptAnalysis.emotionalTone.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Emotional Tone:</p>
                            <div className="flex flex-wrap gap-1">
                              {scriptAnalysis.emotionalTone.map((tone: string, toneIndex: number) => (
                                <Badge key={toneIndex} variant="outline" className="text-xs">
                                  {tone}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Next Step Button for Analysis Tab */}
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={onGenerate}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
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
                          <ClickableTactic name={tactic.name}>
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
              
              {/* Next Step Button for Synthesis Tab */}
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={onGenerate}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
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
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-medium">{section.name}</h4>
                            <p className="text-sm text-gray-600">{section.duration}</p>
                            <p className="text-xs text-gray-500">{section.wordCount} words</p>
                            <p className="text-xs text-gray-400">{section.purpose}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {section.tactics?.map((tactic: string, tacticIndex: number) => (
                            <Badge key={tacticIndex} variant="secondary" className="text-xs">
                              {tactic}
                            </Badge>
                          ))}
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
              
              {/* Next Step Button for Blueprint Tab */}
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={onGenerate}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
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
                    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{analysis.synthesizedTactics.length}</div>
                        <div className="text-sm text-gray-600">Tactics Ready</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{analysis.blueprint?.sections?.length || 0}</div>
                        <div className="text-sm text-gray-600">Sections Planned</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {Math.round((analysis.synthesizedTactics.length / 10) * 100)}%
                        </div>
                        <div className="text-sm text-gray-600">Confidence Score</div>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-6">
                      Your script will incorporate the most effective tactics from your reference scripts, 
                      structured for maximum engagement and conversion.
                    </p>
                  </div>
                  <Button onClick={onGenerate} size="lg" className="px-8">
                    <Zap className="w-5 h-5 mr-2" />
                    Generate Script
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>
              
              {/* Generate Script Button for Generate Tab */}
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={onGenerate}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Script
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
