
export interface PsychologicalTactic {
  name: string;
  category: 'Hook' | 'Narrative' | 'Persuasion' | 'Engagement' | 'Emotional' | 'Retention' | 'Monetization' | 'Algorithm' | 'Authority';
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
  },
  
  // Additional Synthesized Tactics
  {
    name: "Controversy Creation",
    category: "Hook",
    description: "Present an opposing or unpopular viewpoint to generate strong reactions",
    effectiveness: 87,
    examples: ["Everyone tells you to follow your passion - that's terrible advice", "The fitness industry has been lying to you", "College is the biggest scam in America"],
    timing: "Video openers"
  },
  {
    name: "Bandwagon Effect",
    category: "Persuasion",
    description: "Show that a large group is already taking the desired action",
    effectiveness: 81,
    examples: ["Join 100,000+ entrepreneurs who've already transformed their business", "This method is going viral - everyone's talking about it", "Be part of the movement that's changing the industry"],
    timing: "Call to action"
  },
  {
    name: "Urgency Stacking",
    category: "Persuasion",
    description: "Layer multiple time-sensitive elements to maximize immediate action",
    effectiveness: 84,
    examples: ["Price goes up in 24 hours, only 50 spots left, and registration closes Friday", "Market conditions are changing fast, and my calendar is filling up this week", "This opportunity expires soon, and I can only help the first 100 people"],
    timing: "Sales situations"
  },
  {
    name: "Vulnerability Sharing",
    category: "Emotional",
    description: "Share personal struggles or failures to build trust and connection",
    effectiveness: 79,
    examples: ["I failed at this 7 times before I figured it out", "I was embarrassed to admit I was struggling with this", "Here's the mistake that cost me $50,000"],
    timing: "Rapport building"
  },
  {
    name: "Curiosity Gap Widening",
    category: "Hook",
    description: "Progressively reveal information while maintaining mystery about the core revelation",
    effectiveness: 86,
    examples: ["The third secret is the most powerful, but first you need to understand", "What happened next shocked even me, but let me set the stage", "This single word changed everything, and I'll reveal it in just a moment"],
    timing: "Throughout content"
  },
  {
    name: "Step-by-Step Blueprint",
    category: "Retention",
    description: "Presents actionable frameworks for predictable outcomes",
    effectiveness: 83,
    examples: ["Here's my exact 5-step framework that generated $100k", "Follow this blueprint and you'll see results in 30 days", "Step 1: Do this first, Step 2: Then this, Step 3: Finally this"],
    timing: "Educational content"
  },
  {
    name: "Call to Action",
    category: "Monetization",
    description: "Directs viewers to newsletters, software, or submission forms promising further secrets or access",
    effectiveness: 76,
    examples: ["Join my newsletter for the advanced strategies I can't share on YouTube", "Download my free checklist that breaks this down step-by-step", "Apply for my program if you're ready to take this seriously"],
    timing: "End of videos"
  },
  
  // Advanced Psychological Tactics
  {
    name: "Loss Aversion",
    category: "Emotional",
    description: "Emphasize what viewers will lose by not taking action",
    effectiveness: 89,
    examples: ["Every day you wait, you're losing money", "While you hesitate, your competitors are getting ahead", "Don't let this opportunity slip away"],
    timing: "Before call to action"
  },
  {
    name: "Anchoring Bias",
    category: "Persuasion",
    description: "Set a high reference point to make your offer seem reasonable",
    effectiveness: 82,
    examples: ["This normally costs $2000, but today only $297", "Most people spend years learning this, you'll master it in weeks", "While others charge $500/hour, I'm giving this away free"],
    timing: "Before revealing price or value"
  },
  {
    name: "Commitment Consistency",
    category: "Persuasion",
    description: "Get small commitments that lead to bigger ones",
    effectiveness: 84,
    examples: ["If you agree that success requires action, then...", "Since you've already invested time watching this, why not...", "You said you wanted to change, so here's step one"],
    timing: "Building toward major request"
  },
  {
    name: "Fear of Missing Out (FOMO)",
    category: "Emotional",
    description: "Tap into fear of being left behind socially or professionally",
    effectiveness: 87,
    examples: ["Everyone in your industry is already doing this", "Don't be the last to discover this", "While you're thinking, others are already succeeding"],
    timing: "Social proof sections"
  },
  {
    name: "Nostalgia Hook",
    category: "Emotional",
    description: "Connect with positive memories to create emotional investment",
    effectiveness: 76,
    examples: ["Remember when things were simpler?", "This takes me back to when I first started", "Just like the good old days, but better"],
    timing: "Opening or storytelling"
  },
  {
    name: "Contrast Principle",
    category: "Hook",
    description: "Show dramatic before/after differences to highlight transformation",
    effectiveness: 85,
    examples: ["From zero to millionaire in 12 months", "The difference between struggling and thriving", "What separates winners from losers"],
    timing: "Problem/solution presentation"
  },
  {
    name: "Halo Effect",
    category: "Authority",
    description: "Use one impressive achievement to elevate everything else",
    effectiveness: 81,
    examples: ["As someone who built a $10M company", "Featured in Forbes, now I'll show you", "After speaking at Harvard, here's what I learned"],
    timing: "Credibility establishment"
  },
  {
    name: "Repetition Effect",
    category: "Retention",
    description: "Repeat key messages to increase believability and memory",
    effectiveness: 78,
    examples: ["This is important - really important", "Remember this, because this changes everything", "I'll say it again because it bears repeating"],
    timing: "Key points emphasis"
  },
  {
    name: "Exclusive Access",
    category: "Persuasion",
    description: "Make viewers feel specially chosen or privileged",
    effectiveness: 83,
    examples: ["I'm only sharing this with my subscribers", "This is insider information", "You're getting VIP access to this"],
    timing: "Value delivery"
  },
  {
    name: "Behind the Scenes",
    category: "Engagement",
    description: "Show the process, struggles, and journey behind success",
    effectiveness: 80,
    examples: ["Here's what really happened behind closed doors", "Let me pull back the curtain", "The untold story of how this really works"],
    timing: "Storytelling sections"
  },
  {
    name: "Trend Riding",
    category: "Algorithm",
    description: "Capitalize on current trends and viral topics",
    effectiveness: 79,
    examples: ["Everyone's talking about this trend, but here's what they're missing", "The viral method that actually works", "Why this trending topic matters for your business"],
    timing: "Content hooks"
  },
  {
    name: "Community Building",
    category: "Engagement",
    description: "Create sense of belonging and shared identity",
    effectiveness: 77,
    examples: ["Join thousands of entrepreneurs like yourself", "You're part of an exclusive group who gets this", "Welcome to the community of action-takers"],
    timing: "Call to action"
  },
  {
    name: "Expert Endorsement",
    category: "Authority",
    description: "Leverage third-party credibility and recommendations",
    effectiveness: 85,
    examples: ["As recommended by industry leaders", "Top experts agree this is the future", "Even my competitors admit this works"],
    timing: "Credibility building"
  },
  {
    name: "Reverse Psychology",
    category: "Hook",
    description: "Tell people NOT to do something to increase desire",
    effectiveness: 81,
    examples: ["Don't try this unless you're serious", "This isn't for everyone", "Please don't share this video"],
    timing: "Content opening"
  },
  {
    name: "Cliffhanger Technique",
    category: "Retention",
    description: "End sections on suspense to maintain engagement",
    effectiveness: 84,
    examples: ["But then something unexpected happened", "The shocking twist comes next", "What I discovered next will blow your mind"],
    timing: "Section transitions"
  },
  {
    name: "Metaphor Power",
    category: "Engagement",
    description: "Use powerful comparisons to explain complex ideas simply",
    effectiveness: 75,
    examples: ["Building a business is like building a house", "This strategy is your secret weapon", "Think of this as your roadmap to success"],
    timing: "Concept explanation"
  },
  {
    name: "Personal Revelation",
    category: "Emotional",
    description: "Share intimate details to create deep connection",
    effectiveness: 82,
    examples: ["I've never told anyone this before", "This is deeply personal, but", "Here's my most embarrassing failure"],
    timing: "Vulnerable moments"
  },
  {
    name: "Challenge Framework",
    category: "Engagement",
    description: "Dare the audience to take action or prove something",
    effectiveness: 78,
    examples: ["I challenge you to try this for 30 days", "Prove me wrong if you can", "Here's my dare to you"],
    timing: "Call to action"
  },
  {
    name: "Newsjacking",
    category: "Hook",
    description: "Comment on current events to gain relevance and attention",
    effectiveness: 73,
    examples: ["With everything happening in the news", "This recent event proves my point", "While everyone's focused on [current event], here's what really matters"],
    timing: "Content opening"
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
