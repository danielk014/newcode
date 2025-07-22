
import { psychologicalTactics, PsychologicalTactic } from './tacticAnalyzer';

export interface ScriptAnalysis {
  tactics: PsychologicalTactic[];
  structure: ScriptSection[];
  wordCount: number;
  estimatedDuration: number;
  keyPhrases: string[];
  emotionalTone: string[];
}

export interface ScriptSection {
  type: string;
  content: string;
  startTime: string;
  endTime: string;
  tactics: string[];
  wordCount: number;
}

export const analyzeScript = (
  script: string, 
  onProgress?: (step: string, progress: number) => void
): ScriptAnalysis => {
  onProgress?.('parsing', 0);
  
  const words = script.trim().split(/\s+/).length;
  const estimatedDuration = Math.round(words / 140); // 140 words per minute average

  onProgress?.('parsing', 25);

  // Detect psychological tactics by scanning for keywords and patterns
  onProgress?.('analyzing-tactics', 30);
  const detectedTactics = psychologicalTactics.filter(tactic => {
    return tactic.examples.some(example => {
      const keywords = example.toLowerCase().split(' ').filter(word => word.length > 3);
      return keywords.some(keyword => script.toLowerCase().includes(keyword));
    });
  });

  onProgress?.('analyzing-tactics', 60);

  // Analyze script structure by detecting common patterns
  onProgress?.('detecting-structure', 65);
  const structure = detectScriptStructure(script);
  
  onProgress?.('detecting-structure', 80);
  
  // Extract key phrases (repeated words/phrases that might be hooks)
  const keyPhrases = extractKeyPhrases(script);
  
  onProgress?.('detecting-structure', 90);
  
  // Analyze emotional tone
  const emotionalTone = analyzeEmotionalTone(script);

  onProgress?.('detecting-structure', 100);

  return {
    tactics: detectedTactics,
    structure,
    wordCount: words,
    estimatedDuration,
    keyPhrases,
    emotionalTone
  };
};

const detectScriptStructure = (script: string): ScriptSection[] => {
  const lines = script.split('\n').filter(line => line.trim());
  const totalWords = script.trim().split(/\s+/).length;
  const sections: ScriptSection[] = [];
  
  // Simple heuristic to detect sections based on content patterns
  let currentWordCount = 0;
  
  // Hook detection (first 10-15% of script)
  const hookEnd = Math.min(Math.floor(totalWords * 0.15), 50);
  const hookContent = script.trim().split(/\s+/).slice(0, hookEnd).join(' ');
  
  sections.push({
    type: 'Hook',
    content: hookContent,
    startTime: '0s',
    endTime: '15s',
    tactics: detectSectionTactics(hookContent, ['Hook']),
    wordCount: hookEnd
  });
  
  currentWordCount += hookEnd;
  
  // Problem section (next 20-25%)
  const problemWords = Math.floor(totalWords * 0.25);
  const problemContent = script.trim().split(/\s+/).slice(currentWordCount, currentWordCount + problemWords).join(' ');
  
  sections.push({
    type: 'Problem',
    content: problemContent,
    startTime: '15s',
    endTime: '45s',
    tactics: detectSectionTactics(problemContent, ['Emotional']),
    wordCount: problemWords
  });
  
  currentWordCount += problemWords;
  
  // Solution section (next 30-35%)
  const solutionWords = Math.floor(totalWords * 0.35);
  const solutionContent = script.trim().split(/\s+/).slice(currentWordCount, currentWordCount + solutionWords).join(' ');
  
  sections.push({
    type: 'Solution',
    content: solutionContent,
    startTime: '45s',
    endTime: '2m',
    tactics: detectSectionTactics(solutionContent, ['Persuasion', 'Monetization']),
    wordCount: solutionWords
  });
  
  // Remaining content as details/CTA
  const remainingWords = totalWords - currentWordCount;
  if (remainingWords > 0) {
    const remainingContent = script.trim().split(/\s+/).slice(currentWordCount).join(' ');
    
    sections.push({
      type: 'Details & CTA',
      content: remainingContent,
      startTime: '2m',
      endTime: `${Math.round(totalWords / 140)}m`,
      tactics: detectSectionTactics(remainingContent, ['Retention', 'Algorithm']),
      wordCount: remainingWords
    });
  }
  
  return sections;
};

const detectSectionTactics = (content: string, categories: string[]): string[] => {
  const relevantTactics = psychologicalTactics.filter(tactic => 
    categories.includes(tactic.category)
  );
  
  return relevantTactics
    .filter(tactic => 
      tactic.examples.some(example => {
        const keywords = example.toLowerCase().split(' ').filter(word => word.length > 3);
        return keywords.some(keyword => content.toLowerCase().includes(keyword));
      })
    )
    .map(tactic => tactic.name);
};

const extractKeyPhrases = (script: string): string[] => {
  // Extract potential hooks and key phrases
  const sentences = script.split(/[.!?]+/).filter(s => s.trim());
  const keyPhrases: string[] = [];
  
  sentences.forEach(sentence => {
    const trimmed = sentence.trim();
    if (trimmed.length > 10 && trimmed.length < 100) {
      // Look for hook patterns
      const hookPatterns = [
        /^(what|how|why|when|where)/i,
        /\b(secret|truth|real|actually|never|always)\b/i,
        /\b(you won't believe|nobody talks about|this will|here's what)/i
      ];
      
      if (hookPatterns.some(pattern => pattern.test(trimmed))) {
        keyPhrases.push(trimmed);
      }
    }
  });
  
  return keyPhrases.slice(0, 5); // Return top 5 key phrases
};

const analyzeEmotionalTone = (script: string): string[] => {
  const emotionalWords = {
    excitement: ['amazing', 'incredible', 'awesome', 'fantastic', 'unbelievable'],
    urgency: ['now', 'today', 'immediately', 'quickly', 'fast', 'hurry'],
    curiosity: ['secret', 'hidden', 'discover', 'reveal', 'truth', 'mystery'],
    authority: ['proven', 'expert', 'professional', 'system', 'method', 'strategy'],
    social: ['everyone', 'people', 'others', 'community', 'share', 'join']
  };
  
  const detectedTones: string[] = [];
  const lowerScript = script.toLowerCase();
  
  Object.entries(emotionalWords).forEach(([tone, words]) => {
    const count = words.reduce((acc, word) => 
      acc + (lowerScript.split(word).length - 1), 0
    );
    
    if (count > 2) {
      detectedTones.push(tone);
    }
  });
  
  return detectedTones;
};

export const synthesizeAnalyses = (
  analyses: ScriptAnalysis[],
  onProgress?: (step: string, progress: number) => void
): {
  commonTactics: PsychologicalTactic[];
  averageStructure: ScriptSection[];
  insights: string[];
} => {
  onProgress?.('synthesizing', 0);

  // Find tactics that appear in multiple scripts
  const allTactics = analyses.flatMap(analysis => analysis.tactics);
  const tacticCounts = allTactics.reduce((acc, tactic) => {
    acc[tactic.name] = (acc[tactic.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  onProgress?.('synthesizing', 25);
  
  // Get tactics that appear in at least 50% of scripts
  const threshold = Math.ceil(analyses.length / 2);
  const commonTactics = allTactics.filter((tactic, index, self) => 
    self.findIndex(t => t.name === tactic.name) === index &&
    tacticCounts[tactic.name] >= threshold
  );
  
  onProgress?.('synthesizing', 50);
  
  // Create averaged structure
  const averageStructure = createAverageStructure(analyses);
  
  onProgress?.('synthesizing', 75);
  
  // Generate insights
  const insights = generateInsights(analyses, tacticCounts);
  
  onProgress?.('synthesizing', 100);
  
  return {
    commonTactics,
    averageStructure,
    insights
  };
};

const createAverageStructure = (analyses: ScriptAnalysis[]): ScriptSection[] => {
  const avgWordCount = analyses.reduce((sum, a) => sum + a.wordCount, 0) / analyses.length;
  const avgDuration = Math.round(avgWordCount / 140);
  
  return [
    {
      type: 'Hook',
      content: 'Analyzed hook patterns from your scripts',
      startTime: '0s',
      endTime: '15s',
      tactics: ['Pattern Interrupt', 'Curiosity Gap'],
      wordCount: Math.round(avgWordCount * 0.15)
    },
    {
      type: 'Problem',
      content: 'Problem identification based on your style',
      startTime: '15s',
      endTime: '45s',
      tactics: ['Pain Point', 'Relatability'],
      wordCount: Math.round(avgWordCount * 0.25)
    },
    {
      type: 'Solution',
      content: 'Solution presentation matching your approach',
      startTime: '45s',
      endTime: '2m',
      tactics: ['Authority', 'Social Proof'],
      wordCount: Math.round(avgWordCount * 0.35)
    },
    {
      type: 'Details & CTA',
      content: 'Detailed explanation and call-to-action',
      startTime: '2m',
      endTime: `${avgDuration}m`,
      tactics: ['Future Pacing', 'Scarcity'],
      wordCount: Math.round(avgWordCount * 0.25)
    }
  ];
};

const generateInsights = (analyses: ScriptAnalysis[], tacticCounts: Record<string, number>): string[] => {
  const insights: string[] = [];
  
  // Word count insights
  const avgWordCount = analyses.reduce((sum, a) => sum + a.wordCount, 0) / analyses.length;
  insights.push(`Your scripts average ${Math.round(avgWordCount)} words`);
  
  // Most used tactics
  const topTactic = Object.entries(tacticCounts).sort((a, b) => b[1] - a[1])[0];
  if (topTactic) {
    insights.push(`Most frequently used tactic: ${topTactic[0]}`);
  }
  
  // Emotional tone analysis
  const allTones = analyses.flatMap(a => a.emotionalTone);
  const topTone = allTones.reduce((acc, tone) => {
    acc[tone] = (acc[tone] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const dominantTone = Object.entries(topTone).sort((a, b) => b[1] - a[1])[0];
  if (dominantTone) {
    insights.push(`Dominant emotional tone: ${dominantTone[0]}`);
  }
  
  return insights;
};
