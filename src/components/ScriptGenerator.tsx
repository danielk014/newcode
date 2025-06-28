
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Copy, Download, RefreshCw, Lightbulb, Map, FileText } from 'lucide-react';
import { TacticMapper } from './TacticMapper';

interface ScriptGeneratorProps {
  script: string;
  tactics: any[];
  onRestart: () => void;
}

export const ScriptGenerator: React.FC<ScriptGeneratorProps> = ({ script, tactics, onRestart }) => {
  const [editedScript, setEditedScript] = useState(script);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(editedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadScript = () => {
    const blob = new Blob([editedScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-script.txt';
    a.click();
  };

  const tacticMap = [
    { tactic: "Pattern Interrupt", location: "Hook", timestamp: "0:00-0:05" },
    { tactic: "Curiosity Gap", location: "Hook", timestamp: "0:05-0:15" },
    { tactic: "Pain Point", location: "Problem", timestamp: "0:15-0:30" },
    { tactic: "Relatability", location: "Problem", timestamp: "0:30-0:45" },
    { tactic: "Authority", location: "Solution", timestamp: "0:45-1:15" },
    { tactic: "Social Proof", location: "Solution", timestamp: "1:15-1:45" },
    { tactic: "Future Pacing", location: "Details", timestamp: "2:00-3:00" },
    { tactic: "Scarcity", location: "CTA", timestamp: "4:00-4:30" }
  ];

  const revisionSuggestions = [
    {
      title: "Strengthen the Hook",
      description: "Consider adding a specific statistic or surprising fact in the first 10 seconds",
      impact: "High"
    },
    {
      title: "Add Personal Story",
      description: "Include a brief personal anecdote in the problem section for better connection",
      impact: "Medium"
    },
    {
      title: "Clarify Value Proposition",
      description: "Make the unique benefit more explicit in the solution introduction",
      impact: "High"
    },
    {
      title: "Enhance CTA Urgency",
      description: "Add time-sensitive language to increase immediate action",
      impact: "Medium"
    },
    {
      title: "Include Social Validation",
      description: "Add testimonial snippets or success metrics throughout",
      impact: "High"
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Your Script is Ready!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="script" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="script">Generated Script</TabsTrigger>
              <TabsTrigger value="mapping">Tactic Mapping</TabsTrigger>
              <TabsTrigger value="revisions">Suggested Revisions</TabsTrigger>
              <TabsTrigger value="export">Export & Share</TabsTrigger>
            </TabsList>

            <TabsContent value="script" className="mt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Your Generated Script</h3>
                  <div className="flex gap-2">
                    <Badge variant="outline">~1,400 words</Badge>
                    <Badge variant="outline">~5 minutes</Badge>
                  </div>
                </div>
                <Textarea
                  value={editedScript}
                  onChange={(e) => setEditedScript(e.target.value)}
                  className="min-h-[500px] font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button onClick={copyToClipboard} variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    {copied ? 'Copied!' : 'Copy Script'}
                  </Button>
                  <Button onClick={downloadScript} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="mapping" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="w-5 h-5 text-blue-600" />
                    Tactic-to-Script Mapping
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tacticMap.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">{item.tactic}</Badge>
                          <span className="text-sm text-gray-600">{item.location}</span>
                        </div>
                        <Badge variant="outline">{item.timestamp}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revisions" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    Suggested Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {revisionSuggestions.map((suggestion, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{suggestion.title}</h4>
                          <Badge variant={suggestion.impact === 'High' ? 'destructive' : 'secondary'}>
                            {suggestion.impact} Impact
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{suggestion.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="export" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    Export & Share Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Button onClick={downloadScript} className="h-auto p-4 flex-col items-start">
                      <Download className="w-6 h-6 mb-2" />
                      <div className="text-left">
                        <div className="font-medium">Download as Text</div>
                        <div className="text-sm opacity-70">Plain text file for easy editing</div>
                      </div>
                    </Button>
                    <Button onClick={copyToClipboard} variant="outline" className="h-auto p-4 flex-col items-start">
                      <Copy className="w-6 h-6 mb-2" />
                      <div className="text-left">
                        <div className="font-medium">Copy to Clipboard</div>
                        <div className="text-sm opacity-70">Paste directly into your editor</div>
                      </div>
                    </Button>
                  </div>
                  <div className="mt-6 pt-6 border-t">
                    <Button onClick={onRestart} variant="outline" className="w-full">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Create Another Script
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
