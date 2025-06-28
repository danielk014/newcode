
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Brain, Zap, Target, BarChart3, Clock, ArrowRight } from 'lucide-react';

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
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      Reference Script #1
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Tactics Detected</span>
                        <span>{analysis.script1Tactics.length}</span>
                      </div>
                      <Progress value={85} className="h-2" />
                      <div className="flex flex-wrap gap-2">
                        {analysis.script1Tactics.map((tactic: any, index: number) => (
                          <Badge key={index} className={getTacticColor(tactic.name)}>
                            {tactic.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-green-600" />
                      Reference Script #2
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Tactics Detected</span>
                        <span>{analysis.script2Tactics.length}</span>
                      </div>
                      <Progress value={78} className="h-2" />
                      <div className="flex flex-wrap gap-2">
                        {analysis.script2Tactics.map((tactic: any, index: number) => (
                          <Badge key={index} className={getTacticColor(tactic.name)}>
                            {tactic.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="synthesis" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    Synthesized Tactics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {analysis.synthesizedTactics.map((tactic: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{tactic.name}</h4>
                          <Badge variant="outline">{tactic.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{tactic.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="blueprint" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    Script Blueprint
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.blueprint.map((section: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-medium">{section.section}</h4>
                            <p className="text-sm text-gray-600">{section.duration}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {section.tactics.map((tactic: string, tacticIndex: number) => (
                            <Badge key={tacticIndex} variant="secondary">
                              {tactic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
                        <div className="text-2xl font-bold text-green-600">{analysis.blueprint.length}</div>
                        <div className="text-sm text-gray-600">Sections Planned</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">92%</div>
                        <div className="text-sm text-gray-600">Confidence Score</div>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-6">
                      Your script will incorporate the most effective tactics from both reference scripts, 
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
