
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Loader2, TrendingUp, Heart, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SentimentAnalysis {
  overall_sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  emotions: Array<{ emotion: string; intensity: number }>;
  tone_indicators: string[];
  engagement_score: number;
  viral_potential: number;
}

interface SentimentAnalyzerProps {
  text: string;
  onAnalysisComplete?: (analysis: SentimentAnalysis) => void;
}

export const SentimentAnalyzer: React.FC<SentimentAnalyzerProps> = ({ 
  text, 
  onAnalysisComplete 
}) => {
  const [analysis, setAnalysis] = useState<SentimentAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const runAnalysis = async () => {
    if (!text.trim()) {
      toast({
        title: "No Content",
        description: "Please provide text to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-sentiment', {
        body: { text: text.substring(0, 4000) } // Limit text length
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze sentiment');
      }

      const sentimentData = data.sentiment;
      setAnalysis(sentimentData);
      onAnalysisComplete?.(sentimentData);

      toast({
        title: "Analysis Complete",
        description: `Sentiment: ${sentimentData.overall_sentiment} (${Math.round(sentimentData.confidence * 100)}% confidence)`
      });
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Could not analyze sentiment",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getViralPotentialColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          Emotional Tone Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysis ? (
          <Button 
            onClick={runAnalysis} 
            disabled={isAnalyzing || !text.trim()}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Emotional Tone...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Analyze Emotional Impact
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Overall Sentiment */}
            <div className="flex items-center justify-between">
              <span className="font-medium">Overall Sentiment:</span>
              <Badge className={getSentimentColor(analysis.overall_sentiment)}>
                {analysis.overall_sentiment} ({Math.round(analysis.confidence * 100)}%)
              </Badge>
            </div>

            {/* Engagement Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Engagement Score:
                </span>
                <span className="font-bold">{analysis.engagement_score}/100</span>
              </div>
              <Progress value={analysis.engagement_score} className="h-2" />
            </div>

            {/* Viral Potential */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Viral Potential:
                </span>
                <span className={`font-bold ${getViralPotentialColor(analysis.viral_potential)}`}>
                  {analysis.viral_potential}/100
                </span>
              </div>
              <Progress value={analysis.viral_potential} className="h-2" />
            </div>

            {/* Top Emotions */}
            {analysis.emotions && analysis.emotions.length > 0 && (
              <div className="space-y-2">
                <span className="font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Detected Emotions:
                </span>
                <div className="flex flex-wrap gap-2">
                  {analysis.emotions.slice(0, 5).map((emotion, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {emotion.emotion} ({Math.round(emotion.intensity * 100)}%)
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Tone Indicators */}
            {analysis.tone_indicators && analysis.tone_indicators.length > 0 && (
              <div className="space-y-2">
                <span className="font-medium">Tone Indicators:</span>
                <div className="flex flex-wrap gap-2">
                  {analysis.tone_indicators.slice(0, 6).map((indicator, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {indicator}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Button 
              onClick={runAnalysis} 
              variant="outline" 
              size="sm"
              disabled={isAnalyzing}
            >
              Re-analyze
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
