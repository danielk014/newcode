
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Download, Copy, Loader2, AlertCircle, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TikTokTranscriptGeneratorProps {
  onScriptExtracted: (script: string, source: string) => void;
}

export const TikTokTranscriptGenerator: React.FC<TikTokTranscriptGeneratorProps> = ({ 
  onScriptExtracted 
}) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const { toast } = useToast();

  const handleExtract = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a TikTok URL",
        variant: "destructive"
      });
      return;
    }

    // Validate TikTok URL
    const isTikTokUrl = /^(https?:\/\/)?(www\.)?(tiktok\.com|vm\.tiktok\.com)\/.+/.test(url);
    if (!isTikTokUrl) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid TikTok URL",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Calling TikTok scraper function with URL:', url);
      const { data, error } = await supabase.functions.invoke('scrape-youtube-script', {
        body: { url, platform: 'tiktok' }
      });

      console.log('TikTok scraper response:', data, error);

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to extract TikTok transcript');
      }

      const extractedTranscript = data.script;
      setTranscript(extractedTranscript);
      setVideoInfo(data.videoInfo || { title: "TikTok Video", duration: "0:30" });
      
      toast({
        title: "Transcript Extracted!",
        description: `Successfully extracted ${extractedTranscript.length} characters from TikTok video`
      });
    } catch (error) {
      console.error('TikTok extraction error:', error);
      toast({
        title: "Extraction Failed",
        description: "TikTok transcript extraction is currently in demo mode. Using sample transcript.",
        variant: "default"
      });
      
      // Generate sample transcript for demo
      const sampleTranscript = generateSampleTikTokTranscript();
      setTranscript(sampleTranscript);
      setVideoInfo({ title: "Sample TikTok Video", duration: "0:30" });
    } finally {
      setIsLoading(false);
    }
  };

  const generateSampleTikTokTranscript = (): string => {
    const samples = [
      "Hey guys! Today I'm gonna show you this crazy life hack that will blow your mind! So basically what you wanna do is... *demonstrates* And boom! That's it! Let me know if this worked for you in the comments below!",
      "POV: You just discovered the secret that successful people don't want you to know... Here's what they do differently: First step is mindset, second step is action, third step is consistency. Follow me for more tips!",
      "This is why you're not getting results... You're focusing on the wrong things! Instead of doing A, B, C, you should be doing X, Y, Z. Trust me, this changed everything for me!",
      "Wait until you see what happens next... *suspenseful pause* This simple trick will save you hours every day. All you need is... *reveals solution* Mind blown, right? Share this with someone who needs to see it!"
    ];
    
    return samples[Math.floor(Math.random() * samples.length)];
  };

  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(transcript);
    toast({
      title: "Copied!",
      description: "Transcript copied to clipboard"
    });
  };

  const handleUseAsReference = () => {
    if (transcript) {
      onScriptExtracted(transcript, `TikTok: ${url}`);
      toast({
        title: "Added to References",
        description: "TikTok transcript added as reference script"
      });
      // Clear the transcript after using it
      setTranscript('');
      setVideoInfo(null);
      setUrl('');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([transcript], { type: 'text/plain' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `tiktok-transcript-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleExtract();
    }
  };

  return (
    <Card className="border border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-pink-700">
          <Video className="w-5 h-5" />
          TikTok Transcript Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Paste TikTok URL here (e.g., https://www.tiktok.com/@username/video/...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleExtract} 
            disabled={isLoading || !url.trim()}
            className="bg-pink-600 hover:bg-pink-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <Video className="w-4 h-4 mr-2" />
                Extract
              </>
            )}
          </Button>
        </div>

        <div className="flex items-start gap-2 text-sm text-gray-600">
          <AlertCircle className="w-4 h-4 mt-0.5 text-amber-500" />
          <div>
            <p className="font-medium">How to use:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Copy any TikTok video URL</li>
              <li>Paste it above and click Extract</li>
              <li>Get the transcript to use as reference</li>
              <li>Currently in demo mode with sample transcripts</li>
            </ul>
          </div>
        </div>

        {transcript && (
          <div className="space-y-4 pt-4 border-t">
            {videoInfo && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {videoInfo.title || 'TikTok Video'}
                </Badge>
                {videoInfo.duration && (
                  <Badge variant="outline">
                    {videoInfo.duration}
                  </Badge>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <h4 className="font-medium">Extracted Transcript:</h4>
              <Textarea
                value={transcript}
                readOnly
                className="min-h-[120px] text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleUseAsReference} size="sm" className="flex-1">
                Use as Reference Script
              </Button>
              <Button onClick={handleCopyTranscript} size="sm" variant="outline">
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
              <Button onClick={handleDownload} size="sm" variant="outline">
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
