import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BookOpen, 
  Plus, 
  Target, 
  Brain, 
  FileText, 
  Save, 
  RefreshCw,
  CheckCircle,
  Trash2
} from 'lucide-react';
import { ScriptInputPanel } from './ScriptInputPanel';
import { ScriptAnalysisProgress } from './ScriptAnalysisProgress';
import { 
  referenceScriptEngine, 
  ReferenceScriptProfile,
  ReferenceScriptConsistencyEngine 
} from '@/utils/referenceScriptConsistency';
import { useToast } from '@/hooks/use-toast';

interface ReferenceScriptManagerProps {
  onProfileSelected?: (profile: ReferenceScriptProfile) => void;
  onScriptGenerated?: (script: string, profile: ReferenceScriptProfile) => void;
}

interface AnalysisStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  progress: number;
}

export const ReferenceScriptManager: React.FC<ReferenceScriptManagerProps> = ({
  onProfileSelected,
  onScriptGenerated
}) => {
  const [activeTab, setActiveTab] = useState('create');
  const [topic, setTopic] = useState('');
  const [referenceScripts, setReferenceScripts] = useState<string[]>(['']);
  const [selectedProfile, setSelectedProfile] = useState<ReferenceScriptProfile | null>(null);
  const [profiles, setProfiles] = useState<ReferenceScriptProfile[]>([]);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  
  // Analysis progress tracking
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([
    { id: 'analyzing-references', label: 'Analyzing Reference Scripts', status: 'pending', progress: 0 },
    { id: 'extracting-patterns', label: 'Extracting Style Patterns', status: 'pending', progress: 0 },
    { id: 'creating-profile', label: 'Creating Reference Profile', status: 'pending', progress: 0 }
  ]);
  
  const [overallProgress, setOverallProgress] = useState(0);
  const { toast } = useToast();

  const updateProgress = useCallback((stepId: string, progress: number) => {
    setAnalysisSteps(prev => prev.map(step => {
      if (step.id === stepId) {
        const newStatus = progress === 0 ? 'active' : progress === 100 ? 'completed' : 'active';
        return { ...step, status: newStatus, progress };
      }
      return step;
    }));

    // Update overall progress
    const stepWeights = { 'analyzing-references': 40, 'extracting-patterns': 30, 'creating-profile': 30 };
    const totalProgress = analysisSteps.reduce((sum, step) => {
      const weight = stepWeights[step.id as keyof typeof stepWeights] || 0;
      return sum + (step.progress * weight / 100);
    }, 0);
    setOverallProgress(totalProgress);
  }, [analysisSteps]);

  const addReferenceScript = () => {
    if (referenceScripts.length < 5) {
      setReferenceScripts([...referenceScripts, '']);
    }
  };

  const removeReferenceScript = (index: number) => {
    if (referenceScripts.length > 1) {
      setReferenceScripts(referenceScripts.filter((_, i) => i !== index));
    }
  };

  const updateReferenceScript = (index: number, value: string) => {
    const updated = [...referenceScripts];
    updated[index] = value;
    setReferenceScripts(updated);
  };

  const createProfile = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your reference profile",
        variant: "destructive"
      });
      return;
    }

    const validScripts = referenceScripts.filter(script => 
      script.trim().length > 100 && 
      script.trim().split(/\\s+/).length <= 20000
    );

    if (validScripts.length === 0) {
      toast({
        title: "Reference Scripts Required",
        description: "Please provide at least one reference script with more than 100 words",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingProfile(true);
    setOverallProgress(0);
    
    // Reset all steps
    setAnalysisSteps(prev => prev.map(step => ({ ...step, status: 'pending', progress: 0 })));

    try {
      const profile = referenceScriptEngine.createReferenceProfile(
        topic.trim(),
        validScripts,
        (step: string, progress: number) => {
          updateProgress(step, progress);
        }
      );

      // Mark all steps as completed
      setAnalysisSteps(prev => prev.map(step => ({ ...step, status: 'completed', progress: 100 })));
      setOverallProgress(100);

      setProfiles([...profiles, profile]);
      setSelectedProfile(profile);
      onProfileSelected?.(profile);

      toast({
        title: "Profile Created Successfully!",
        description: `Reference profile for "${topic}" has been created with ${validScripts.length} scripts`,
      });

      // Switch to generate tab
      setActiveTab('generate');
      
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: "Profile Creation Failed",
        description: "An error occurred while creating the reference profile",
        variant: "destructive"
      });
    } finally {
      setIsCreatingProfile(false);
    }
  };

  const generateConsistentScript = async () => {
    if (!selectedProfile) {
      toast({
        title: "No Profile Selected",
        description: "Please select a reference profile first",
        variant: "destructive"
      });
      return;
    }

    if (!userPrompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt for script generation",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // This is a simplified version - in a real implementation, 
      // you would integrate with your existing script generation system
      const baseScript = `Generated script based on prompt: "${userPrompt}"\n\nThis script follows the patterns from your "${selectedProfile.topic}" reference profile, incorporating the consistent tactics and style you've established.`;
      
      const consistentScript = referenceScriptEngine.generateConsistentScript(
        selectedProfile,
        userPrompt,
        baseScript
      );

      setGeneratedScript(consistentScript);
      onScriptGenerated?.(consistentScript, selectedProfile);

      toast({
        title: "Consistent Script Generated!",
        description: `New script created following your "${selectedProfile.topic}" profile patterns`,
      });

    } catch (error) {
      console.error('Error generating script:', error);
      toast({
        title: "Generation Failed",
        description: "An error occurred while generating the script",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const loadExistingProfiles = () => {
    const existingProfiles = referenceScriptEngine.listProfiles();
    setProfiles(existingProfiles);
  };

  React.useEffect(() => {
    loadExistingProfiles();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="shadow-xl border-0 glass-effect">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <BookOpen className="w-6 h-6 text-primary" />
            Reference Script Consistency Manager
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Create reference profiles from your best-performing scripts to maintain consistency across topics
          </p>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 glass-effect">
              <TabsTrigger value="create">Create Profile</TabsTrigger>
              <TabsTrigger value="manage">Manage Profiles</TabsTrigger>
              <TabsTrigger value="generate">Generate Consistent Script</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="mt-6 space-y-6">
              {isCreatingProfile ? (
                <ScriptAnalysisProgress
                  steps={analysisSteps}
                  overallProgress={overallProgress}
                  currentStep={analysisSteps.find(s => s.status === 'active')?.id || ''}
                  scriptCount={referenceScripts.filter(s => s.trim().length > 100).length}
                />
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic/Category</Label>
                    <Input
                      id="topic"
                      placeholder="e.g., Fitness, Business, Education, Technology..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      maxLength={50}
                    />
                    <p className="text-xs text-muted-foreground">
                      Give your reference profile a descriptive topic name
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Reference Scripts</Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Add 1-5 reference scripts. One high-quality script is sufficient to create a profile.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {referenceScripts.filter(s => s.trim().length > 100).length} valid script{referenceScripts.filter(s => s.trim().length > 100).length !== 1 ? 's' : ''}
                        </Badge>
                        {referenceScripts.length < 5 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={addReferenceScript}
                            disabled={referenceScripts.length >= 5}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add More
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {referenceScripts.map((script, index) => (
                        <ScriptInputPanel
                          key={index}
                          index={index}
                          value={script}
                          onChange={(value) => updateReferenceScript(index, value)}
                          onRemove={() => removeReferenceScript(index)}
                          canRemove={referenceScripts.length > 1}
                        />
                      ))}
                    </div>

                    <div className="pt-4 border-t space-y-3">
                      {referenceScripts.filter(s => s.trim().length > 100).length === 1 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>One script is sufficient to create a comprehensive profile</span>
                        </div>
                      )}
                      <Button 
                        onClick={createProfile} 
                        disabled={!topic.trim() || referenceScripts.filter(s => s.trim().length > 100).length === 0}
                        className="w-full"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Create Reference Profile
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="manage" className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Existing Profiles</h3>
                <Button variant="outline" size="sm" onClick={loadExistingProfiles}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Refresh
                </Button>
              </div>

              {profiles.length === 0 ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <h4 className="font-medium mb-2">No Reference Profiles</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create your first reference profile to get started
                    </p>
                    <Button onClick={() => setActiveTab('create')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Profile
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {profiles.map((profile) => (
                    <Card key={profile.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-base">{profile.topic}</h4>
                            <div className="flex items-center gap-4 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {profile.commonTactics.length} tactics
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                ~{Math.round(profile.averageWordCount)} words avg
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {profile.emotionalTone.join(', ') || 'Neutral tone'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Created {profile.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedProfile(profile);
                                setActiveTab('generate');
                              }}
                            >
                              <Target className="w-4 h-4 mr-1" />
                              Use
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // In a real implementation, you'd confirm before deleting
                                const updatedProfiles = profiles.filter(p => p.id !== profile.id);
                                setProfiles(updatedProfiles);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="generate" className="mt-6 space-y-6">
              {!selectedProfile ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <h4 className="font-medium mb-2">No Profile Selected</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select a reference profile to generate consistent scripts
                    </p>
                    <Button onClick={() => setActiveTab('manage')}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Select Profile
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card className="bg-muted/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <h4 className="font-medium">Using Profile: {selectedProfile.topic}</h4>
                          <p className="text-sm text-muted-foreground">
                            {selectedProfile.commonTactics.length} tactics • {selectedProfile.emotionalTone.join(', ')} tone
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="prompt">Script Generation Prompt</Label>
                      <Textarea
                        id="prompt"
                        placeholder="Describe what you want your script to be about..."
                        value={userPrompt}
                        onChange={(e) => setUserPrompt(e.target.value)}
                        className="min-h-[100px] mt-2"
                      />
                    </div>

                    <Button 
                      onClick={generateConsistentScript}
                      disabled={!userPrompt.trim() || isGenerating}
                      className="w-full"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      {isGenerating ? 'Generating...' : 'Generate Consistent Script'}
                    </Button>

                    {generatedScript && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Generated Consistent Script</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Textarea
                            value={generatedScript}
                            readOnly
                            className="min-h-[300px] font-mono text-sm"
                          />
                          <div className="flex gap-2 mt-4">
                            <Button
                              variant="outline"
                              onClick={() => navigator.clipboard.writeText(generatedScript)}
                            >
                              Copy Script
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                const blob = new Blob([generatedScript], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${selectedProfile.topic}-script.txt`;
                                a.click();
                              }}
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};