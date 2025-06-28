
export interface PsychologicalTactic {
  name: string;
  category: 'Hook' | 'Narrative' | 'Persuasion' | 'Engagement' | 'Emotional' | 'Retention';
  description: string;
  effectiveness: number;
  examples: string[];
}

export const psychologicalTactics: PsychologicalTactic[] = [
  {
    name: "Pattern Interrupt",
    category: "Hook",
    description: "Breaks expected patterns to capture immediate attention",
    effectiveness: 92,
    examples: ["Stop what you're doing right now", "Forget everything you know about..."]
  },
  {
    name: "Curiosity Gap",
    category: "Hook", 
    description: "Creates information gaps that viewers feel compelled to fill",
    effectiveness: 88,
    examples: ["The secret that nobody talks about", "What I'm about to show you will..."]
  },
  {
    name: "Social Proof",
    category: "Persuasion",
    description: "Uses testimonials and success stories to build credibility",
    effectiveness: 85,
    examples: ["10,000+ students have used this", "My client went from zero to..."]
  },
  {
    name: "Scarcity",
    category: "Persuasion",
    description: "Creates urgency through limited availability or time",
    effectiveness: 82,
    examples: ["Only for the first 100 people", "This offer expires at midnight"]
  },
  {
    name: "Authority",
    category: "Persuasion",
    description: "Establishes expertise and credibility through credentials",
    effectiveness: 80,
    examples: ["As someone who's helped 1000s", "After 10 years in the industry"]
  },
  {
    name: "Future Pacing",
    category: "Narrative",
    description: "Helps viewers visualize their desired future state",
    effectiveness: 78,
    examples: ["Imagine waking up tomorrow and...", "Picture yourself in 6 months..."]
  },
  {
    name: "Pain Point",
    category: "Emotional",
    description: "Identifies and amplifies current frustrations",
    effectiveness: 85,
    examples: ["Tired of struggling with...", "Fed up with not seeing results?"]
  },
  {
    name: "Direct Address",
    category: "Engagement",
    description: "Speaks directly to viewer creating personal connection",
    effectiveness: 75,
    examples: ["You've probably experienced this", "Here's what you need to know"]
  },
  {
    name: "Open Loops",
    category: "Narrative",
    description: "Starts stories without immediate resolution to maintain attention",
    effectiveness: 73,
    examples: ["I'll tell you how I discovered this in a moment", "More on that later"]
  },
  {
    name: "Reciprocity",
    category: "Persuasion",
    description: "Provides value first to create obligation to reciprocate",
    effectiveness: 77,
    examples: ["I'm giving you this for free", "Here's a valuable tip before we continue"]
  },
  {
    name: "Fear Appeal",
    category: "Emotional",
    description: "Uses fear of missing out or consequences to motivate action",
    effectiveness: 70,
    examples: ["Don't let another year go by", "What if you keep doing what you're doing?"]
  },
  {
    name: "Aspirational Imagery",
    category: "Emotional",
    description: "Paints vivid pictures of desired outcomes",
    effectiveness: 72,
    examples: ["Living your dream life", "Having the freedom to..."]
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
