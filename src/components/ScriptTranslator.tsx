
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Languages, Loader2, Copy, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ScriptTranslatorProps {
  originalScript: string;
  onTranslatedScript: (translatedScript: string, language: string) => void;
}

const languages = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'tr', name: 'Turkish' },
  { code: 'pl', name: 'Polish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'sv', name: 'Swedish' },
];

export const ScriptTranslator: React.FC<ScriptTranslatorProps> = ({ 
  originalScript, 
  onTranslatedScript 
}) => {
  const [targetLanguage, setTargetLanguage] = useState('');
  const [translatedScript, setTranslatedScript] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  const handleTranslate = async () => {
    if (!targetLanguage) {
      toast({
        title: "Language Required",
        description: "Please select a target language",
        variant: "destructive"
      });
      return;
    }

    if (!originalScript.trim()) {
      toast({
        title: "No Script",
        description: "Please provide a script to translate",
        variant: "destructive"
      });
      return;
    }

    setIsTranslating(true);

    try {
      const selectedLang = languages.find(lang => lang.code === targetLanguage);
      
      const { data, error } = await supabase.functions.invoke('translate-script', {
        body: { 
          text: originalScript,
          targetLanguage: selectedLang?.name || targetLanguage,
          preserveStructure: true
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Translation failed');
      }

      const translated = data.translatedText;
      
      // Check word count limit
      const validation = validateWordCount(translated);
      if (!validation.isValid) {
        throw new Error(`Translated script exceeds word limit: ${validation.errorMessage} Consider using a shorter script for translation.`);
      }
      
      setTranslatedScript(translated);
      
      // Save translation as a version automatically
      onTranslatedScript(translated, selectedLang?.name || targetLanguage);

      toast({
        title: "Translation Complete",
        description: `Script translated to ${selectedLang?.name || targetLanguage} and saved as version`
      });
    } catch (error) {
      console.error('Translation error:', error);
      
      let errorMessage = "Could not translate script";
      
      // Provide more specific error messages
      if (error.message?.includes('OpenAI API key not configured')) {
        errorMessage = "Translation service not available. Please contact support.";
      } else if (error.message?.includes('non-2xx status code')) {
        errorMessage = "Translation service temporarily unavailable. Please try again.";
      } else if (error.message?.includes('timeout')) {
        errorMessage = "Translation taking too long. Please try with a shorter script.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Translation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const copyTranslation = () => {
    navigator.clipboard.writeText(translatedScript);
    toast({
      title: "Copied!",
      description: "Translation copied to clipboard"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-green-600" />
          Script Translation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={targetLanguage} onValueChange={setTargetLanguage}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select target language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleTranslate}
            disabled={isTranslating || !targetLanguage || !originalScript.trim()}
          >
            {isTranslating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4 mr-2" />
                Translate
              </>
            )}
          </Button>
        </div>

        {translatedScript && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">Translated Script:</h3>
              <Button size="sm" variant="outline" onClick={copyTranslation}>
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
            </div>
            
            <Textarea
              value={translatedScript}
              readOnly
              className="min-h-[200px] text-sm"
              placeholder="Translation will appear here..."
            />
            
            <div className="text-xs text-gray-500">
              Translation preserves formatting and viral elements for maximum impact
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
