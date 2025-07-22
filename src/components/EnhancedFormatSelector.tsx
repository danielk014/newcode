import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Youtube, Smartphone, Monitor, Clock, Hash, Zap } from 'lucide-react';

interface VideoFormatConfig {
  platform: 'youtube' | 'tiktok' | 'instagram' | 'general';
  format: 'long' | 'short';
  duration: string;
  style: string;
  targetWordCount: number;
}

interface EnhancedFormatSelectorProps {
  selectedFormat: VideoFormatConfig;
  onFormatChange: (format: VideoFormatConfig) => void;
}

export const EnhancedFormatSelector: React.FC<EnhancedFormatSelectorProps> = ({ 
  selectedFormat, 
  onFormatChange 
}) => {
  const [platform, setPlatform] = useState<VideoFormatConfig['platform']>(selectedFormat.platform || 'youtube');
  const [format, setFormat] = useState<VideoFormatConfig['format']>(selectedFormat.format || 'long');
  const [duration, setDuration] = useState(selectedFormat.duration || '8-10 minutes');
  const [style, setStyle] = useState(selectedFormat.style || 'Educational');

  const platformOptions = [
    { 
      value: 'youtube', 
      label: 'YouTube', 
      icon: Youtube,
      formats: ['long', 'short'],
      description: 'Optimized for YouTube algorithm'
    },
    { 
      value: 'tiktok', 
      label: 'TikTok', 
      icon: Smartphone,
      formats: ['short'],
      description: 'Viral short-form content'
    },
    { 
      value: 'instagram', 
      label: 'Instagram Reels', 
      icon: Smartphone,
      formats: ['short'],
      description: 'Engaging visual content'
    },
    { 
      value: 'general', 
      label: 'General Purpose', 
      icon: Monitor,
      formats: ['long', 'short'],
      description: 'Flexible for any platform'
    }
  ];

  const durationOptions = {
    short: [
      { value: '15-30 seconds', label: '15-30 seconds', words: 50 },
      { value: '30-60 seconds', label: '30-60 seconds', words: 100 },
      { value: '60-90 seconds', label: '60-90 seconds', words: 150 }
    ],
    long: [
      { value: '3-5 minutes', label: '3-5 minutes', words: 600 },
      { value: '5-8 minutes', label: '5-8 minutes', words: 1000 },
      { value: '8-10 minutes', label: '8-10 minutes', words: 1400 },
      { value: '10-15 minutes', label: '10-15 minutes', words: 2100 },
      { value: '15-20 minutes', label: '15-20 minutes', words: 2800 },
      { value: '20-30 minutes', label: '20-30 minutes', words: 4200 },
      { value: '30-45 minutes', label: '30-45 minutes', words: 6300 },
      { value: '45-60 minutes', label: '45-60 minutes', words: 8400 },
      { value: '60-90 minutes', label: '60-90 minutes', words: 12600 },
      { value: '90+ minutes', label: '90+ minutes', words: 18900 },
      { value: 'Feature Length', label: 'Feature Length', words: 30000 }
    ]
  };

  const styleOptions = {
    short: [
      'Hook-Heavy',
      'Tutorial Quick Tips',
      'Entertainment',
      'Story Time',
      'Challenge/Trend'
    ],
    long: [
      'Educational',
      'Documentary Style',
      'Tutorial Deep Dive',
      'Storytelling',
      'Case Study',
      'Interview/Podcast'
    ]
  };

  const updateFormat = (updates: Partial<VideoFormatConfig>) => {
    const newFormat: VideoFormatConfig = {
      platform: updates.platform || platform,
      format: updates.format || format,
      duration: updates.duration || duration,
      style: updates.style || style,
      targetWordCount: 1400
    };

    // Calculate target word count based on duration
    const durationOption = durationOptions[newFormat.format].find(d => d.value === newFormat.duration);
    if (durationOption) {
      newFormat.targetWordCount = durationOption.words;
    }

    onFormatChange(newFormat);
  };

  const handlePlatformChange = (newPlatform: VideoFormatConfig['platform']) => {
    setPlatform(newPlatform);
    const platformConfig = platformOptions.find(p => p.value === newPlatform);
    
    // Auto-adjust format if platform doesn't support current format
    if (platformConfig && !platformConfig.formats.includes(format)) {
      const newFormat = platformConfig.formats[0] as VideoFormatConfig['format'];
      setFormat(newFormat);
      setDuration(durationOptions[newFormat][0].value);
      setStyle(styleOptions[newFormat][0]);
      updateFormat({ 
        platform: newPlatform, 
        format: newFormat,
        duration: durationOptions[newFormat][0].value,
        style: styleOptions[newFormat][0]
      });
    } else {
      updateFormat({ platform: newPlatform });
    }
  };

  const handleFormatChange = (newFormat: VideoFormatConfig['format']) => {
    setFormat(newFormat);
    setDuration(durationOptions[newFormat][0].value);
    setStyle(styleOptions[newFormat][0]);
    updateFormat({ 
      format: newFormat,
      duration: durationOptions[newFormat][0].value,
      style: styleOptions[newFormat][0]
    });
  };

  return (
    <Card className="glass-effect border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Video Format Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Platform Selection */}
        <div className="space-y-3">
          <Label>Platform</Label>
          <RadioGroup value={platform} onValueChange={(v) => handlePlatformChange(v as VideoFormatConfig['platform'])}>
            <div className="grid grid-cols-2 gap-3">
              {platformOptions.map(option => {
                const Icon = option.icon;
                return (
                  <div key={option.value} className="relative">
                    <RadioGroupItem value={option.value} id={option.value} className="peer sr-only" />
                    <Label
                      htmlFor={option.value}
                      className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <Icon className="w-6 h-6 mb-2" />
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground mt-1">{option.description}</span>
                    </Label>
                  </div>
                );
              })}
            </div>
          </RadioGroup>
        </div>

        {/* Format Type */}
        <div className="space-y-3">
          <Label>Content Format</Label>
          <div className="flex gap-3">
            {platformOptions.find(p => p.value === platform)?.formats.includes('long') && (
              <Button
                variant={format === 'long' ? 'default' : 'outline'}
                onClick={() => handleFormatChange('long')}
                className="flex-1"
              >
                <Monitor className="w-4 h-4 mr-2" />
                Long-form
              </Button>
            )}
            {platformOptions.find(p => p.value === platform)?.formats.includes('short') && (
              <Button
                variant={format === 'short' ? 'default' : 'outline'}
                onClick={() => handleFormatChange('short')}
                className="flex-1"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Short-form
              </Button>
            )}
          </div>
        </div>

        {/* Duration Selection */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Duration
          </Label>
          <Select value={duration} onValueChange={(v) => {
            setDuration(v);
            updateFormat({ duration: v });
          }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {durationOptions[format].map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center justify-between w-full">
                    <span>{option.label}</span>
                    <Badge variant="secondary" className="ml-2">
                      <Hash className="w-3 h-3 mr-1" />
                      ~{option.words} words
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Style Selection */}
        <div className="space-y-3">
          <Label>Content Style</Label>
          <Select value={style} onValueChange={(v) => {
            setStyle(v);
            updateFormat({ style: v });
          }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {styleOptions[format].map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Format Summary */}
        <div className="p-4 bg-muted/20 rounded-lg space-y-2">
          <div className="text-sm font-medium">Format Summary:</div>
          <div className="flex flex-wrap gap-2">
            <Badge>{platform}</Badge>
            <Badge variant="secondary">{format === 'long' ? 'Long-form' : 'Short-form'}</Badge>
            <Badge variant="outline">{duration}</Badge>
            <Badge variant="outline">{style}</Badge>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Target: ~{durationOptions[format].find(d => d.value === duration)?.words || 1400} words
          </div>
        </div>
      </CardContent>
    </Card>
  );
};