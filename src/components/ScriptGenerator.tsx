import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  Copy,
  Download,
  RefreshCw,
  Map as MapIcon,
  FileText,
  ArrowLeft,
  Save,
} from 'lucide-react';
import { ScriptImprovement } from './ScriptImprovement';
import { ScriptTranslator } from './ScriptTranslator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

/**
 * A global header with logo / nav already exists higher in the layout, so we intentionally avoid
 * rendering those elements again in this component to prevent visual duplication (see screenshot).
 */

/**
 * Fallback tactic list used when the parent component does not provide one.
 */
const DEFAULT_TACTICS = [
  { tactic: 'Pattern Interrupt', location: 'Hook', timestamp: '0:00-0:05' },
  { tactic: 'Curiosity Gap', location: 'Hook', timestamp: '0:05-0:15' },
  { tactic: 'Pain Point', location: 'Problem', timestamp: '0:15-0:30' },
  { tactic: 'Relatability', location: 'Problem', timestamp: '0:30-0:45' },
  { tactic: 'Authority', location: 'Solution', timestamp: '0:45-1:15' },
  { tactic: 'Social Proof', location: 'Solution', timestamp: '1:15-1:45' },
  { tactic: 'Future Pacing', location: 'Details', timestamp: '2:00-3:00' },
  { tactic: 'Scarcity', location: 'CTA', timestamp: '4:00-4:30' },
];

interface TacticItem {
  tactic: string;
  location: string;
  timestamp: string;
}

interface ScriptGeneratorProps {
  /** The initial script text to display */
  script: string;
  /** Optional array of tactics to map to the script */
  tactics?: TacticItem[];
  /** Callback to generate a new script */
  onRestart: () => void;
}

/**
 * ScriptGenerator renders the main UI for editing, improving, translating and exporting a generated script.
 * Duplicate imports, unused variables and repeated logic have been removed/refactored.
 * In addition, duplicated header/nav content (logo, user menu) has been stripped – it's now handled by the page layout.
 */
export const ScriptGenerator: React.FC<ScriptGeneratorProps> = ({ script, tactics, onRestart }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // ─── State ──────────────────────────────────────────────────────────────────
  const [editedScript, setEditedScript] = useState(script);
  const [copied, setCopied] = useState(false);
  const [improvedVersions, setImprovedVersions] = useState<{
    script: string;
    improvement: string;
    timestamp: Date;
    changesSummary: string;
  }[]>([]);
  const [activeTab, setActiveTab] = useState<'script' | 'mapping' | 'revisions' | 'translate' | 'versions' | 'export'>('script');
  const [saveTitle, setSaveTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const wordCount = (text: string): number => text.trim().split(/\s+/).filter(Boolean).length;
  const minuteEstimate = (text: string): number => Math.round(wordCount(text) / 140);

  /** Copies the current script to the clipboard. */
  const copyToClipboard = () => {
    navigator.clipboard.writeText(editedScript).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  /** Downloads the current script as a plain-text file. */
  const downloadScript = () => {
    const blob = new Blob([editedScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${saveTitle || 'generated-script'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /** Persists the current script to Supabase under the logged-in user. */
  const saveScript = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to save scripts',
        variant: 'destructive',
      });
      return;
    }
    if (!saveTitle.trim()) {
      toast({
        title: 'Title Required',
        description: 'Please enter a title for your script',
        variant: 'destructive',
      });
      return;
    }
    setIsSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) throw new Error('No valid session found');

      const { error } = await supabase.from('saved_scripts').insert({
        user_id: session.user.id,
        title: saveTitle.trim(),
        content: editedScript.trim(),
        word_count: wordCount(editedScript),
        language: 'en',
      });

      if (error) throw error;

      toast({ title: 'Script Saved!', description: 'Your script has been saved successfully' });
      setSaveTitle('');
    } catch (error) {
      console.error('Error saving script:', error);
      toast({ title: 'Save Failed', description: 'Could not save script. Please try again.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  /** Adds a new improved or translated version to the history */
  const recordVersion = (newScript: string, label: string, summary: string) => {
    setImprovedVersions(prev => [{ script: newScript, improvement: label, timestamp: new Date(), changesSummary: summary }, ...prev]);
    setEditedScript(newScript);
    setActiveTab('script');
  };

  // ─── Callbacks passed to child components ───────────────────────────────────
  const handleImprovedScript = (improvedScript: string, improvementType: string, changesSummary: string) =>
    recordVersion(improvedScript, improvementType, changesSummary);

  const handleTranslatedScript = (translatedScript: string, language: string) =>
    recordVersion(
      translatedScript,
      `Translated to ${language}`,
      `Script translated from original language to ${language}. All content and structure preserved while adapting for ${language} audience.`,
    );

  // ─── Derived Data ───────────────────────────────────────────────────────────
  const tacticMap = tactics && tactics.length > 0 ? tactics : DEFAULT_TACTICS;

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="space-y-6">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            {/* ── Header ───────────────────────────────────────────── */}
            <CardHeader className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="text-xl font-semibold">Your Script is Ready!</span>
              </div>
              {improvedVersions.length > 0 && (
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="secondary">{improvedVersions.length} improvement{improvedVersions.length > 1 ? 's' : ''} applied</Badge>
                </div>
              )}
            </CardHeader>

            {/* ── Body ─────────────────────────────────────────────── */}
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* ── Tab List ─────────────────────────────────────── */}
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="script">Generated Script</TabsTrigger>
                  <TabsTrigger value="mapping">Tactic Mapping</TabsTrigger>
                  <TabsTrigger value="revisions">Improve Script</TabsTrigger>
                  <TabsTrigger value="translate">Translate</TabsTrigger>
                  <TabsTrigger value="versions">Versions</TabsTrigger>
                  <TabsTrigger value="export">Export & Share</TabsTrigger>
                </TabsList>

                {/* ── Generated Script Tab ─────────────────────────── */}
                <TabsContent value="
