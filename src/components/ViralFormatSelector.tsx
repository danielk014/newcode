
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, BookOpen, Zap, Target, Camera } from 'lucide-react';

interface ViralFormat {
  name: string;
  description: string;
  whenToUse: string;
  structure: string;
  icon: React.ComponentType<any>;
  effectiveness: number;
  examples: string[];
  bestFor: string[];
}

const viralFormats: ViralFormat[] = [
  {
    name: "Competition Format",
    description: "Based on proven formats like Fear Factor, Survivor - competition has worked since Roman times",
    whenToUse: "When you want to create suspense and drama. Perfect for challenges, contests, or any content where there's a clear winner/loser dynamic.",
    structure: "Setup Challenge → Show Stakes → Document Journey → Reveal Winner → Lesson/Takeaway",
    icon: Trophy,
    effectiveness: 95,
    examples: ["Who will win this challenge?", "Ultimate test between...", "Last person standing wins..."],
    bestFor: ["Challenges", "Contests", "Comparisons", "Testing products/methods"]
  },
  {
    name: "Transformation Journey", 
    description: "Before/after content showing clear progression and change",
    whenToUse: "When you have a clear starting point and dramatic end result. Works great for personal development, business growth, or skill acquisition.",
    structure: "Starting Point → Catalyst → Struggle → Breakthrough → New State → Lessons",
    icon: TrendingUp,
    effectiveness: 90,
    examples: ["From broke to millionaire", "Zero to hero journey", "Complete transformation"],
    bestFor: ["Personal stories", "Business growth", "Skill development", "Lifestyle changes"]
  },
  {
    name: "Teaching Format",
    description: "Educational content that builds authority while providing value",
    whenToUse: "When you want to establish expertise and provide genuine value. Best for complex topics that need step-by-step explanation.",
    structure: "Problem → Solution Preview → Step-by-Step → Examples → Advanced Tips → CTA",
    icon: BookOpen,
    effectiveness: 85,
    examples: ["How to make money online", "Master this skill in 30 days", "The complete guide to..."],
    bestFor: ["Tutorials", "How-to content", "Skill teaching", "Educational content"]
  },
  {
    name: "Trend Jack Format",
    description: "Rapid response to trending topics with unique angle",
    whenToUse: "When there's a hot topic everyone's talking about. Move fast to capitalize on trending conversations and news.",
    structure: "Trend Reference → Your Angle → Value Add → Personal Take → CTA",
    icon: Zap,
    effectiveness: 88,
    examples: ["My take on [trending topic]", "What everyone missed about...", "The real truth behind..."],
    bestFor: ["Current events", "Viral trends", "Industry news", "Controversial topics"]
  },
  {
    name: "Success Story Format",
    description: "Case study format highlighting specific results",
    whenToUse: "When you have concrete results to share. Perfect for building credibility and showing proof of concept.",
    structure: "Result First → Background → Challenge → Strategy → Implementation → Results → Replication",
    icon: Target,
    effectiveness: 82,
    examples: ["How I made $100k in 30 days", "Student success story", "Case study breakdown"],
    bestFor: ["Case studies", "Client results", "Personal achievements", "Proof of concept"]
  },
  {
    name: "Documentary Format",
    description: "In-depth investigative storytelling with multiple perspectives and evidence",
    whenToUse: "When you want to explore complex topics thoroughly. Great for building trust through comprehensive research and multiple viewpoints.",
    structure: "Hook/Question → Investigation Setup → Evidence Gathering → Expert Interviews → Revelations → Conclusion",
    icon: Camera,
    effectiveness: 87,
    examples: ["The truth about [industry]", "What really happened to...", "Inside the [mysterious topic]"],
    bestFor: ["Investigative content", "Industry exposés", "Historical events", "Complex topics"]
  }
];

interface ViralFormatSelectorProps {
  selectedFormat: string;
  onFormatSelect: (format: string) => void;
}

export const ViralFormatSelector: React.FC<ViralFormatSelectorProps> = ({ 
  selectedFormat, 
  onFormatSelect 
}) => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Choose Your Viral Format</h3>
        <p className="text-sm text-gray-600">Based on proven strategies that have worked for centuries</p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {viralFormats.map((format, index) => {
          const Icon = format.icon;
          const isSelected = selectedFormat === format.name;
          
          return (
            <Card 
              key={index} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => onFormatSelect(format.name)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Icon className="w-8 h-8 text-blue-600" />
                  <Badge variant="secondary">{format.effectiveness}% effective</Badge>
                </div>
                <CardTitle className="text-lg">{format.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{format.description}</p>
                
                <div className="mb-3">
                  <h4 className="font-medium text-sm mb-1 text-green-700">When to Use:</h4>
                  <p className="text-xs text-gray-600">{format.whenToUse}</p>
                </div>
                
                <div className="mb-3">
                  <h4 className="font-medium text-sm mb-1">Best For:</h4>
                  <div className="flex flex-wrap gap-1">
                    {format.bestFor.map((item, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="mb-3">
                  <h4 className="font-medium text-sm mb-1">Structure:</h4>
                  <p className="text-xs text-gray-500">{format.structure}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-1">Examples:</h4>
                  <ul className="text-xs text-gray-500 space-y-1">
                    {format.examples.slice(0, 2).map((example, idx) => (
                      <li key={idx}>• {example}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <h4 className="font-semibold mb-2">🧠 Pro Tip from DanielKCI:</h4>
        <p className="text-sm text-gray-700">
          "Don't reinvent the wheel. These formats work because they've been proven by successful creators and even ancient entertainment like the Roman Colosseum. Pick one that matches your content goal and add your unique twist!"
        </p>
      </div>
    </div>
  );
};
