import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ArrowLeft, Brain, Target, Heart, Crown, Clock, Users } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

interface Tactic {
  name: string;
  category: string;
  description: string;
  explanation: string;
  whenToUse: string;
  examples: string[];
  psychology: string;
}

const tacticData: Tactic[] = [
  {
    name: "Information Gap Hook",
    category: "Hook",
    description: "Creates curiosity by revealing partial information that viewers must stay to learn",
    explanation: "This tactic leverages the human brain's natural desire to close information gaps. When we're presented with incomplete information, our brains create tension that can only be resolved by learning the missing piece.",
    whenToUse: "Use at the beginning of videos or before revealing important information. Perfect for intros, before case studies, or when transitioning to key points.",
    examples: [
      "What I'm about to show you will change everything...",
      "The secret that 99% of people don't know...",
      "By the end of this video, you'll understand why..."
    ],
    psychology: "Based on the 'curiosity gap' principle from psychology - humans have an innate drive to seek information and close knowledge gaps."
  },
  {
    name: "Pattern Interrupt",
    category: "Retention",
    description: "Sudden changes in tone, pace, or topic to reset viewer attention",
    explanation: "Our brains are prediction machines. When patterns are suddenly broken, it forces the brain to refocus and pay attention. This prevents viewers from zoning out or clicking away.",
    whenToUse: "Use every 30-60 seconds when you notice energy dropping, during long explanations, or when transitioning between topics.",
    examples: [
      "But wait, it gets worse...",
      "Now here's the crazy part...",
      "Actually, forget everything I just said..."
    ],
    psychology: "Exploits the brain's pattern recognition system and attention mechanisms to maintain focus and engagement."
  },
  {
    name: "Bold Statement Hook",
    category: "Hook", 
    description: "Make a controversial or surprising statement that demands attention",
    explanation: "Bold statements trigger our brain's threat detection system and social curiosity. They create immediate emotional arousal and force viewers to evaluate the claim.",
    whenToUse: "Use as video openers, when making counterintuitive points, or to challenge common beliefs in your niche.",
    examples: [
      "Everything you know about [topic] is wrong",
      "I'm about to destroy a $10 billion industry",
      "This will be illegal in 6 months"
    ],
    psychology: "Activates the amygdala (emotional center) and creates cognitive dissonance that must be resolved through continued viewing."
  },
  {
    name: "Micro-Hook Escalation",
    category: "Retention",
    description: "Use escalating phrases every 15-30 seconds to maintain attention",
    explanation: "Constant micro-hooks prevent attention decay by continuously promising that something even better is coming next.",
    whenToUse: "Throughout the entire video, especially during explanations or when presenting multiple points.",
    examples: [
      "But that's not even the best part...",
      "It gets even crazier...",
      "You won't believe what happened next..."
    ],
    psychology: "Exploits variable ratio reinforcement schedules - the same principle that makes gambling addictive."
  },
  {
    name: "Promise Reinforcement",
    category: "Retention",
    description: "Remind viewers of the payoff they'll receive if they keep watching",
    explanation: "Regular reminders of the promised value help viewers justify their time investment and resist the urge to leave.",
    whenToUse: "Every 60-90 seconds, before long explanations, and when transitioning between sections.",
    examples: [
      "Remember, by the end you'll know exactly how to...",
      "This next part is crucial for your success...",
      "Pay attention because this could change your life..."
    ],
    psychology: "Uses commitment and consistency principles - people want to follow through on their initial decision to watch."
  },
  {
    name: "Dream Selling",
    category: "Emotional",
    description: "Paint a picture of the desired outcome to motivate continued watching",
    explanation: "Vivid descriptions of desired futures activate the brain's reward system and create emotional investment in the content.",
    whenToUse: "When presenting solutions, during motivational sections, or before calls-to-action.",
    examples: [
      "Imagine waking up to $1000 in your bank account...",
      "Picture yourself finally being free from...",
      "Visualize having the confidence to..."
    ],
    psychology: "Activates the prefrontal cortex's planning centers and dopamine reward pathways."
  },
  {
    name: "Financial Freedom Appeal",
    category: "Emotional",
    description: "Tap into desires for financial independence and wealth",
    explanation: "Financial security is a fundamental human need. This tactic triggers deep survival instincts and aspirational desires.",
    whenToUse: "In business/entrepreneurship content, when discussing money-making opportunities, or addressing financial stress.",
    examples: [
      "Never worry about money again...",
      "Fire your boss and work for yourself...",
      "Build passive income streams that work while you sleep..."
    ],
    psychology: "Targets Maslow's hierarchy of needs - security and self-actualization levels."
  },
  {
    name: "Authority Establishment",
    category: "Authority",
    description: "Demonstrate expertise and credibility to build trust",
    explanation: "Humans naturally follow authority figures. Establishing expertise makes viewers more likely to accept information and take action.",
    whenToUse: "Early in videos, before making claims, when giving advice, or before calls-to-action.",
    examples: [
      "After helping 10,000+ students...",
      "In my 15 years of experience...",
      "This strategy made me $2 million..."
    ],
    psychology: "Leverages the authority principle from Cialdini's influence psychology."
  },
  {
    name: "Social Proof",
    category: "Social",
    description: "Show that others have succeeded or taken the same action",
    explanation: "Humans are social creatures who look to others for behavioral cues. Social proof reduces risk perception and increases action likelihood.",
    whenToUse: "Before calls-to-action, when presenting strategies, or to overcome objections.",
    examples: [
      "Over 50,000 people have used this method...",
      "My student Sarah made $10k using this...",
      "Thousands of comments say this changed their lives..."
    ],
    psychology: "Based on social proof principle - we determine correct behavior by looking at what others do."
  },
  {
    name: "Scarcity Creation",
    category: "Scarcity",
    description: "Create urgency through limited time or availability",
    explanation: "Scarcity triggers loss aversion - the fear of missing out is stronger than the desire to gain. This creates immediate action pressure.",
    whenToUse: "In calls-to-action, when presenting offers, or to encourage immediate engagement.",
    examples: [
      "Only available for the next 24 hours...",
      "I'm only sharing this with 100 people...",
      "This opportunity won't last forever..."
    ],
    psychology: "Exploits loss aversion bias - losses feel twice as powerful as equivalent gains."
  },
  {
    name: "Future Pacing",
    category: "Retention",
    description: "Create anticipation for upcoming valuable content",
    explanation: "Future pacing maintains engagement by continuously building anticipation for what's coming next in the video.",
    whenToUse: "Throughout videos to maintain retention, before breaks, and when setting up multiple points.",
    examples: [
      "In 3 minutes, I'll show you...",
      "Coming up next, the secret to...",
      "Stick around because at the end..."
    ],
    psychology: "Uses anticipation and dopamine release cycles to maintain attention and interest."
  },
  {
    name: "Pain Point Amplification",
    category: "Emotional",
    description: "Intensify awareness of problems to increase solution desire",
    explanation: "By making problems feel more urgent and painful, viewers become more motivated to seek and accept solutions.",
    whenToUse: "Before presenting solutions, in problem-focused content, or when addressing common struggles.",
    examples: [
      "Every day you wait, you're losing money...",
      "This problem is only getting worse...",
      "Most people suffer with this their entire lives..."
    ],
    psychology: "Leverages loss aversion and pain avoidance motivations that drive human behavior."
  }
];

const categoryIcons = {
  Hook: Target,
  Retention: Clock,
  Emotional: Heart,
  Authority: Crown,
  Social: Users,
  Scarcity: Clock
};

const categoryColors = {
  Hook: "bg-blue-100 text-blue-800",
  Retention: "bg-green-100 text-green-800", 
  Emotional: "bg-red-100 text-red-800",
  Authority: "bg-purple-100 text-purple-800",
  Social: "bg-orange-100 text-orange-800",
  Scarcity: "bg-yellow-100 text-yellow-800"
};

export default function TacticsLibrary() {
  const [searchParams] = useSearchParams();
  const focusTactic = searchParams.get('tactic');
  const [openTactics, setOpenTactics] = useState<string[]>(focusTactic ? [focusTactic] : []);

  const toggleTactic = (tacticName: string) => {
    setOpenTactics(prev => 
      prev.includes(tacticName) 
        ? prev.filter(name => name !== tacticName)
        : [...prev, tacticName]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to PitchArchitect
            </Button>
          </Link>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Viral Tactics Library
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Deep dive into the psychological tactics that make content viral and persuasive
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {tacticData.map((tactic) => {
            const Icon = categoryIcons[tactic.category as keyof typeof categoryIcons] || Target;
            const isOpen = openTactics.includes(tactic.name);
            
            return (
              <Card key={tactic.name} className="shadow-lg">
                <Collapsible open={isOpen} onOpenChange={() => toggleTactic(tactic.name)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="w-6 h-6 text-blue-600" />
                          <div className="text-left">
                            <CardTitle className="text-xl">{tactic.name}</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">{tactic.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={categoryColors[tactic.category as keyof typeof categoryColors]}>
                            {tactic.category}
                          </Badge>
                          <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-2 text-blue-700">Why It Works (Psychology)</h4>
                        <p className="text-gray-700">{tactic.psychology}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2 text-green-700">Full Explanation</h4>
                        <p className="text-gray-700">{tactic.explanation}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2 text-purple-700">When to Use</h4>
                        <p className="text-gray-700">{tactic.whenToUse}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2 text-orange-700">Examples</h4>
                        <ul className="space-y-1">
                          {tactic.examples.map((example, index) => (
                            <li key={index} className="text-gray-700">
                              • "{example}"
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}