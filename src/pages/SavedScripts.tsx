import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Save, FileText, Trash2, Eye, Calendar, Hash, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';
import { Link, useNavigate, useLocation } from 'react-router-dom';

interface SavedScript {
  id: string;
  title: string;
  content: string;
  industry?: string;
  language: string;
  word_count?: number;
  sentiment_score?: any;
  created_at: string;
}

const SavedScriptsPage = () => {
  const [savedScripts, setSavedScripts] = useState<SavedScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveIndustry, setSaveIndustry] = useState('');
  const [currentScript, setCurrentScript] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the referrer from location state or default to home
  const handleGoBack = () => {
    const from = location.state?.from || '/';
    navigate(from);
  };

  useEffect(() => {
    if (user) {
      fetchSavedScripts();
    }
  }, [user]);

  const fetchSavedScripts = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_scripts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedScripts(data || []);
    } catch (error) {
      console.error('Error fetching saved scripts:', error);
      toast({
        title: "Loading Error",
        description: "Could not load saved scripts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveScript = async () => {
    if (!currentScript?.trim() || !saveTitle.trim()) {
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
          content: currentScript,
          industry: saveIndustry || null,
          language: 'en',
          word_count: currentScript.split(' ').length
        });

      if (error) throw error;

      toast({
        title: "Script Saved!",
        description: `"${saveTitle}" has been saved to your library`
      });

      setSaveTitle('');
      setSaveIndustry('');
      setCurrentScript('');
      fetchSavedScripts();
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

  const deleteScript = async (id: string, title: string) => {
    try {
      const { error } = await supabase
        .from('saved_scripts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Script Deleted",
        description: `"${title}" has been removed`
      });

      fetchSavedScripts();
    } catch (error) {
      console.error('Error deleting script:', error);
      toast({
        title: "Delete Failed",
        description: "Could not delete script",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="glass-effect border-border/50">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
              <p className="text-muted-foreground mb-6">Please log in to view and manage your saved scripts</p>
              <Link to="/">
                <Button>Go Back to Home</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full gradient-bg-subtle p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleGoBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Script Generator
          </Button>
          <div>
            <h1 className="text-3xl font-bold">My Saved Scripts</h1>
            <p className="text-muted-foreground">Manage your script library</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Save New Script Section */}
          <div className="lg:col-span-1">
            <Card className="glass-effect border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="w-5 h-5 text-primary" />
                  Save New Script
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
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
                  <Textarea
                    placeholder="Paste your script content here..."
                    value={currentScript}
                    onChange={(e) => setCurrentScript(e.target.value)}
                    className="min-h-[200px]"
                  />
                  <Button onClick={saveScript} disabled={isSaving} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Script'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Saved Scripts List */}
          <div className="lg:col-span-2">
            <Card className="glass-effect border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Your Scripts ({savedScripts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading scripts...</div>
                ) : savedScripts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No saved scripts yet</h3>
                    <p>Save your first script using the form on the left</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {savedScripts.map((script) => (
                      <Card key={script.id} className="border border-border bg-card/50">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{script.title}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {formatDate(script.created_at)}
                                  </Badge>
                                  {script.word_count && (
                                    <Badge variant="outline" className="text-xs">
                                      <Hash className="w-3 h-3 mr-1" />
                                      {script.word_count} words
                                    </Badge>
                                  )}
                                  {script.industry && (
                                    <Badge variant="secondary" className="text-xs">
                                      {script.industry}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline" className="flex-1">
                                    <Eye className="w-3 h-3 mr-1" />
                                    View & Edit
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>{script.title}</DialogTitle>
                                  </DialogHeader>
                                  <Textarea
                                    value={script.content}
                                    readOnly
                                    className="min-h-[400px] text-sm"
                                  />
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="outline" 
                                      onClick={() => navigator.clipboard.writeText(script.content)}
                                    >
                                      Copy to Clipboard
                                    </Button>
                                    <Button 
                                      onClick={() => {
                                        setCurrentScript(script.content);
                                        setSaveTitle(`${script.title} - Copy`);
                                        setSaveIndustry(script.industry || '');
                                      }}
                                    >
                                      Duplicate Script
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteScript(script.id, script.title)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedScriptsPage;
