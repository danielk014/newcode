
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Target, TrendingUp, Star, AlertCircle } from 'lucide-react';

interface FormatRecommendation {
  format: string;
  score: number;
  reason: string;
  example: string;
  structure: string;
  whyItWorks: string;
}

interface VideoIdea {
  topic: string;
  angle: string;
  goal: string;
}

export const FormatRecommendationTool: React.FC<{
  onFormatSelect: (format: string) => void;
  selectedFormat: string;
}> = ({ onFormatSelect, selectedFormat }) => {
  const [videoIdea, setVideoIdea] = useState<VideoIdea>({
    topic: '',
    angle: '',
    goal: ''
  });
  const [recommendations, setRecommendations] = useState<FormatRecommendation[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const analyzeVideoIdea = (idea: VideoIdea): FormatRecommendation[] => {
    const topic = idea.topic.toLowerCase();
    const angle = idea.angle.toLowerCase();
    const goal = idea.goal.toLowerCase();
    
    const recommendations: FormatRecommendation[] = [];

    // Documentary Format Analysis
    if (topic.includes('politician') || topic.includes('controversy') || topic.includes('scandal') || 
        angle.includes('investigate') || angle.includes('truth') || angle.includes('expose')) {
      recommendations.push({
        format: 'Documentary Format',
        score: 95,
        reason: 'Perfect for controversial political topics that need thorough investigation',
        example: 'Who is America\'s Most Hated Politician? (Documentary Investigation)',
        structure: 'Hook with shocking stat → Historical context → Multiple perspectives → Evidence → Expert opinions → Conclusion',
        whyItWorks: 'Builds credibility through research while keeping viewers engaged with revelations'
      });
    }

    // Competition Format Analysis
    if (topic.includes('most') || topic.includes('vs') || topic.includes('ranking') ||
        angle.includes('compare') || angle.includes('battle') || angle.includes('versus')) {
      recommendations.push({
        format: 'Competition Format',
        score: 88,
        reason: 'Great for ranking/comparison content with clear winners and losers',
        example: 'RANKING America\'s Most Hated Politicians (You Won\'t Believe #1)',
        structure: 'Setup the competition → Present candidates → Show evidence → Dramatic reveals → Crown the winner',
        whyItWorks: 'Creates suspense and keeps viewers watching to see who wins'
      });
    }

    // Trend Jack Format Analysis
    if (topic.includes('recent') || topic.includes('breaking') || topic.includes('news') ||
        angle.includes('reaction') || angle.includes('take') || goal.includes('viral')) {
      recommendations.push({
        format: 'Trend Jack Format',
        score: 85,
        reason: 'Perfect if this ties to recent political events or trending news',
        example: 'My SHOCKING Take on America\'s Most Hated Politician Right Now',
        structure: 'Reference trending topic → Your unique angle → Hot takes → Personal opinion → Call to action',
        whyItWorks: 'Capitalizes on existing search volume and trending conversations'
      });
    }

    // Teaching Format Analysis
    if (angle.includes('explain') || angle.includes('breakdown') || angle.includes('analysis') ||
        goal.includes('educate') || goal.includes('inform')) {
      recommendations.push({
        format: 'Teaching Format',
        score: 78,
        reason: 'Good for educational content about political systems or history',
        example: 'Why Politicians Become Hated: The Psychology Explained',
        structure: 'Problem setup → Educational framework → Step-by-step analysis → Examples → Key takeaways',
        whyItWorks: 'Establishes authority while providing genuine educational value'
      });
    }

    // Success Story Format Analysis (less likely but possible)
    if (angle.includes('story') || angle.includes('journey') || topic.includes('rise') || topic.includes('fall')) {
      recommendations.push({
        format: 'Success Story Format',
        score: 65,
        reason: 'Could work if focusing on a politician\'s rise and fall story',
        example: 'How [Politician Name] Became America\'s Most Hated: A Case Study',
        structure: 'Result first → Background → The turning point → What went wrong → Lessons learned',
        whyItWorks: 'Provides a narrative arc that keeps viewers engaged'
      });
    }

    // Transformation Journey Analysis
    if (angle.includes('transformation') || angle.includes('change') || topic.includes('before') || topic.includes('after')) {
      recommendations.push({
        format: 'Transformation Journey',
        score: 70,
        reason: 'Works if showing how public opinion changed over time',
        example: 'From Hero to Zero: How America\'s Most Loved Politician Became Most Hated',
        structure: 'Starting point → Catalyst moment → The decline → Dramatic change → Current state → Analysis',
        whyItWorks: 'Shows dramatic change which is inherently engaging'
      });
    }

    // Sort by score and return top recommendations
    return recommendations.sort((a, b) => b.score - a.score);
  };

  const handleAnalyze = () => {
    if (!videoIdea.topic.trim()) return;
    
    const recs = analyzeVideoIdea(videoIdea);
    setRecommendations(recs);
    setShowRecommendations(true);
  };

  const useExample = () => {
    setVideoIdea({
      topic: 'most hated politician in america',
      angle: 'investigative documentary exposing the truth',
      goal: 'educate viewers about political controversies and get viral reach'
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-blue-600" />
            Format Recommendation Tool
          </CardTitle>
          <p className="text-sm text-gray-600">
            Tell us about your video idea and we'll recommend the best viral format for maximum impact
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Video Topic/Subject</Label>
              <Input
                id="topic"
                placeholder="e.g., most hated politician in america"
                value={videoIdea.topic}
                onChange={(e) => setVideoIdea({...videoIdea, topic: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="angle">Your Angle/Approach</Label>
              <Input
                id="angle"
                placeholder="e.g., investigative documentary, ranking format"
                value={videoIdea.angle}
                onChange={(e) => setVideoIdea({...videoIdea, angle: e.target.value})}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="goal">Content Goal</Label>
            <Input
              id="goal"
              placeholder="e.g., educate viewers, go viral, build authority"
              value={videoIdea.goal}
              onChange={(e) => setVideoIdea({...videoIdea, goal: e.target.value})}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAnalyze} disabled={!videoIdea.topic.trim()}>
              <Target className="w-4 h-4 mr-2" />
              Analyze & Recommend
            </Button>
            <Button variant="outline" onClick={useExample}>
              Use Example
            </Button>
          </div>
        </CardContent>
      </Card>

      {showRecommendations && recommendations.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <TrendingUp className="w-6 h-6" />
              Recommended Formats for Your Video
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <Card 
                  key={index} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedFormat === rec.format ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'
                  }`}
                  onClick={() => onFormatSelect(rec.format)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={index === 0 ? "default" : "secondary"} className="text-xs">
                          {index === 0 && <Star className="w-3 h-3 mr-1" />}
                          {rec.score}% Match
                        </Badge>
                        <h3 className="font-semibold text-lg">{rec.format}</h3>
                      </div>
                      {index === 0 && (
                        <Badge className="bg-green-100 text-green-800">
                          Best Match
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-blue-700">Why this works: </span>
                        <span className="text-gray-700">{rec.reason}</span>
                      </div>
                      
                      <div>
                        <span className="font-medium text-purple-700">Example title: </span>
                        <span className="italic text-gray-700">"{rec.example}"</span>
                      </div>
                      
                      <div>
                        <span className="font-medium text-green-700">Structure: </span>
                        <span className="text-gray-600">{rec.structure}</span>
                      </div>
                      
                      <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium text-yellow-800">Pro Tip: </span>
                            <span className="text-yellow-700">{rec.whyItWorks}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {selectedFormat && (
              <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                <p className="text-sm text-blue-800">
                  ✅ <strong>{selectedFormat}</strong> selected! This format will be used when generating your script.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
