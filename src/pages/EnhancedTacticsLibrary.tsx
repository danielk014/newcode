import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Brain, Zap, TrendingUp, Smartphone, Monitor, Search, Clock, Users, Target, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EnhancedTactic {
  name: string;
  category: string;
  description: string;
  platform: string[];
  format: string[];
  strength: number;
  implementation: string;
  examples: {
    shortForm?: string;
    longForm?: string;
  };
  timing: string;
  psychology: string;
  proTips: string[];
}

const enhancedTactics: EnhancedTactic[] = [
  // Platform-Specific Hooks
  {
    name: "3-Second Visual Hook",
    category: "Hook",
    description: "Immediate visual or verbal pattern interrupt designed for short-form content",
    platform: ["TikTok", "Shorts", "Reels"],
    format: ["short"],
    strength: 10,
    implementation: "Start with action, movement, or shocking visual. No introductions, no context - pure hook.",
    examples: {
      shortForm: "*SHOWS RESULT FIRST* This is what $10k looks like... *THEN* Let me show you how I got here in 30 days"
    },
    timing: "0-3 seconds",
    psychology: "Bypasses conscious filtering by hitting visual cortex before prefrontal analysis",
    proTips: [
      "Show the 'after' before the 'before'",
      "Use pattern interrupts like dropping something",
      "Start mid-action, not from beginning"
    ]
  },
  {
    name: "Documentary Authority Hook",
    category: "Hook",
    description: "Establishes credibility and epic scope for long-form content",
    platform: ["YouTube"],
    format: ["long"],
    strength: 9,
    implementation: "Open with credentials, impressive results, or preview of transformation journey",
    examples: {
      longForm: "After analyzing 1,000 hours of footage and interviewing 50 millionaires, I discovered something nobody talks about..."
    },
    timing: "0-15 seconds",
    psychology: "Triggers authority bias and promises high-value information worth time investment",
    proTips: [
      "Stack multiple credibility indicators",
      "Preview the journey, not just the destination",
      "Use specific numbers and timeframes"
    ]
  },
  {
    name: "Loop Structure",
    category: "Retention",
    description: "Shows ending first, creating open loop that must be closed",
    platform: ["TikTok", "Shorts"],
    format: ["short"],
    strength: 9,
    implementation: "Start with the payoff/result, then say 'but first, let me show you how'",
    examples: {
      shortForm: "*Shows incredible result* 'This took 5 minutes. Here's exactly how I did it...'"
    },
    timing: "Full video structure",
    psychology: "Zeigarnik effect - brain can't let go of unfinished tasks",
    proTips: [
      "Make the loop visual, not just verbal",
      "End video by returning to opening shot",
      "Creates rewatch value"
    ]
  },
  {
    name: "Micro-Commitment Ladder",
    category: "Engagement",
    description: "Gets viewers to take tiny actions that lead to bigger commitments",
    platform: ["All"],
    format: ["short", "long"],
    strength: 8,
    implementation: "Start with easy asks (watch for 10 more seconds) before bigger ones (comment, share)",
    examples: {
      shortForm: "Stick your pinky up if you've ever felt this way... Good, now watch this...",
      longForm: "Before we dive in, just think about your biggest challenge with [topic]... Got it? Perfect, because..."
    },
    timing: "Every 30-60 seconds",
    psychology: "Foot-in-the-door technique - small commitments lead to larger ones",
    proTips: [
      "Physical actions create stronger commitment",
      "Make asks feel exclusive or insider-like",
      "Acknowledge compliance to build connection"
    ]
  },
  {
    name: "Platform-Native Language",
    category: "Algorithm",
    description: "Uses platform-specific phrases that signal nativity and boost algorithm",
    platform: ["Platform-specific"],
    format: ["short", "long"],
    strength: 7,
    implementation: "Adapt language to each platform's culture and algorithm preferences",
    examples: {
      shortForm: "TikTok: 'Wait for it...', 'POV:', 'Story time' | Shorts: 'YouTube shorts hack'",
      longForm: "YouTube: 'In this video', 'Chapters below', 'End screen poll'"
    },
    timing: "Throughout",
    psychology: "In-group signaling increases trust and engagement",
    proTips: [
      "Study trending videos for current language",
      "Avoid cross-platform language pollution",
      "Update regularly as platform culture evolves"
    ]
  },
  {
    name: "Dopamine Scheduling",
    category: "Retention",
    description: "Strategic placement of rewards/payoffs to maximize watch time",
    platform: ["All"],
    format: ["short", "long"],
    strength: 9,
    implementation: "Deliver value at increasing intervals: 5s, 15s, 35s, 1m, 2m, 4m...",
    examples: {
      shortForm: "Quick tip at 5s, main value at 20s, bonus at 40s",
      longForm: "Tease at 15s, first value at 1m, big reveal at 3m, implementation at 5m"
    },
    timing: "Fibonacci-like intervals",
    psychology: "Variable ratio reinforcement - most addictive reward schedule",
    proTips: [
      "Front-load value in short-form",
      "Back-load in long-form after hook",
      "Always leave them wanting more"
    ]
  },
  {
    name: "Social Proof Stacking",
    category: "Persuasion",
    description: "Layers multiple forms of social proof for compound effect",
    platform: ["All"],
    format: ["short", "long"],
    strength: 8,
    implementation: "Combine numbers, testimonials, authority endorsements, and peer examples",
    examples: {
      shortForm: "10K people tried this... Forbes featured it... My mom even uses it now",
      longForm: "Start with big number, show testimonial clips, mention media coverage, display results"
    },
    timing: "After problem, before solution",
    psychology: "Bandwagon effect + authority bias + social validation",
    proTips: [
      "Specificity beats generic claims",
      "Video testimonials > text",
      "Unexpected social proof is most powerful"
    ]
  },
  {
    name: "Transformation Visualization",
    category: "Emotional",
    description: "Helps viewers see themselves achieving the desired outcome",
    platform: ["All"],
    format: ["short", "long"],
    strength: 9,
    implementation: "Use 'you' language, present tense, sensory details to make transformation feel real",
    examples: {
      shortForm: "In 30 days, you're waking up to notifications of sales while you slept",
      longForm: "Imagine opening your laptop, seeing those numbers, feeling that relief washing over you..."
    },
    timing: "Before solution reveal",
    psychology: "Mental rehearsal activates same neural pathways as actual experience",
    proTips: [
      "Use all 5 senses in descriptions",
      "Make it specific to their situation",
      "Connect to deeper emotional needs"
    ]
  },
  {
    name: "Controversy Sandwich",
    category: "Hook",
    description: "Controversial statement softened by context to maximize engagement without alienation",
    platform: ["YouTube", "TikTok"],
    format: ["short", "long"],
    strength: 8,
    implementation: "Bold claim → 'Let me explain' → Nuanced take that most agree with",
    examples: {
      shortForm: "College is a scam... for 90% of people. Here's how to know if you're in the 10%",
      longForm: "Everything you know about [topic] is wrong... well, not everything, but this one thing changes everything"
    },
    timing: "Opening hook or major transitions",
    psychology: "Triggers emotional response then provides relief through agreement",
    proTips: [
      "The explanation must genuinely soften the claim",
      "Use data to support controversial points",
      "End on unifying message"
    ]
  },
  {
    name: "Pattern Teaching",
    category: "Educational",
    description: "Teaches viewers to recognize patterns rather than memorize information",
    platform: ["All"],
    format: ["long"],
    strength: 9,
    implementation: "Show multiple examples of same principle, help them see the pattern",
    examples: {
      longForm: "Notice how all three successful campaigns did X? That's not coincidence. Here's the pattern..."
    },
    timing: "During teaching sections",
    psychology: "Pattern recognition is how humans naturally learn and creates 'aha' moments",
    proTips: [
      "Use visual aids to highlight patterns",
      "Test their pattern recognition",
      "Connect patterns to their goals"
    ]
  },
  {
    name: "Curiosity Stacking",
    category: "Retention",
    description: "Opens multiple curiosity loops that resolve at different times",
    platform: ["YouTube"],
    format: ["long"],
    strength: 9,
    implementation: "Tease 3-5 different payoffs throughout video, resolve them strategically",
    examples: {
      longForm: "I'll show you the $100k mistake, the weird trick that fixed it, and the tool that automated everything..."
    },
    timing: "Open all in first 30s, resolve throughout",
    psychology: "Multiple open loops create cognitive tension that demands resolution",
    proTips: [
      "Number your loops for clarity",
      "Resolve in unexpected order",
      "Save best for last"
    ]
  },
  {
    name: "Objection Preemption",
    category: "Persuasion",
    description: "Addresses concerns before viewers can form them",
    platform: ["All"],
    format: ["short", "long"],
    strength: 8,
    implementation: "Acknowledge likely objections and provide immediate counters",
    examples: {
      shortForm: "I know what you're thinking - 'This won't work for me because...' But watch this",
      longForm: "Now you might be wondering 'What if I don't have...' That's exactly why I'm showing you this method"
    },
    timing: "Right before they'd naturally object",
    psychology: "Reduces cognitive dissonance and builds trust through mind-reading effect",
    proTips: [
      "Address top 3 objections minimum",
      "Use exact words they'd think",
      "Provide proof, not just claims"
    ]
  },
  {
    name: "Identity Alignment",
    category: "Emotional",
    description: "Connects desired action with viewer's self-image",
    platform: ["All"],
    format: ["short", "long"],
    strength: 9,
    implementation: "Frame actions as expressions of who they are, not just what they do",
    examples: {
      shortForm: "If you're the type of person who takes action, you'll love this",
      longForm: "This is for the 1% who actually implement, not just watch. I know that's you because..."
    },
    timing: "Before major asks or CTAs",
    psychology: "People act consistently with their identity more than external motivations",
    proTips: [
      "Use 'type of person' language",
      "Reference their past positive actions",
      "Create exclusive identity groups"
    ]
  },
  {
    name: "Rapid Fire Value",
    category: "Retention",
    description: "Delivers multiple quick wins to build momentum",
    platform: ["TikTok", "Shorts"],
    format: ["short"],
    strength: 8,
    implementation: "5-7 quick tips/insights in rapid succession with no fluff",
    examples: {
      shortForm: "5 psychology tricks in 30 seconds: 1) Mirror their body language 2) Use their name 3)..."
    },
    timing: "Middle section of short-form",
    psychology: "Cognitive overload prevents analytical thinking, increases perceived value",
    proTips: [
      "Number each point clearly",
      "Use visual changes for each",
      "End with 'Save this for later'"
    ]
  },
  {
    name: "Strategic Vulnerability",
    category: "Trust",
    description: "Shares failures or weaknesses to build authentic connection",
    platform: ["All"],
    format: ["short", "long"],
    strength: 8,
    implementation: "Share specific failure, what you learned, how viewer can avoid it",
    examples: {
      shortForm: "I lost $50k learning this lesson so you don't have to",
      longForm: "Let me show you the embarrassing mistakes I made before figuring this out..."
    },
    timing: "After establishing some credibility",
    psychology: "Pratfall effect - competent people become more likeable after showing flaws",
    proTips: [
      "Failure must have clear lesson",
      "Show transformation after failure",
      "Don't overdo vulnerability"
    ]
  }
];

const EnhancedTacticsLibrary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');

  const categories = ['all', 'Hook', 'Retention', 'Emotional', 'Persuasion', 'Algorithm', 'Educational', 'Trust', 'Engagement'];
  const platforms = ['all', 'YouTube', 'TikTok', 'Shorts', 'Reels'];
  const formats = ['all', 'short', 'long'];

  const filteredTactics = enhancedTactics.filter(tactic => {
    const matchesSearch = tactic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tactic.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tactic.category === selectedCategory;
    const matchesPlatform = selectedPlatform === 'all' || tactic.platform.includes(selectedPlatform);
    const matchesFormat = selectedFormat === 'all' || tactic.format.includes(selectedFormat);
    
    return matchesSearch && matchesCategory && matchesPlatform && matchesFormat;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Hook': return <Zap className="w-4 h-4" />;
      case 'Retention': return <Clock className="w-4 h-4" />;
      case 'Emotional': return <Target className="w-4 h-4" />;
      case 'Algorithm': return <TrendingUp className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Hook': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Retention': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Emotional': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Persuasion': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Algorithm': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Educational': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'Trust': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'Engagement': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Script Generator
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Enhanced Script Writing Tactics Library</h1>
          </div>
          
          <p className="text-muted-foreground">
            Master the psychology of viral content with platform-specific tactics and implementation guides
          </p>
        </div>

        {/* Filters */}
        <Card className="glass-effect border-border/50 mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search tactics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-input border border-border rounded-md"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="px-3 py-2 bg-input border border-border rounded-md"
              >
                {platforms.map(platform => (
                  <option key={platform} value={platform}>
                    {platform === 'all' ? 'All Platforms' : platform}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="px-3 py-2 bg-input border border-border rounded-md"
              >
                {formats.map(format => (
                  <option key={format} value={format}>
                    {format === 'all' ? 'All Formats' : format === 'short' ? 'Short-form' : 'Long-form'}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredTactics.length} of {enhancedTactics.length} tactics
            </div>
          </CardContent>
        </Card>

        {/* Tactics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTactics.map((tactic, index) => (
            <Card key={index} className="glass-effect border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{tactic.name}</h3>
                    <p className="text-sm text-muted-foreground">{tactic.description}</p>
                  </div>
                  <Badge className={`${getCategoryColor(tactic.category)} flex items-center gap-1`}>
                    {getCategoryIcon(tactic.category)}
                    {tactic.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Strength Indicator */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Strength:</span>
                  <div className="flex gap-1">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-4 rounded ${
                          i < tactic.strength ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">{tactic.strength}/10</span>
                </div>

                {/* Platform & Format Tags */}
                <div className="flex flex-wrap gap-2">
                  {tactic.platform.map(platform => (
                    <Badge key={platform} variant="outline" className="text-xs">
                      {platform === 'TikTok' ? <Smartphone className="w-3 h-3 mr-1" /> : <Monitor className="w-3 h-3 mr-1" />}
                      {platform}
                    </Badge>
                  ))}
                  {tactic.format.map(format => (
                    <Badge key={format} variant="secondary" className="text-xs">
                      {format === 'short' ? 'Short-form' : 'Long-form'}
                    </Badge>
                  ))}
                </div>

                <Tabs defaultValue="implementation" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 glass-effect">
                    <TabsTrigger value="implementation">How To</TabsTrigger>
                    <TabsTrigger value="examples">Examples</TabsTrigger>
                    <TabsTrigger value="psychology">Psychology</TabsTrigger>
                    <TabsTrigger value="tips">Pro Tips</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="implementation" className="mt-4">
                    <div className="space-y-2">
                      <p className="text-sm">{tactic.implementation}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>Best timing: {tactic.timing}</span>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="examples" className="mt-4">
                    <div className="space-y-3">
                      {tactic.examples.shortForm && (
                        <div className="p-3 bg-muted/20 rounded-lg">
                          <Badge className="text-xs mb-2">Short-form</Badge>
                          <p className="text-sm italic">"{tactic.examples.shortForm}"</p>
                        </div>
                      )}
                      {tactic.examples.longForm && (
                        <div className="p-3 bg-muted/20 rounded-lg">
                          <Badge className="text-xs mb-2">Long-form</Badge>
                          <p className="text-sm italic">"{tactic.examples.longForm}"</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="psychology" className="mt-4">
                    <div className="p-4 bg-muted/10 rounded-lg">
                      <Brain className="w-4 h-4 text-primary mb-2" />
                      <p className="text-sm">{tactic.psychology}</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="tips" className="mt-4">
                    <ul className="space-y-2">
                      {tactic.proTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No results message */}
        {filteredTactics.length === 0 && (
          <Card className="glass-effect border-border/50 p-12 text-center">
            <CardContent>
              <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tactics found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search term</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EnhancedTacticsLibrary;