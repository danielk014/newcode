import { analyzeScript, ScriptAnalysis } from './scriptAnalyzer';
import { PsychologicalTactic } from './tacticAnalyzer';

export interface ReferenceScriptProfile {
  id: string;
  topic: string;
  commonTactics: PsychologicalTactic[];
  stylePatterns: StylePattern[];
  keyPhrases: string[];
  emotionalTone: string[];
  averageWordCount: number;
  structurePreferences: StructurePreference[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StylePattern {
  type: 'sentence_length' | 'vocabulary_complexity' | 'hook_style' | 'cta_style';
  pattern: string;
  frequency: number;
  examples: string[];
}

export interface StructurePreference {
  section: 'hook' | 'problem' | 'solution' | 'details_cta';
  preferredLength: number; // percentage of total script
  commonTactics: string[];
  typicalPhrases: string[];
}

export interface ConsistencyRule {
  type: 'tactic_consistency' | 'tone_consistency' | 'structure_consistency' | 'phrase_consistency';
  description: string;
  importance: 'high' | 'medium' | 'low';
  apply: (script: string, profile: ReferenceScriptProfile) => string;
}

export class ReferenceScriptConsistencyEngine {
  private profiles: Map<string, ReferenceScriptProfile> = new Map();

  /**
   * Creates a reference profile from a collection of scripts on the same topic
   */
  createReferenceProfile(
    topic: string,
    referenceScripts: string[],
    onProgress?: (step: string, progress: number) => void
  ): ReferenceScriptProfile {
    onProgress?.('analyzing-references', 0);
    
    // Analyze each reference script
    const analyses: ScriptAnalysis[] = referenceScripts.map((script, index) => {
      onProgress?.('analyzing-references', (index / referenceScripts.length) * 50);
      return analyzeScript(script);
    });

    onProgress?.('analyzing-references', 50);

    // Extract common patterns
    const commonTactics = this.extractCommonTactics(analyses);
    const stylePatterns = this.extractStylePatterns(referenceScripts);
    const keyPhrases = this.extractConsistentPhrases(analyses);
    const emotionalTone = this.extractDominantTones(analyses);
    const averageWordCount = analyses.reduce((sum, a) => sum + a.wordCount, 0) / analyses.length;
    const structurePreferences = this.extractStructurePreferences(analyses);

    onProgress?.('analyzing-references', 75);

    const profile: ReferenceScriptProfile = {
      id: `${topic.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
      topic,
      commonTactics,
      stylePatterns,
      keyPhrases,
      emotionalTone,
      averageWordCount,
      structurePreferences,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.profiles.set(profile.id, profile);
    
    onProgress?.('analyzing-references', 100);
    
    return profile;
  }

  /**
   * Applies consistency rules to generate a script that matches the reference profile
   */
  generateConsistentScript(
    profile: ReferenceScriptProfile,
    userPrompt: string,
    baseScript: string,
    onProgress?: (step: string, progress: number) => void
  ): string {
    onProgress?.('applying-consistency', 0);

    let consistentScript = baseScript;
    const rules = this.getConsistencyRules();

    onProgress?.('applying-consistency', 20);

    // Apply each consistency rule
    rules.forEach((rule, index) => {
      onProgress?.('applying-consistency', 20 + (index / rules.length) * 60);
      consistentScript = rule.apply(consistentScript, profile);
    });

    onProgress?.('applying-consistency', 80);

    // Final validation and adjustments
    consistentScript = this.validateAndAdjust(consistentScript, profile);

    onProgress?.('applying-consistency', 100);

    return consistentScript;
  }

  /**
   * Gets the stored reference profile by topic or ID
   */
  getReferenceProfile(topicOrId: string): ReferenceScriptProfile | null {
    // Try to find by ID first
    const profile = this.profiles.get(topicOrId);
    if (profile) return profile;

    // Try to find by topic
    for (const [, profile] of this.profiles) {
      if (profile.topic.toLowerCase() === topicOrId.toLowerCase()) {
        return profile;
      }
    }

    return null;
  }

  /**
   * Lists all available reference profiles
   */
  listProfiles(): ReferenceScriptProfile[] {
    return Array.from(this.profiles.values());
  }

  /**
   * Updates an existing reference profile with new scripts
   */
  updateProfile(
    profileId: string,
    additionalScripts: string[],
    onProgress?: (step: string, progress: number) => void
  ): ReferenceScriptProfile | null {
    const existingProfile = this.profiles.get(profileId);
    if (!existingProfile) return null;

    // Re-analyze with additional scripts
    const newAnalyses = additionalScripts.map(script => analyzeScript(script));
    
    // Merge with existing patterns (this would need more sophisticated logic)
    const updatedProfile: ReferenceScriptProfile = {
      ...existingProfile,
      updatedAt: new Date()
    };

    this.profiles.set(profileId, updatedProfile);
    return updatedProfile;
  }

  private extractCommonTactics(analyses: ScriptAnalysis[]): PsychologicalTactic[] {
    const tacticCounts = new Map<string, { tactic: PsychologicalTactic; count: number }>();
    
    analyses.forEach(analysis => {
      analysis.tactics.forEach(tactic => {
        const existing = tacticCounts.get(tactic.name);
        if (existing) {
          existing.count++;
        } else {
          tacticCounts.set(tactic.name, { tactic, count: 1 });
        }
      });
    });

    // For single script, return all tactics. For multiple scripts, use 60% threshold
    const threshold = analyses.length === 1 ? 1 : Math.ceil(analyses.length * 0.6);
    return Array.from(tacticCounts.values())
      .filter(item => item.count >= threshold)
      .map(item => item.tactic);
  }

  private extractStylePatterns(scripts: string[]): StylePattern[] {
    const patterns: StylePattern[] = [];

    // Analyze sentence length patterns
    const allSentences = scripts.flatMap(script => 
      script.split(/[.!?]+/).filter(s => s.trim().length > 0)
    );
    
    const avgSentenceLength = allSentences.reduce((sum, sentence) => 
      sum + sentence.trim().split(' ').length, 0
    ) / allSentences.length;

    patterns.push({
      type: 'sentence_length',
      pattern: avgSentenceLength < 10 ? 'short' : avgSentenceLength < 20 ? 'medium' : 'long',
      frequency: 1,
      examples: allSentences.slice(0, 3).map(s => s.trim())
    });

    // Analyze hook styles
    const hooks = scripts.map(script => {
      const sentences = script.split(/[.!?]+/).filter(s => s.trim().length > 0);
      return sentences[0]?.trim() || '';
    }).filter(hook => hook.length > 0);

    const questionHooks = hooks.filter(hook => hook.includes('?')).length;
    const statementHooks = hooks.filter(hook => !hook.includes('?')).length;

    if (questionHooks > statementHooks) {
      patterns.push({
        type: 'hook_style',
        pattern: 'question_based',
        frequency: questionHooks / hooks.length,
        examples: hooks.filter(h => h.includes('?')).slice(0, 3)
      });
    } else {
      patterns.push({
        type: 'hook_style',
        pattern: 'statement_based',
        frequency: statementHooks / hooks.length,
        examples: hooks.filter(h => !h.includes('?')).slice(0, 3)
      });
    }

    return patterns;
  }

  private extractConsistentPhrases(analyses: ScriptAnalysis[]): string[] {
    const allPhrases = analyses.flatMap(analysis => analysis.keyPhrases);
    const phraseCounts = new Map<string, number>();

    allPhrases.forEach(phrase => {
      const normalized = phrase.toLowerCase().trim();
      phraseCounts.set(normalized, (phraseCounts.get(normalized) || 0) + 1);
    });

    // Return phrases that appear in multiple scripts
    return Array.from(phraseCounts.entries())
      .filter(([, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([phrase]) => phrase);
  }

  private extractDominantTones(analyses: ScriptAnalysis[]): string[] {
    const toneCounts = new Map<string, number>();

    analyses.forEach(analysis => {
      analysis.emotionalTone.forEach(tone => {
        toneCounts.set(tone, (toneCounts.get(tone) || 0) + 1);
      });
    });

    // For single script, return all tones. For multiple scripts, use 50% threshold
    const threshold = analyses.length === 1 ? 1 : Math.ceil(analyses.length * 0.5);
    return Array.from(toneCounts.entries())
      .filter(([, count]) => count >= threshold)
      .sort((a, b) => b[1] - a[1])
      .map(([tone]) => tone);
  }

  private extractStructurePreferences(analyses: ScriptAnalysis[]): StructurePreference[] {
    const preferences: StructurePreference[] = [];

    // Analyze average section lengths
    const sectionData = analyses.map(analysis => analysis.structure);
    
    const avgHookLength = sectionData.reduce((sum, sections) => {
      const hookSection = sections.find(s => s.type === 'Hook');
      return sum + (hookSection?.wordCount || 0);
    }, 0) / sectionData.length;

    const avgProblemLength = sectionData.reduce((sum, sections) => {
      const problemSection = sections.find(s => s.type === 'Problem');
      return sum + (problemSection?.wordCount || 0);
    }, 0) / sectionData.length;

    const avgSolutionLength = sectionData.reduce((sum, sections) => {
      const solutionSection = sections.find(s => s.type === 'Solution');
      return sum + (solutionSection?.wordCount || 0);
    }, 0) / sectionData.length;

    const avgDetailsLength = sectionData.reduce((sum, sections) => {
      const detailsSection = sections.find(s => s.type === 'Details & CTA');
      return sum + (detailsSection?.wordCount || 0);
    }, 0) / sectionData.length;

    const totalAvg = avgHookLength + avgProblemLength + avgSolutionLength + avgDetailsLength;

    preferences.push({
      section: 'hook',
      preferredLength: Math.round((avgHookLength / totalAvg) * 100),
      commonTactics: ['Pattern Interrupt', 'Curiosity Gap'],
      typicalPhrases: []
    });

    preferences.push({
      section: 'problem',
      preferredLength: Math.round((avgProblemLength / totalAvg) * 100),
      commonTactics: ['Pain Point', 'Relatability'],
      typicalPhrases: []
    });

    preferences.push({
      section: 'solution',
      preferredLength: Math.round((avgSolutionLength / totalAvg) * 100),
      commonTactics: ['Authority', 'Social Proof'],
      typicalPhrases: []
    });

    preferences.push({
      section: 'details_cta',
      preferredLength: Math.round((avgDetailsLength / totalAvg) * 100),
      commonTactics: ['Future Pacing', 'Scarcity'],
      typicalPhrases: []
    });

    return preferences;
  }

  private getConsistencyRules(): ConsistencyRule[] {
    return [
      {
        type: 'tactic_consistency',
        description: 'Ensure the script uses tactics consistent with the reference profile',
        importance: 'high',
        apply: (script: string, profile: ReferenceScriptProfile) => {
          // This would implement logic to enhance the script with profile tactics
          return script;
        }
      },
      {
        type: 'tone_consistency',
        description: 'Match the emotional tone of the reference scripts',
        importance: 'medium',
        apply: (script: string, profile: ReferenceScriptProfile) => {
          // This would implement tone matching logic
          return script;
        }
      },
      {
        type: 'structure_consistency',
        description: 'Follow the structural preferences from reference scripts',
        importance: 'high',
        apply: (script: string, profile: ReferenceScriptProfile) => {
          // This would implement structure adjustment logic
          return script;
        }
      },
      {
        type: 'phrase_consistency',
        description: 'Incorporate key phrases that work well in this topic',
        importance: 'low',
        apply: (script: string, profile: ReferenceScriptProfile) => {
          // This would implement phrase integration logic
          return script;
        }
      }
    ];
  }

  private validateAndAdjust(script: string, profile: ReferenceScriptProfile): string {
    // Final validation logic would go here
    // For now, just return the script as-is
    return script;
  }
}

// Export singleton instance
export const referenceScriptEngine = new ReferenceScriptConsistencyEngine();