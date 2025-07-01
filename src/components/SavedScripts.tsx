
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Save, FileText, Trash2, Eye, Calendar, Hash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthProvider';

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

interface SavedScriptsProps {
  currentScript?: string;
  onLoadScript?: (script: string, title: string) => void;
}

export const SavedScripts: React.FC<SavedScriptsProps> = ({ 
  currentScript, 
  onLoadScript 
}) => {
  const [savedScripts, setSavedScripts] = useState<SavedScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveIndustry, setSaveIndustry] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedScript, setSelectedScript] = useState<SavedScript | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

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

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save scripts",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('saved_scripts')
        .insert({
          user_id: user.id,
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
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Please log in to save and manage scripts</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          My Saved Scripts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Save Current Script */}
        {currentScript && (
          <div className="space-y-3 p-3 border rounded-lg bg-blue-50">
            <h3 className="font-medium text-sm">Save Current Script</h3>
            <div className="space-y-2">
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
              <Button onClick={saveScript} disabled={isSaving} size="sm" className="w-full">
                <Save className="w-3 h-3 mr-1" />
                {isSaving ? 'Saving...' : 'Save Script'}
              </Button>
            </div>
          </div>
        )}

        {/* Saved Scripts List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4">Loading scripts...</div>
          ) : savedScripts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No saved scripts yet</p>
            </div>
          ) : (
            savedScripts.map((script) => (
              <Card key={script.id} className="border border-gray-200">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{script.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
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

                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="w-3 h-3 mr-1" />
                            View
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
                            {onLoadScript && (
                              <Button onClick={() => onLoadScript(script.content, script.title)}>
                                Load Script
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              onClick={() => navigator.clipboard.writeText(script.content)}
                            >
                              Copy
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {onLoadScript && (
                        <Button
                          size="sm"
                          onClick={() => onLoadScript(script.content, script.title)}
                          className="flex-1"
                        >
                          Load
                        </Button>
                      )}

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
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
