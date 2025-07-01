
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Youtube, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface YouTubeScraperProps {
  onScriptExtracted: (script: string, source: string) => void;
}

export const YouTubeScraper: React.FC<YouTubeScraperProps> = ({ onScriptExtracted }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleScrape = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a YouTube URL",
        variant: "destructive"
      });
      return;
    }

    // Validate YouTube URL
    const isValidYouTubeUrl = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(url);
    if (!isValidYouTubeUrl) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Calling YouTube scraper function with URL:', url);
      const { data, error } = await supabase.functions.invoke('scrape-youtube-script', {
        body: { url, platform: 'youtube' }
      });

      console.log('YouTube scraper response:', data, error);

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to scrape YouTube script');
      }

      const script = data.script;
      if (script && script.length > 50) {
        onScriptExtracted(script, `YouTube: ${url}`);
        // Simplified success message
        console.log('Script extracted successfully');
        setUrl('');
      } else {
        throw new Error('No meaningful transcript found for this video');
      }
    } catch (error) {
      console.error('YouTube scraping error:', error);
      toast({
        title: "Extraction Failed",
        description: error.message || "Could not extract script from this YouTube video. The video may not have captions available.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleScrape();
    }
  };

  return (
    <Card className="border border-red-200 bg-red-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <Youtube className="w-5 h-5" />
          Extract from YouTube
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Paste YouTube URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleScrape} 
            disabled={isLoading || !url.trim()}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <Youtube className="w-4 h-4 mr-2" />
                Extract
              </>
            )}
          </Button>
        </div>
        
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <AlertCircle className="w-4 h-4 mt-0.5 text-amber-500" />
          <p>
            This will extract the official transcript/captions from the YouTube video. 
            Some videos may not have transcripts available.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
