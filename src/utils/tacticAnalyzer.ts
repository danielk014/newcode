
export interface PsychologicalTactic {
  name: string;
  category: 'Hook' | 'Narrative' | 'Persuasion' | 'Engagement' | 'Emotional' | 'Retention' | 'Monetization' | 'Algorithm';
  description: string;
  effectiveness: number;
  examples: string[];
  timing?: string;
}

export const psychologicalTactics: PsychologicalTactic[] = [
  // Hook Tactics (DanielKCI's Proven Methods)
  {
    name: "Information Gap Hook",
    category: "Hook",
    description: "Creates curiosity by revealing partial information that viewers must stay to learn",
    effectiveness: 95,
    examples: ["What happens when...", "You won't believe what...", "The secret that nobody talks about..."],
    timing: "0-3 seconds"
  },
  {
    name: "Climax First",
    category: "Hook", 
    description: "Start with the most interesting moment or end result to grab immediate attention",
    effectiveness: 92,
    examples: ["This is the moment everything changed", "Look at this result first", "Here's what happened..."],
    timing: "0-3 seconds"
  },
  {
    name: "Bold Statement Hook",
    category: "Hook",
    description: "Make a controversial or surprising statement that demands attention",
    effectiveness: 88,
    examples: ["Everything you know is wrong", "This will destroy your business", "Stop doing this immediately"],
    timing: "0-3 seconds"
  },
  
  // Retention Tactics (Micro-Hooks)
  {
    name: "Micro-Hook Escalation",
    category: "Retention",
    description: "Use escalating phrases every 15-30 seconds to maintain attention",
    effectiveness: 90,
    examples: ["But wait, it gets worse...", "Here's the crazy part...", "The plot twist?"],
    timing: "Every 15-30 seconds"
  },
  {
    name: "Pattern Interrupt",
    category: "Retention",
    description: "Sudden changes in tone, pace, or topic to reset viewer attention",
    effectiveness: 85,
    examples: ["Hold on, let me show you this", "Actually, forget what I just said", "This changes everything"],
    timing: "Throughout content"
  },
  {
    name: "Promise Reinforcement",
    category: "Retention",
    description: "Remind viewers of the payoff they'll receive if they keep watching",
    effectiveness: 82,
    examples: ["Remember, by the end you'll know...", "I'm about to reveal...", "The answer is coming up"],
    timing: "Mid-content"
  },

  // Greed & Desire Triggers
  {
    name: "Dream Selling",
    category: "Emotional",
    description: "Paint a picture of the desired outcome to motivate continued watching",
    effectiveness: 88,
    examples: ["Imagine making $10k per month", "Picture yourself financially free", "What if you could..."],
    timing: "Throughout content"
  },
  {
    name: "Financial Freedom Appeal",
    category: "Emotional",
    description: "Tap into desires for financial independence and wealth",
    effectiveness: 85,
    examples: ["Passive income streams", "Financial freedom blueprint", "Make money while you sleep"],
    timing: "Problem/Solution sections"
  },
  {
    name: "Status Improvement",
    category: "Emotional",
    description: "Appeal to desires for social status and recognition",
    effectiveness: 80,
    examples: ["Become the expert", "Build your influence", "Get the recognition you deserve"],
    timing: "Value delivery"
  },

  // Algorithm Optimization Tactics
  {
    name: "Engagement Bait",
    category: "Algorithm",
    description: "Strategically request specific engagement actions to boost algorithm performance",
    effectiveness: 78,
    examples: ["Comment your biggest takeaway", "Share this with someone who needs it", "Save this for later"],
    timing: "Throughout and end"
  },
  {
    name: "Watch Time Optimization",
    category: "Algorithm",
    description: "Structure content to maximize average view duration",
    effectiveness: 85,
    examples: ["More on that in a minute", "Before I reveal this...", "First, let me show you..."],
    timing: "Throughout content"
  },
  {
    name: "Platform Collaboration",
    category: "Algorithm",
    description: "Create content that aligns with platform algorithm preferences",
    effectiveness: 82,
    examples: ["What's trending integration", "Platform-specific formatting", "Trending hashtag usage"],
    timing: "Content structure"
  },

  // Monetization Tactics
  {
    name: "Soft-Sell Integration",
    category: "Monetization",
    description: "Naturally integrate paid offerings without being salesy",
    effectiveness: 75,
    examples: ["Like my student Sarah who...", "In my advanced course I show...", "I created a free checklist..."],
    timing: "Value delivery"
  },
  {
    name: "Authority Building",
    category: "Monetization",
    description: "Establish credibility and expertise to support monetization",
    effectiveness: 80,
    examples: ["After helping 10,000 students", "From my 5 years of experience", "My proven system"],
    timing: "Throughout content"
  },
  {
    name: "Success Story Leverage",
    category: "Monetization",
    description: "Use student/client success stories to demonstrate value",
    effectiveness: 83,
    examples: ["Sarah made $10k in month one", "My student went from zero to...", "Here's what happened when..."],
    timing: "Social proof sections"
  },

  // Proven Format Tactics
  {
    name: "Competition Format",
    category: "Narrative",
    description: "Use competition-based structures proven since ancient times",
    effectiveness: 90,
    examples: ["Who will win?", "The ultimate challenge", "Battle of the..."],
    timing: "Main content structure"
  },
  {
    name: "Transformation Arc",
    category: "Narrative",
    description: "Show clear before/after journey that viewers can relate to",
    effectiveness: 87,
    examples: ["From broke to millionaire", "Zero to hero journey", "Complete transformation"],
    timing: "Overall structure"
  },
  {
    name: "Problem-Solution Bridge",
    category: "Narrative",
    description: "Create relatable problems then provide clear solutions",
    effectiveness: 85,
    examples: ["Here's your problem", "The solution is simple", "This fixes everything"],
    timing: "Middle section"
  },

  // Enhanced versions of existing tactics
  {
    name: "Curiosity Gap",
    category: "Hook", 
    description: "Creates information gaps that viewers feel compelled to fill",
    effectiveness: 88,
    examples: ["The secret that nobody talks about", "What I'm about to show you will..."],
    timing: "0-15 seconds"
  },
  {
    name: "Social Proof",
    category: "Persuasion",
    description: "Uses testimonials and success stories to build credibility",
    effectiveness: 85,
    examples: ["10,000+ students have used this", "My client went from zero to..."],
    timing: "Throughout content"
  },
  {
    name: "Scarcity",
    category: "Persuasion",
    description: "Creates urgency through limited availability or time",
    effectiveness: 82,
    examples: ["Only for the first 100 people", "This offer expires at midnight"],
    timing: "Call to action"
  },
  {
    name: "Future Pacing",
    category: "Narrative",
    description: "Helps viewers visualize their desired future state",
    effectiveness: 78,
    examples: ["Imagine waking up tomorrow and...", "Picture yourself in 6 months..."],
    timing: "Value delivery"
  },
  {
    name: "Pain Point Amplification",
    category: "Emotional",
    description: "Identifies and amplifies current frustrations to create urgency",
    effectiveness: 85,
    examples: ["Tired of struggling with...", "Fed up with not seeing results?"],
    timing: "Problem identification"
  },
  {
    name: "Direct Address",
    category: "Engagement",
    description: "Speaks directly to viewer creating personal connection",
    effectiveness: 75,
    examples: ["You've probably experienced this", "Here's what you need to know"],
    timing: "Throughout content"
  },
  {
    name: "Open Loops",
    category: "Narrative",
    description: "Starts stories without immediate resolution to maintain attention",
    effectiveness: 73,
    examples: ["I'll tell you how I discovered this in a moment", "More on that later"],
    timing: "Throughout content"
  },
  {
    name: "Reciprocity",
    category: "Persuasion",
    description: "Provides value first to create obligation to reciprocate",
    effectiveness: 77,
    examples: ["I'm giving you this for free", "Here's a valuable tip before we continue"],
    timing: "Value delivery"
  }
];

export const analyzeTactics = (script: string): PsychologicalTactic[] => {
  const foundTactics: PsychologicalTactic[] = [];
  
  psychologicalTactics.forEach(tactic => {
    const hasExamples = tactic.examples.some(example => {
      const keywords = example.toLowerCase().split(' ').slice(0, 3);
      return keywords.some(keyword => script.toLowerCase().includes(keyword));
    });
    
    if (hasExamples) {
      foundTactics.push(tactic);
    }
  });
  
  return foundTactics;
};

export const synthesizeTactics = (script1Tactics: PsychologicalTactic[], script2Tactics: PsychologicalTactic[]): PsychologicalTactic[] => {
  const allTactics = [...script1Tactics, ...script2Tactics];
  const uniqueTactics = allTactics.filter((tactic, index, self) => 
    index === self.findIndex(t => t.name === tactic.name)
  );
  
  return uniqueTactics.sort((a, b) => b.effectiveness - a.effectiveness);
};

export const getViralFormats = () => [
  {
    name: "Competition Format",
    description: "Based on proven formats like Fear Factor, Survivor - competition has worked since Roman times",
    structure: "Setup Challenge → Show Stakes → Document Journey → Reveal Winner → Lesson/Takeaway"
  },
  {
    name: "Transformation Journey",
    description: "Before/after content showing clear progression and change",
    structure: "Starting Point → Catalyst → Struggle → Breakthrough → New State → Lessons"
  },
  {
    name: "Teaching Format",
    description: "Educational content that builds authority while providing value",
    structure: "Problem → Solution Preview → Step-by-Step → Examples → Advanced Tips → CTA"
  },
  {
    name: "Trend Jack Format",
    description: "Rapid response to trending topics with unique angle",
    structure: "Trend Reference → Your Angle → Value Add → Personal Take → CTA"
  },
  {
    name: "Success Story Format",
    description: "Case study format highlighting specific results",
    structure: "Result First → Background → Challenge → Strategy → Implementation → Results → Replication"
  }
];
