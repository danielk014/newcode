
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Copy, Download, RefreshCw, Lightbulb, Map, FileText, ArrowLeft, Eye, Save, Languages } from 'lucide-react';
import { TacticMapper } from './TacticMapper';
import { ScriptImprovement } from './ScriptImprovement';
import { ScriptTranslator } from './ScriptTranslator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface ScriptGeneratorProps {
  script: string;
  tactics: any[];
  onRestart: () => void;
}

export const ScriptGenerator: React.FC<ScriptGeneratorProps> = ({ script, tactics, onRestart }) => {
  const [editedScript, setEditedScript] = useState(script);
  const [copied, setCopied] = useState(false);
  const [improvedVersions, setImprovedVersions] = useState<Array<{
    script: string; 
    improvement: string; 
    timestamp: Date;
    changesSummary: string;
  }>>([]);
  const [activeTab, setActiveTab] = useState("script");
  const [saveTitle, setSaveTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

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

  const saveScript = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save scripts",
        variant: "destructive"
      });
      return;
    }

    if (!saveTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your script",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const wordCount = editedScript.trim().split(/\s+/).filter(word => word.length > 0).length;
      
      const { error } = await supabase
        .from('saved_scripts')
        .insert({
          user_id: user.id,
          title: saveTitle.trim(),
          content: editedScript.trim(),
          word_count: wordCount,
          language: 'en'
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast({
        title: "Script Saved!",
        description: "Your script has been saved successfully"
      });
      setSaveTitle('');
    } catch (error) {
      console.error('Error saving script:', error);
      toast({
        title: "Save Failed",
        description: "Could not save script. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImprovedScript = (improvedScript: string, improvementType: string, changesSummary: string) => {
    const newImprovedVersion = {
      script: improvedScript,
      improvement: improvementType,
      timestamp: new Date(),
      changesSummary: changesSummary
    };
    setImprovedVersions(prev => [newImprovedVersion, ...prev]);
    setEditedScript(improvedScript);
    setActiveTab("script");
  };

  const loadImprovedVersion = (version: any) => {
    setEditedScript(version.script);
    setActiveTab("script");
  };

  const handleTranslatedScript = (translatedScript: string, language: string) => {
    // Create a version entry for the translation
    const newTranslationVersion = {
      script: translatedScript,
      improvement: `Translated to ${language}`,
      timestamp: new Date(),
      changesSummary: `Script translated from original language to ${language}. All content and structure preserved while adapting for ${language} audience.`
    };
    setImprovedVersions(prev => [newTranslationVersion, ...prev]);
    setEditedScript(translatedScript);
    setActiveTab("script");
    toast({
      title: "Translation Applied",
      description: `Script translated to ${language}`
    });
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

  return (
    <div className="space-y-6">
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Your Script is Ready!
          </CardTitle>
          {improvedVersions.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant="secondary">{improvedVersions.length} improvement{improvedVersions.length > 1 ? 's' : ''} applied</Badge>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="script">Generated Script</TabsTrigger>
              <TabsTrigger value="mapping">Tactic Mapping</TabsTrigger>
              <TabsTrigger value="revisions">Improve Script</TabsTrigger>
              <TabsTrigger value="translate">Translate</TabsTrigger>
              <TabsTrigger value="versions">Versions</TabsTrigger>
              <TabsTrigger value="export">Export & Share</TabsTrigger>
            </TabsList>

            <TabsContent value="script" className="mt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Your Generated Script</h3>
                  <div className="flex gap-2">
                    <Badge variant="outline">~{Math.round(editedScript.split(' ').length)} words</Badge>
                    <Badge variant="outline">~{Math.round(editedScript.split(' ').length / 140)} minutes</Badge>
                  </div>
                </div>
                <Textarea
                  value={editedScript}
                  onChange={(e) => setEditedScript(e.target.value)}
                  className="min-h-[500px] font-mono text-sm"
                />
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={copyToClipboard} variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    {copied ? 'Copied!' : 'Copy Script'}
                  </Button>
                  <Button onClick={downloadScript} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  {user && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter title to save..."
                        value={saveTitle}
                        onChange={(e) => setSaveTitle(e.target.value)}
                        className="w-48"
                      />
                      <Button onClick={saveScript} disabled={isSaving || !saveTitle.trim()}>
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save Script'}
                      </Button>
                    </div>
                  )}
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
              <ScriptImprovement 
                originalScript={editedScript}
                onImprovedScript={handleImprovedScript}
              />
            </TabsContent>

            <TabsContent value="translate" className="mt-6">
              <ScriptTranslator 
                originalScript={editedScript}
                onTranslatedScript={handleTranslatedScript}
              />
            </TabsContent>

            <TabsContent value="versions" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Script Versions & Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {improvedVersions.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No improvements applied yet. Use the "Improve Script" tab to enhance your script.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg bg-blue-50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Original Version</h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditedScript(script);
                              setActiveTab("script");
                            }}
                          >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Load
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600">The initial generated script</p>
                      </div>
                      
                      {improvedVersions.map((version, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{version.improvement} Applied</h4>
                              <p className="text-xs text-gray-500">
                                {version.timestamp.toLocaleString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  alert(`Changes Made:\n\n${version.changesSummary}`);
                                }}
                                title="View what changed"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => loadImprovedVersion(version)}
                              >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Load
                              </Button>
                            </div>
                          </div>
                          <div className="mb-2">
                            <Badge variant="secondary" className="text-xs">
                              Version {improvedVersions.length - index}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            <strong>Changes:</strong> {version.changesSummary.substring(0, 100)}...
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                      <Copy className="w-6 h-4 mb-2" />
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
