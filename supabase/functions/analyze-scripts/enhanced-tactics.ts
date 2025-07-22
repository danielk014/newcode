// Enhanced psychological tactics for script analysis
export const enhancedPsychologicalTactics = {
  // Platform-specific hook tactics
  shortFormHooks: [
    {
      name: "3-Second Hook",
      description: "Immediate attention grab for short-form content",
      indicators: ["immediately shows", "starts with action", "visual hook", "instant reveal"],
      platform: ["TikTok", "Shorts", "Reels"]
    },
    {
      name: "Loop Hook",
      description: "Shows ending first, then explains how it happened",
      indicators: ["this is how", "here's what happened", "end result first"],
      platform: ["TikTok", "Shorts"]
    },
    {
      name: "POV Hook",
      description: "Point of view scenarios that create instant relatability",
      indicators: ["POV:", "when you", "that moment when"],
      platform: ["TikTok", "Reels"]
    }
  ],
  
  longFormHooks: [
    {
      name: "Documentary Hook",
      description: "Sets up epic story arc for long-form content",
      indicators: ["this is the story", "what you're about to see", "journey began"],
      platform: ["YouTube Long-form"]
    },
    {
      name: "Chapter Preview",
      description: "Shows highlights from different parts of the video",
      indicators: ["coming up", "in this video", "you'll discover"],
      platform: ["YouTube Long-form"]
    },
    {
      name: "Credibility Stack",
      description: "Establishes authority early with credentials",
      indicators: ["I've helped", "my experience", "proven system"],
      platform: ["YouTube Long-form", "Educational"]
    }
  ],

  // Advanced retention tactics
  retentionTactics: [
    {
      name: "Mini-Payoffs",
      description: "Delivers value every 30-60 seconds to maintain engagement",
      indicators: ["here's a quick tip", "bonus insight", "pro tip"],
      timing: "Every 30-60 seconds"
    },
    {
      name: "Tension Escalation",
      description: "Gradually increases stakes throughout the content",
      indicators: ["it gets better", "but wait", "the real secret"],
      timing: "Progressive"
    },
    {
      name: "Visual Change Ups",
      description: "Mentions visual elements to reset attention",
      indicators: ["look at this", "as you can see", "check this out"],
      timing: "Every 45-90 seconds"
    }
  ],

  // Script structure patterns
  structurePatterns: {
    shortForm: {
      "Hook-Value-CTA": {
        sections: ["3-second hook", "rapid value delivery", "soft call-to-action"],
        duration: "15-60 seconds"
      },
      "Problem-Solution-Proof": {
        sections: ["relatable problem", "simple solution", "quick proof"],
        duration: "30-60 seconds"
      },
      "List Format": {
        sections: ["number hook", "rapid-fire points", "save prompt"],
        duration: "30-90 seconds"
      }
    },
    longForm: {
      "Educational Deep Dive": {
        sections: ["credibility hook", "problem exploration", "solution framework", "case studies", "implementation", "call-to-action"],
        duration: "8-20 minutes"
      },
      "Story Arc": {
        sections: ["setup", "conflict introduction", "rising action", "climax", "resolution", "lesson", "call-to-action"],
        duration: "10-30 minutes"
      },
      "Tutorial Format": {
        sections: ["result preview", "requirements", "step-by-step process", "common mistakes", "advanced tips", "next steps"],
        duration: "5-15 minutes"
      }
    }
  },

  // Emotional progression mapping
  emotionalJourney: [
    {
      stage: "Curiosity",
      tactics: ["information gap", "pattern interrupt", "surprising statement"],
      placement: "0-10%"
    },
    {
      stage: "Problem Awareness",
      tactics: ["pain point amplification", "relatability", "social proof of problem"],
      placement: "10-25%"
    },
    {
      stage: "Hope/Possibility",
      tactics: ["success stories", "transformation preview", "authority building"],
      placement: "25-50%"
    },
    {
      stage: "Confidence Building",
      tactics: ["step-by-step", "simplification", "past student results"],
      placement: "50-75%"
    },
    {
      stage: "Urgency/Action",
      tactics: ["scarcity", "FOMO", "exclusive opportunity", "time sensitivity"],
      placement: "75-100%"
    }
  ],

  // Platform-specific adaptations
  platformOptimizations: {
    youtube: {
      features: ["end screens", "cards", "chapters", "description CTAs"],
      bestPractices: ["10+ minute sweet spot", "keyword optimization", "thumbnail coordination"]
    },
    tiktok: {
      features: ["trending sounds", "effects", "duets", "comments"],
      bestPractices: ["7-15 second sweet spot", "loop-worthy content", "caption hooks"]
    },
    instagram: {
      features: ["carousel potential", "story extensions", "IGTV linkage"],
      bestPractices: ["30-60 second reels", "aesthetic consistency", "hashtag strategy"]
    }
  }
};

// Enhanced tactic detection patterns
export const enhancedTacticDetection = {
  // More sophisticated pattern matching
  patterns: {
    "Information Gap": {
      strong: [/what (I'm about to|I'll) (show|tell|reveal)/i, /the secret that/i, /nobody talks about/i],
      medium: [/you won't believe/i, /shocking truth/i, /hidden/i],
      weak: [/discover/i, /find out/i, /learn/i]
    },
    "Authority Building": {
      strong: [/\d+\s*(years|months) of experience/i, /helped \d+/i, /featured in/i, /award-winning/i],
      medium: [/expert/i, /professional/i, /specialized/i],
      weak: [/experienced/i, /knowledgeable/i]
    },
    "Social Proof": {
      strong: [/\d+\s*(thousand|million|K|M) (people|subscribers|students)/i, /testimonial/i, /case study/i],
      medium: [/popular/i, /trending/i, /everyone/i],
      weak: [/many people/i, /others/i, /common/i]
    },
    "Urgency": {
      strong: [/limited time/i, /expires/i, /only \d+ (left|remaining|available)/i, /closing soon/i],
      medium: [/hurry/i, /fast/i, /quick/i, /now/i],
      weak: [/soon/i, /today/i, /available/i]
    },
    "Pattern Interrupt": {
      strong: [/wait|stop|hold on/i, /but here's the thing/i, /plot twist/i],
      medium: [/actually/i, /however/i, /but/i],
      weak: [/interesting/i, /surprising/i]
    },
    "Emotional Trigger": {
      strong: [/tired of/i, /frustrated/i, /struggling with/i, /fed up/i, /desperate/i],
      medium: [/worried/i, /concerned/i, /anxious/i],
      weak: [/thinking about/i, /considering/i]
    },
    "Transformation Promise": {
      strong: [/from .* to .* in \d+/i, /transform/i, /life-changing/i, /breakthrough/i],
      medium: [/improve/i, /better/i, /upgrade/i],
      weak: [/help/i, /assist/i, /support/i]
    },
    "Scarcity": {
      strong: [/only \d+ (spots|seats|copies)/i, /selling out/i, /almost gone/i],
      medium: [/limited/i, /exclusive/i, /rare/i],
      weak: [/special/i, /unique/i]
    },
    "Future Pacing": {
      strong: [/imagine (yourself|waking up|having)/i, /picture this/i, /visualize/i],
      medium: [/what if/i, /think about/i, /consider/i],
      weak: [/could/i, /might/i, /possibly/i]
    },
    "Curiosity Loop": {
      strong: [/I'll (tell|show|explain) you in a (moment|minute|second)/i, /more on that later/i, /stay tuned/i],
      medium: [/coming up/i, /we'll get to that/i],
      weak: [/later/i, /soon/i]
    }
  },

  // Tactic strength calculation based on context
  calculateStrength: (matches: any, scriptLength: number, position: number) => {
    let strength = 5; // Base strength
    
    // Adjust based on pattern match quality
    if (matches.strong) strength += 3;
    else if (matches.medium) strength += 2;
    else if (matches.weak) strength += 1;
    
    // Adjust based on positioning
    const relativePosition = position / scriptLength;
    if (relativePosition < 0.1) strength += 2; // Bonus for hooks
    else if (relativePosition > 0.8) strength += 1; // Bonus for CTAs
    
    return Math.min(10, strength);
  }
};