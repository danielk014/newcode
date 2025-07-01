
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, TrendingUp, BookOpen, Zap, Target, Camera, Copy, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ViralFormat {
  name: string;
  description: string;
  whenToUse: string;
  structure: string;
  icon: React.ComponentType<any>;
  effectiveness: number;
  examples: string[];
  bestFor: string[];
  content?: string;
  isTemplate?: boolean;
}

const baseViralFormats: ViralFormat[] = [
  {
    name: "Copy Reference Script Format",
    description: "Use the same structure and style as your provided reference scripts",
    whenToUse: "When you want to replicate the exact format and flow that has already proven successful in your reference scripts.",
    structure: "Mirror Structure → Copy Hooks → Adapt Content → Maintain Flow → Keep CTA Style",
    icon: Copy,
    effectiveness: 92,
    examples: ["Exactly like script #1", "Same format as reference", "Proven structure replication"],
    bestFor: ["Script replication", "Proven formats", "Tested structures", "Safe approach"]
  },
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
  const [allFormats, setAllFormats] = useState<ViralFormat[]>(baseViralFormats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data: templates, error } = await supabase
        .from('industry_templates')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      const templateFormats: ViralFormat[] = templates?.map(template => ({
        name: template.title,
        description: template.description || "Industry-specific template",
        whenToUse: `Perfect for ${template.industry.toLowerCase()} content`,
        structure: "Hook → Problem → Solution → Proof → CTA",
        icon: FileText,
        effectiveness: 85,
        examples: [template.title],
        bestFor: [template.industry, "Industry-specific content"],
        content: template.template_content,
        isTemplate: true
      })) || [];

      setAllFormats([...baseViralFormats, ...templateFormats]);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const industries = ['All', 'Business', 'Fitness', 'Education', 'Technology'];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Browse All Viral Formats & Templates</h3>
        <p className="text-sm text-gray-600">Based on proven strategies that have worked for centuries</p>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {industries.map(industry => (
            <TabsTrigger key={industry} value={industry.toLowerCase()}>
              {industry}
            </TabsTrigger>
          ))}
        </TabsList>

        {industries.map(industry => (
          <TabsContent key={industry} value={industry.toLowerCase()}>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
              {allFormats
                .filter(format => 
                  industry === 'All' || 
                  format.bestFor.some(bf => bf.toLowerCase().includes(industry.toLowerCase())) ||
                  format.name.toLowerCase().includes(industry.toLowerCase())
                )
                .map((format, index) => {
                  const Icon = format.icon;
                  const isSelected = selectedFormat === format.name;
                  
                  return (
                    <Card 
                      key={index} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                      } p-3`}
                      onClick={() => onFormatSelect(format.name)}
                    >
                      <CardHeader className="pb-2 p-0">
                        <div className="flex items-center justify-between mb-2">
                          <Icon className="w-5 h-5 text-blue-600" />
                          <div className="flex gap-1">
                            <Badge variant="secondary" className="text-xs px-1 py-0">{format.effectiveness}%</Badge>
                            {format.isTemplate && <Badge variant="outline" className="text-xs px-1 py-0">Template</Badge>}
                          </div>
                        </div>
                        <CardTitle className="text-sm font-medium leading-tight">{format.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{format.description}</p>
                        
                        <div className="mb-2">
                          <h4 className="font-medium text-xs mb-1 text-green-700">When to Use:</h4>
                          <p className="text-xs text-gray-600 line-clamp-2">{format.whenToUse}</p>
                        </div>
                        
                        <div className="mb-2">
                          <h4 className="font-medium text-xs mb-1">Best For:</h4>
                          <div className="flex flex-wrap gap-1">
                            {format.bestFor.slice(0, 2).map((item, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs px-1 py-0">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mb-2">
                          <h4 className="font-medium text-xs mb-1">Structure:</h4>
                          <p className="text-xs text-gray-500 line-clamp-1">{format.structure}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-xs mb-1">Examples:</h4>
                          <ul className="text-xs text-gray-500 space-y-1">
                            {format.examples.slice(0, 1).map((example, idx) => (
                              <li key={idx} className="line-clamp-1">• {example}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
