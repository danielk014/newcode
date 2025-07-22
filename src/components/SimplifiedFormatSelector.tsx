import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Youtube, Smartphone, Clock, Hash, Info } from 'lucide-react';
import { cn } from "@/lib/utils";

interface VideoFormatConfig {
  format: 'long' | 'short';
  platform: string;
  targetWordCount: number;
  estimatedDuration: string;
}

interface SimplifiedFormatSelectorProps {
  selectedFormat: VideoFormatConfig;
  onFormatChange: (format: VideoFormatConfig) => void;
}

export const SimplifiedFormatSelector: React.FC<SimplifiedFormatSelectorProps> = ({ 
  selectedFormat, 
  onFormatChange 
}) => {
  const [format, setFormat] = useState<'long' | 'short'>(selectedFormat.format || 'long');
  const [wordCount, setWordCount] = useState(selectedFormat.targetWordCount || 1400);
  const [duration, setDuration] = useState(selectedFormat.estimatedDuration || '');

  // Calculate duration based on word count and format
  const calculateDuration = (words: number, formatType: 'long' | 'short') => {
    if (formatType === 'short') {
      // Short-form: ~3 words per second (faster pace)
      const seconds = Math.round(words / 3);
      if (seconds <= 60) {
        return `${seconds} seconds`;
      } else {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
      }
    } else {
      // Long-form: ~140-150 words per minute (normal speaking pace)
      const minutes = Math.round(words / 140);
      if (minutes < 1) {
        return '< 1 minute';
      } else if (minutes === 1) {
        return '1 minute';
      } else {
        return `${minutes} minutes`;
      }
    }
  };

  // Update duration when word count or format changes
  useEffect(() => {
    const estimatedDuration = calculateDuration(wordCount, format);
    setDuration(estimatedDuration);
    
    const platform = format === 'long' ? 'YouTube' : 'TikTok/Instagram/YouTube Shorts';
    
    onFormatChange({
      format,
      platform,
      targetWordCount: wordCount,
      estimatedDuration
    });
  }, [wordCount, format, onFormatChange]);

  const handleWordCountChange = (value: string) => {
    const count = parseInt(value) || 0;
    setWordCount(count);
  };

  const formatPresets = {
    short: [
      { words: 50, label: '15-20 seconds' },
      { words: 100, label: '30-35 seconds' },
      { words: 150, label: '45-50 seconds' },
      { words: 180, label: '60 seconds' }
    ],
    long: [
      { words: 600, label: '~4 minutes' },
      { words: 1000, label: '~7 minutes' },
      { words: 1400, label: '~10 minutes' },
      { words: 2100, label: '~15 minutes' }
    ]
  };

  return (
    <Card className="glass-effect border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Video Format</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Format Selection */}
        <div className="space-y-3">
          <Label>Content Type</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={format === 'long' ? 'default' : 'outline'}
              onClick={() => setFormat('long')}
              className={cn(
                "h-auto py-4 px-4 flex flex-col items-center gap-2",
                format === 'long' && "btn-futuristic"
              )}
            >
              <Youtube className="w-6 h-6" />
              <div className="text-center">
                <div className="font-semibold">Long-form</div>
                <div className="text-xs text-muted-foreground mt-1">YouTube Videos</div>
              </div>
            </Button>
            
            <Button
              variant={format === 'short' ? 'default' : 'outline'}
              onClick={() => setFormat('short')}
              className={cn(
                "h-auto py-4 px-4 flex flex-col items-center gap-2",
                format === 'short' && "btn-futuristic"
              )}
            >
              <Smartphone className="w-6 h-6" />
              <div className="text-center">
                <div className="font-semibold">Short-form</div>
                <div className="text-xs text-muted-foreground mt-1">TikTok • Reels • Shorts</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Word Count Input */}
        <div className="space-y-3">
          <Label htmlFor="wordCount" className="flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Target Word Count
          </Label>
          <div className="space-y-3">
            <Input
              id="wordCount"
              type="number"
              value={wordCount}
              onChange={(e) => handleWordCountChange(e.target.value)}
              placeholder="Enter word count"
              className="text-lg"
              min="10"
              max="10000"
            />
            
            {/* Duration Estimation */}
            <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                Estimated duration: <strong className="text-foreground">{duration}</strong>
              </span>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Quick presets:</Label>
              <div className="flex flex-wrap gap-2">
                {formatPresets[format].map((preset) => (
                  <Badge
                    key={preset.words}
                    variant={wordCount === preset.words ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/20"
                    onClick={() => setWordCount(preset.words)}
                  >
                    {preset.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Format Guidelines */}
        <div className="p-3 bg-muted/10 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Info className="w-4 h-4 text-primary" />
            Format Guidelines
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            {format === 'long' ? (
              <>
                <div>• Ideal for detailed tutorials and educational content</div>
                <div>• YouTube algorithm favors 8-12 minute videos</div>
                <div>• Include chapters for better navigation</div>
              </>
            ) : (
              <>
                <div>• Keep under 60 seconds for maximum virality</div>
                <div>• Front-load value in first 3 seconds</div>
                <div>• Optimize for mobile viewing and sound-off</div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};