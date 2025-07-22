import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Calendar, Hash, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthProvider';
import { Link, useLocation } from 'react-router-dom';

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
  onLoadScript 
}) => {
  const [savedScripts, setSavedScripts] = useState<SavedScript[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const location = useLocation();

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
        .order('created_at', { ascending: false })
        .limit(5); // Only show recent 5 scripts

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
    <Card className="glass-effect border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Recent Scripts
          </div>
          <Link 
            to="/saved-scripts" 
            state={{ from: location.pathname }}
          >
            <Button variant="outline" size="sm">
              <ExternalLink className="w-3 h-3 mr-1" />
              View All
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 border rounded-lg space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : savedScripts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No saved scripts yet</p>
              <Link 
                to="/saved-scripts" 
                state={{ from: location.pathname }}
              >
                <Button variant="outline" size="sm" className="mt-2">
                  Create Your First Script
                </Button>
              </Link>
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
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      {onLoadScript && (
                        <Button
                          size="sm"
                          onClick={() => onLoadScript(script.content, script.title)}
                          className="w-full"
                        >
                          Load Script
                        </Button>
                      )}
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
