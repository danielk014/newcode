export interface ScriptAnalysis {
  scriptAnalyses: ScriptAnalysisResult[];
  synthesizedTactics: Tactic[];
  blueprint: ScriptBlueprint;
  insights: string[];
}

export interface ScriptAnalysisResult {
  scriptNumber: number;
  psychologicalTactics: Tactic[];
  structuralFlow: StructuralElement[];
  hooks: Hook[];
  emotionalTones: EmotionalTone[];
  ctaStrategies: string[];
  storytellingTechniques: string[];
  engagement: EngagementMetrics;
  transformationPromise: string;
  heroJourneyElements: HeroJourneyElement[];
  originalityScore: number;
  viralPotential: ViralPotentialScore;
}

export interface Tactic {
  id: string;
  name: string;
  description: string;
  category: string;
  effectiveness: number;
  examples?: string[];
}

export interface StructuralElement {
  type: string;
  content: string;
  timestamp?: string;
}

export interface Hook {
  type: string;
  content: string;
  effectiveness: number;
}

export interface EmotionalTone {
  emotion: string;
  intensity: number;
}

export interface EngagementMetrics {
  score: number;
  factors: string[];
}

export interface HeroJourneyElement {
  stage: string;
  description: string;
}

export interface ViralPotentialScore {
  score: number;
  factors: string[];
}

export interface ScriptBlueprint {
  structure: BlueprintSection[];
  keyElements: string[];
  timing: TimingElement[];
}

export interface BlueprintSection {
  name: string;
  duration: string;
  purpose: string;
  content: string;
}

export interface TimingElement {
  timestamp: string;
  action: string;
}

export interface ScriptInput {
  scripts: string[];
  topic: string;
  description: string;
  targetLength: number;
  callToAction: string;
}

export interface GeneratedScript {
  content: string;
  wordCount: number;
  tactics: Tactic[];
  metadata?: {
    generatedAt: Date;
    model: string;
    temperature?: number;
  };
}