import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Copy, Download, RefreshCw, Lightbulb, Map, FileText, ArrowLeft, Eye, Save, Languages, Home, Target, AlertCircle } from 'lucide-react';
// Simple word count functions
const getWordCount = (text: string): number => {
  return text.split(/\s+/).filter(word => word.length > 0).length;
};

const getWordCountStatus = (text: string) => {
  const count = getWordCount(text);
  return {
    count,
    displayText: `${count.toLocaleString()} words`,
    badgeVariant: 'outline',
    badgeClassName: ''
  };
};
import { TacticMapper } from './TacticMapper';
import { ScriptImprovement } from './ScriptImprovement';
import { ScriptTranslator } from './ScriptTranslator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import UserMenu from './UserMenu';

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
  const navigate = useNavigate();

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

    const wordCount = editedScript.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    if (wordCount === 0) {
      toast({
        title: "Empty Script",
        description: "Cannot save an empty script",
        variant: "destructive"
      });
      return;
    }

    if (wordCount > 30000) {
      toast({
        title: "Script Too Long",
        description: `Your script has ${wordCount} words. Please reduce it to 30,000 words or less before saving.`,
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      // Use the user ID from the custom auth system
      if (!user?.id) {
        throw new Error('No valid user found');
      }
      
      // Check for duplicate titles
      const { data: existingScripts, error: checkError } = await supabase
        .from('saved_scripts')
        .select('title')
        .eq('user_id', user.id)
        .eq('title', saveTitle.trim());

      if (checkError) {
        console.error('Error checking for duplicates:', checkError);
        throw checkError;
      }

      let finalTitle = saveTitle.trim();
      if (existingScripts && existingScripts.length > 0) {
        const timestamp = new Date().toLocaleDateString();
        finalTitle = `${saveTitle.trim()} (${timestamp})`;
      }
      
      const { error } = await supabase
        .from('saved_scripts')
        .insert({
          user_id: user.id,
          title: finalTitle,
          content: editedScript.trim(),
          word_count: wordCount,
          language: 'en',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast({
        title: "Script Saved Successfully!",
        description: `"${finalTitle}" has been saved with ${wordCount} words`
      });
      setSaveTitle('');
    } catch (error) {
      console.error('Error saving script:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Save Failed",
        description: `Could not save script: ${errorMessage}. Please try again.`,
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
    <div className="min-h-screen w-full bg-background">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="space-y-6">
          <Card className="shadow-xl border-0 glass-effect">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-6 h-6 text-accent" />
                <span className="text-xl font-semibold">Your Script is Ready!</span>
              </div>
              {improvedVersions.length > 0 && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge variant="secondary">{improvedVersions.length} improvement{improvedVersions.length > 1 ? 's' : ''} applied</Badge>
                </div>
              )}
            </CardHeader>
            <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 glass-effect">
              <TabsTrigger value="script" className="data-[state=active]:bg-primary data-[state=active]:text-white">Generated Script</TabsTrigger>
              <TabsTrigger value="mapping" className="data-[state=active]:bg-primary data-[state=active]:text-white">Synthesized Tactics</TabsTrigger>
              <TabsTrigger value="revisions" className="data-[state=active]:bg-primary data-[state=active]:text-white">Improve Script</TabsTrigger>
              <TabsTrigger value="translate" className="data-[state=active]:bg-primary data-[state=active]:text-white">Translate</TabsTrigger>
              <TabsTrigger value="versions" className="data-[state=active]:bg-primary data-[state=active]:text-white">Versions</TabsTrigger>
              <TabsTrigger value="export" className="data-[state=active]:bg-primary data-[state=active]:text-white">Export & Share</TabsTrigger>
            </TabsList>

            <TabsContent value="script" className="mt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Your Generated Script</h3>
                  <div className="flex gap-2">
                    <Badge variant={getWordCountStatus(editedScript).badgeVariant as any} className={getWordCountStatus(editedScript).badgeClassName}>
                      {getWordCountStatus(editedScript).displayText}
                    </Badge>
                    <Badge variant="outline">~{Math.round(getWordCountStatus(editedScript).count / 140)} minutes</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Textarea
                    value={editedScript}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      // Always allow editing but provide warnings
                      setEditedScript(newValue);
                    }}
                    className="min-h-[500px] font-mono text-sm"
                    placeholder="Your generated script will appear here..."
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={copyToClipboard} variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    {copied ? 'Copied!' : 'Copy Script'}
                  </Button>
                  <Button 
                    onClick={downloadScript} 
                    variant="outline"
                    disabled={editedScript.trim().length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button onClick={() => navigate('/')} variant="outline">
                    <Home className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                  {user && (
                    <div className="flex gap-2 flex-wrap">
                      <Input
                        placeholder="Enter title to save..."
                        value={saveTitle}
                        onChange={(e) => setSaveTitle(e.target.value)}
                        className="w-48 min-w-[200px]"
                        maxLength={100}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && saveTitle.trim() && !isSaving) {
                            saveScript();
                          }
                        }}
                      />
                      <Button 
                        onClick={saveScript} 
                        disabled={isSaving || !saveTitle.trim()}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save Script'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="mapping" className="mt-6">
              <Card className="glass-effect border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Synthesized Tactics ({tactics?.length || 0} Found)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!tactics || tactics.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No tactics detected in the generated script. Try analyzing the script or regenerating with more specific content.
                    </p>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {tactics?.map((tactic, index) => (
                        <div key={index} className="p-4 border border-border rounded-lg bg-muted/20">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-primary mb-1">{tactic.name}</h4>
                              <Badge variant="outline" className="text-xs">{tactic.category}</Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {tactic.description}
                          </p>
                          {tactic.examples && tactic.examples.length > 0 && (
                            <div className="mt-3 p-2 bg-white/60 rounded text-xs text-gray-500">
                              <strong>Example:</strong> {tactic.examples[0]}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {tactics.length > 0 && (
                    <div className="mt-6 pt-4 border-t">
                      <h4 className="font-medium mb-3 text-gray-700">Key Insights:</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          Most used category: {(() => {
                            const categoryCount = tactics.reduce((acc, tactic) => {
                              acc[tactic.category] = (acc[tactic.category] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>);
                            const sortedCategories = Object.entries(categoryCount).sort((a, b) => Number(b[1]) - Number(a[1]));
                            return sortedCategories[0]?.[0] || 'N/A';
                          })()}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          Script optimized for {tactics.length > 3 ? 'high' : tactics.length > 1 ? 'medium' : 'basic'} engagement
                        </div>
                      </div>
                    </div>
                  )}
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
              <Card className="glass-effect border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Script Versions & Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {improvedVersions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No improvements applied yet. Use the "Improve Script" tab to enhance your script.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 border border-border rounded-lg bg-muted/20">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-foreground">Original Version</h4>
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
                        <p className="text-sm text-muted-foreground">The initial generated script</p>
                      </div>
                      
                      {improvedVersions.map((version, index) => (
                        <div key={index} className="p-4 border border-border rounded-lg bg-card">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-foreground">{version.improvement} Applied</h4>
                              <p className="text-xs text-muted-foreground">
                                {version.timestamp.toLocaleString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
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
                          <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
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
                  <div className="mt-6 pt-6 border-t space-y-3">
                    <Button onClick={onRestart} variant="outline" className="w-full">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Create Another Script
                    </Button>
                    <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                      <Home className="w-4 h-4 mr-2" />
                      Back to Home
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
};
