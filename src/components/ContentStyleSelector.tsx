import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, BookOpen, Zap, TrendingUp, MessageCircle, Film } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ContentStyle {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  characteristics: string[];
  bestFor: string;
}

interface ContentStyleSelectorProps {
  detectedStyles?: string[];
  selectedStyle: string;
  onStyleSelect: (style: string) => void;
  format: 'long' | 'short';
}

const longFormStyles: ContentStyle[] = [
  {
    id: 'educational',
    name: 'Educational',
    description: 'In-depth teaching with clear explanations',
    icon: BookOpen,
    characteristics: ['Step-by-step instructions', 'Detailed examples', 'Clear structure'],
    bestFor: 'Tutorials, how-to guides, courses'
  },
  {
    id: 'documentary',
    name: 'Documentary Style',
    description: 'Narrative-driven with research and storytelling',
    icon: Film,
    characteristics: ['Story arc', 'Research-based', 'Multiple perspectives'],
    bestFor: 'Deep dives, investigations, case studies'
  },
  {
    id: 'motivational',
    name: 'Motivational',
    description: 'Inspiring content that drives action',
    icon: Zap,
    characteristics: ['Emotional appeal', 'Success stories', 'Call to action'],
    bestFor: 'Personal development, business growth'
  },
  {
    id: 'conversational',
    name: 'Conversational',
    description: 'Casual, relatable discussion format',
    icon: MessageCircle,
    characteristics: ['Personal anecdotes', 'Direct address', 'Informal tone'],
    bestFor: 'Vlogs, opinion pieces, lifestyle content'
  }
];

const shortFormStyles: ContentStyle[] = [
  {
    id: 'hook-heavy',
    name: 'Hook-Heavy',
    description: 'Maximum retention with constant hooks',
    icon: Zap,
    characteristics: ['3-second hook', 'Pattern interrupts', 'Fast paced'],
    bestFor: 'Viral content, quick tips'
  },
  {
    id: 'tutorial-quick',
    name: 'Quick Tutorial',
    description: 'Rapid-fire educational content',
    icon: BookOpen,
    characteristics: ['Step-by-step', 'Visual demos', 'Clear outcome'],
    bestFor: 'Life hacks, quick guides'
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    description: 'Fun, engaging, shareable content',
    icon: Sparkles,
    characteristics: ['Humor', 'Surprises', 'Relatable'],
    bestFor: 'Comedy, reactions, trends'
  },
  {
    id: 'transformation',
    name: 'Transformation',
    description: 'Before/after dramatic reveals',
    icon: TrendingUp,
    characteristics: ['Visual impact', 'Clear results', 'Inspiring'],
    bestFor: 'Makeovers, progress, results'
  }
];

export const ContentStyleSelector: React.FC<ContentStyleSelectorProps> = ({
  detectedStyles = [],
  selectedStyle,
  onStyleSelect,
  format
}) => {
  const styles = format === 'long' ? longFormStyles : shortFormStyles;

  const getDetectedStyleMatch = (styleId: string) => {
    const style = styles.find(s => s.id === styleId);
    if (!style) return 0;
    
    // Check if any detected styles match this style's characteristics
    const matches = detectedStyles.filter(detected => 
      style.name.toLowerCase().includes(detected.toLowerCase()) ||
      style.characteristics.some(char => 
        char.toLowerCase().includes(detected.toLowerCase())
      )
    );
    
    return matches.length;
  };

  return (
    <Card className="glass-effect border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Content Style
        </CardTitle>
        <CardDescription>
          {detectedStyles.length > 0 ? (
            <span>
              Based on your reference scripts, we detected: {' '}
              <span className="text-primary font-medium">
                {detectedStyles.join(', ')}
              </span>
            </span>
          ) : (
            'Choose the style that best matches your content goals'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select value={selectedStyle} onValueChange={onStyleSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a content style" />
            </SelectTrigger>
            <SelectContent>
              {styles.map((style) => {
                const matchCount = getDetectedStyleMatch(style.id);
                return (
                  <SelectItem key={style.id} value={style.id}>
                    <div className="flex items-center gap-2">
                      <span>{style.name}</span>
                      {matchCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          Detected
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          
          {/* Show details of selected style */}
          {selectedStyle && (() => {
            const style = styles.find(s => s.id === selectedStyle);
            if (!style) return null;
            const Icon = style.icon;
            
            return (
              <div className="p-4 border rounded-lg bg-muted/20">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-grow space-y-2">
                    <h4 className="font-semibold">{style.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {style.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {style.characteristics.map((char, i) => (
                        <Badge 
                          key={i} 
                          variant="outline" 
                          className="text-xs"
                        >
                          {char}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Best for: {style.bestFor}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </CardContent>
    </Card>
  );
};