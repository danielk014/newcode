import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ArrowLeft, Brain, Target, Heart, Crown, Clock, Users } from 'lucide-react';
import { Link, useSearchParams, useLocation, useNavigate } from 'react-router-dom';

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
  },
  {
    name: "Story Loop Opening",
    category: "Hook",
    description: "Start a compelling story but don't finish it until later in the content",
    explanation: "Open story loops create psychological tension that keeps viewers engaged until the story is resolved. The brain craves closure and will stay engaged to get it.",
    whenToUse: "At the beginning of content, when introducing case studies, or when you need to maintain attention across long sections.",
    examples: [
      "Three months ago, I was broke. By the end of this video, I'll show you exactly how I changed that...",
      "My client was about to lose everything until she discovered this one thing...",
      "I almost gave up on my business until this happened..."
    ],
    psychology: "Exploits the Zeigarnik Effect - our tendency to remember uncompleted tasks better than completed ones."
  },
  {
    name: "Controversy Creation",
    category: "Hook",
    description: "Present an opposing or unpopular viewpoint to generate strong reactions",
    explanation: "Controversial statements trigger emotional responses and force engagement. Even negative emotions can increase retention and sharing.",
    whenToUse: "When your audience holds strong conventional beliefs, to differentiate from competitors, or to create viral potential.",
    examples: [
      "Everyone tells you to follow your passion - that's terrible advice",
      "The fitness industry has been lying to you about weight loss",
      "College is the biggest scam in America"
    ],
    psychology: "Activates fight-or-flight responses and cognitive dissonance, making content memorable and shareable."
  },
  {
    name: "Reciprocity Trigger",
    category: "Persuasion",
    description: "Give value first to create an obligation for the viewer to reciprocate",
    explanation: "When someone receives something of value, they feel psychologically obligated to give something back. This increases compliance with requests.",
    whenToUse: "Before asking for engagement, subscriptions, or purchases. Also effective in building long-term loyalty.",
    examples: [
      "I'm giving you my $500 course for free because I want to help you succeed",
      "Here's my personal phone number - text me if you need help",
      "I'll personally review your business plan if you comment below"
    ],
    psychology: "Based on the reciprocity principle - one of the most powerful psychological drivers of human behavior."
  },
  {
    name: "Bandwagon Effect",
    category: "Social",
    description: "Show that a large group is already taking the desired action",
    explanation: "People naturally want to be part of the winning team or popular choice. This reduces perceived risk and increases action probability.",
    whenToUse: "When you have significant user numbers, trending topics, or when launching new initiatives.",
    examples: [
      "Join 100,000+ entrepreneurs who've already transformed their business",
      "This method is going viral - everyone's talking about it",
      "Be part of the movement that's changing the industry"
    ],
    psychology: "Leverages herding behavior and social validation needs inherent in human psychology."
  },
  {
    name: "Urgency Stacking",
    category: "Scarcity",
    description: "Layer multiple time-sensitive elements to maximize immediate action",
    explanation: "Multiple urgent factors create compounding pressure that makes inaction feel increasingly costly with each passing moment.",
    whenToUse: "In sales situations, limited-time offers, or when you need immediate engagement rather than delayed action.",
    examples: [
      "Price goes up in 24 hours, only 50 spots left, and registration closes Friday",
      "Market conditions are changing fast, and my calendar is filling up this week",
      "This opportunity expires soon, and I can only help the first 100 people"
    ],
    psychology: "Combines multiple scarcity triggers to overwhelm analytical thinking and promote emotional decision-making."
  },
  {
    name: "Vulnerability Sharing",
    category: "Emotional",
    description: "Share personal struggles or failures to build trust and connection",
    explanation: "Vulnerability creates authentic connection and makes the speaker more relatable. It lowers psychological barriers and increases trust.",
    whenToUse: "When building rapport, before making big claims, or when your audience seems skeptical or distant.",
    examples: [
      "I failed at this 7 times before I figured it out",
      "I was embarrassed to admit I was struggling with this",
      "Here's the mistake that cost me $50,000..."
    ],
    psychology: "Triggers empathy responses and the fundamental attribution error - we relate more to vulnerable people."
  },
  {
    name: "Curiosity Gap Widening",
    category: "Hook",
    description: "Progressively reveal information while maintaining mystery about the core revelation",
    explanation: "By giving partial information and then pausing, you create an information gap that the brain desperately wants to fill.",
    whenToUse: "Throughout content to maintain engagement, especially during transitions or before breaks in longer content.",
    examples: [
      "The third secret is the most powerful, but first you need to understand...",
      "What happened next shocked even me, but let me set the stage...",
      "This single word changed everything, and I'll reveal it in just a moment..."
    ],
    psychology: "Exploits the brain's prediction error system and our natural drive to complete patterns and fill knowledge gaps."
  }
];

const categoryIcons = {
  Hook: Target,
  Retention: Clock,
  Emotional: Heart,
  Authority: Crown,
  Social: Users,
  Scarcity: Clock,
  Persuasion: Brain
};

const categoryColors = {
  Hook: "bg-blue-100 text-blue-800",
  Retention: "bg-green-100 text-green-800", 
  Emotional: "bg-red-100 text-red-800",
  Authority: "bg-purple-100 text-purple-800",
  Social: "bg-orange-100 text-orange-800",
  Scarcity: "bg-yellow-100 text-yellow-800",
  Persuasion: "bg-indigo-100 text-indigo-800"
};

export default function TacticsLibrary() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const focusTactic = searchParams.get('tactic');
  const [openTactics, setOpenTactics] = useState<string[]>(focusTactic ? [focusTactic] : []);
  
  // Get the origin path from navigation state, default to home if not available
  const originPath = (location.state as any)?.from || '/';

  const toggleTactic = (tacticName: string) => {
    setOpenTactics(prev => 
      prev.includes(tacticName) 
        ? prev.filter(name => name !== tacticName)
        : [...prev, tacticName]
    );
  };

  const handleReturn = () => {
    const state = (location.state as any);
    if (state?.currentStep !== undefined && state?.analysis) {
      // Navigate back with state restoration
      navigate(originPath, { 
        state: { 
          restoreStep: state.currentStep, 
          restoreAnalysis: state.analysis 
        } 
      });
    } else {
      navigate(originPath);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, tacticName: string) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      toggleTactic(tacticName);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button 
            variant="outline" 
            className="mb-4"
            onClick={handleReturn}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return
          </Button>
          
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
                    <CardHeader 
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onKeyDown={(e) => handleKeyDown(e, tactic.name)}
                    >
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
