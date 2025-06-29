
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Advanced content tracking system
const contentPatterns = new Map<string, Set<string>>();
const semanticHashes = new Set<string>();
const topicBannedPhrases = new Map<string, Set<string>>();
const generationHistory = new Array<{
  sessionId: string;
  topic: string;
  approach: string;
  timestamp: number;
  contentHash: string;
}>();

// Semantic similarity hash
const generateSemanticHash = (content: string): string => {
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .sort();
  
  const semanticSignature = words.slice(0, 50).join('|');
  let hash = 0;
  for (let i = 0; i < semanticSignature.length; i++) {
    const char = semanticSignature.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

// Advanced voice pattern analysis
const analyzeVoiceFingerprint = (scripts: string[]) => {
  const analysis = {
    avgSentenceLength: 0,
    sentenceLengthVariation: 0,
    vocabularyComplexity: 0,
    tonalMarkers: [],
    structuralPatterns: [],
    commonTransitions: [],
    emotionalLanguage: [],
    questionFrequency: 0,
    exclamationFrequency: 0,
    personalPronounUsage: 0,
    technicalTermFrequency: 0
  };

  let totalSentences = 0;
  let totalWords = 0;
  let sentenceLengths: number[] = [];
  const transitions = new Map<string, number>();
  const vocabulary = new Set<string>();
  let questions = 0;
  let exclamations = 0;
  let personalPronouns = 0;

  const transitionWords = ['however', 'therefore', 'meanwhile', 'furthermore', 'consequently', 'nevertheless', 'moreover', 'additionally'];
  const personalPronounWords = ['i', 'you', 'we', 'us', 'my', 'your', 'our'];

  scripts.forEach(script => {
    const sentences = script.split(/[.!?]+/).filter(s => s.trim());
    totalSentences += sentences.length;
    
    questions += (script.match(/\?/g) || []).length;
    exclamations += (script.match(/!/g) || []).length;
    
    sentences.forEach(sentence => {
      const words = sentence.trim().toLowerCase().split(/\s+/);
      const wordCount = words.length;
      totalWords += wordCount;
      sentenceLengths.push(wordCount);
      
      words.forEach(word => {
        vocabulary.add(word);
        if (personalPronounWords.includes(word)) personalPronouns++;
        if (transitionWords.includes(word)) {
          transitions.set(word, (transitions.get(word) || 0) + 1);
        }
      });
    });
  });

  analysis.avgSentenceLength = Math.round(totalWords / totalSentences);
  analysis.sentenceLengthVariation = Math.round(
    Math.sqrt(sentenceLengths.reduce((sum, len) => sum + Math.pow(len - analysis.avgSentenceLength, 2), 0) / sentenceLengths.length)
  );
  analysis.vocabularyComplexity = vocabulary.size;
  analysis.questionFrequency = questions / totalSentences;
  analysis.exclamationFrequency = exclamations / totalSentences;
  analysis.personalPronounUsage = personalPronouns / totalWords;
  analysis.commonTransitions = Array.from(transitions.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word);

  return analysis;
};

// Dynamic perspective generation based on topic analysis
const generateDynamicApproach = (topic: string, targetAudience: string, sessionId: string, previousApproaches: string[]) => {
  const topicKeywords = topic.toLowerCase().split(/\s+/);
  const audienceContext = targetAudience?.toLowerCase() || 'general';
  
  // Topic-specific perspective generators
  const perspectiveGenerators = {
    business: [
      `Reveal the hidden psychology behind why 95% fail at ${topic}`,
      `Share the contrarian approach that successful people use for ${topic}`,
      `Expose the industry lies about ${topic} that keep people stuck`,
      `Tell the untold story of how ${topic} really works behind closed doors`
    ],
    health: [
      `Share the unconventional ${topic} method that doctors don't discuss`,
      `Reveal why traditional approaches to ${topic} fail most people`,
      `Expose the surprising science behind ${topic} that changes everything`,
      `Tell the personal transformation story through ${topic}`
    ],
    technology: [
      `Demystify ${topic} by showing what experts don't want you to know`,
      `Reveal the future of ${topic} that's already happening today`,
      `Share the insider secrets of ${topic} that only pros know`,
      `Expose the common ${topic} mistakes that cost people dearly`
    ],
    lifestyle: [
      `Challenge everything you think you know about ${topic}`,
      `Share the life-changing ${topic} approach that seems too simple`,
      `Reveal the ${topic} secrets that transformed my entire life`,
      `Expose why most ${topic} advice is completely backwards`
    ]
  };

  // Determine topic category
  let category = 'lifestyle';
  if (topicKeywords.some(word => ['business', 'money', 'career', 'success', 'marketing', 'sales'].includes(word))) {
    category = 'business';
  } else if (topicKeywords.some(word => ['health', 'fitness', 'diet', 'wellness', 'mental'].includes(word))) {
    category = 'health';
  } else if (topicKeywords.some(word => ['tech', 'ai', 'software', 'digital', 'online'].includes(word))) {
    category = 'technology';
  }

  const sessionSeed = parseInt(sessionId.slice(-4), 16) || Date.now();
  const perspectives = perspectiveGenerators[category as keyof typeof perspectiveGenerators];
  
  // Avoid previously used approaches
  const availablePerspectives = perspectives.filter(p => !previousApproaches.includes(p));
  const selectedPerspective = availablePerspectives[sessionSeed % availablePerspectives.length] || perspectives[0];

  // Generate unique angles based on audience and topic
  const audienceAngles = {
    beginner: `Start with the absolute basics but reveal advanced secrets early`,
    intermediate: `Skip the basics and dive into the nuanced strategies`,
    advanced: `Focus on optimization and little-known expert techniques`,
    general: `Make complex concepts accessible while maintaining depth`
  };

  const audienceKey = Object.keys(audienceAngles).find(key => 
    audienceContext.includes(key)
  ) || 'general';

  return {
    perspective: selectedPerspective,
    angle: audienceAngles[audienceKey as keyof typeof audienceAngles],
    narrativeStyle: generateNarrativeStyle(sessionSeed),
    emotionalTone: generateEmotionalTone(sessionSeed, category)
  };
};

// Generate narrative style
const generateNarrativeStyle = (seed: number) => {
  const styles = [
    'First-person transformation story',
    'Third-person case study analysis', 
    'Observational documentary style',
    'Interactive Q&A format',
    'Problem-solution narrative',
    'Before-and-after comparison',
    'Step-by-step journey',
    'Myth-busting revelation'
  ];
  return styles[seed % styles.length];
};

// Generate emotional tone
const generateEmotionalTone = (seed: number, category: string) => {
  const tones = {
    business: ['Confident and authoritative', 'Urgent and motivating', 'Conspiratorial and revealing', 'Empowering and inspiring'],
    health: ['Caring and supportive', 'Urgent and concerning', 'Hopeful and encouraging', 'Scientific and trustworthy'],
    technology: ['Excited and innovative', 'Cautionary and wise', 'Curious and exploratory', 'Practical and grounded'],
    lifestyle: ['Warm and relatable', 'Passionate and energetic', 'Calm and reflective', 'Bold and challenging']
  };
  
  const categoryTones = tones[category as keyof typeof tones] || tones.lifestyle;
  return categoryTones[seed % categoryTones.length];
};

// Intelligent word count calculation
const calculateOptimalWordCount = (baseTarget: number, topic: string, approach: any, voicePatterns: any): number => {
  // Content density factors
  const topicComplexity = topic.split(' ').length > 3 ? 1.15 : 1.0;
  const narrativeComplexity = approach.narrativeStyle.includes('story') ? 1.2 : 1.0;
  const voiceComplexity = voicePatterns.vocabularyComplexity > 100 ? 1.1 : 1.0;
  
  // Ensure we always meet or exceed the base target
  const multiplier = Math.max(1.0, topicComplexity * narrativeComplexity * voiceComplexity);
  
  return Math.max(baseTarget, Math.ceil(baseTarget * multiplier));
};

// Anti-repetition system
const checkContentUniqueness = (content: string, topic: string): { isUnique: boolean; similarity: number } => {
  const semanticHash = generateSemanticHash(content);
  
  if (semanticHashes.has(semanticHash)) {
    return { isUnique: false, similarity: 100 };
  }
  
  // Check against topic-specific patterns
  const topicPatterns = contentPatterns.get(topic) || new Set();
  const contentSignature = content.substring(0, 200).toLowerCase();
  
  let maxSimilarity = 0;
  for (const pattern of topicPatterns) {
    const similarity = calculateSimilarity(contentSignature, pattern);
    maxSimilarity = Math.max(maxSimilarity, similarity);
  }
  
  // Store new patterns
  topicPatterns.add(contentSignature);
  contentPatterns.set(topic, topicPatterns);
  semanticHashes.add(semanticHash);
  
  return { isUnique: maxSimilarity < 30, similarity: maxSimilarity };
};

// Simple similarity calculation
const calculateSimilarity = (str1: string, str2: string): number => {
  const words1 = new Set(str1.split(/\s+/));
  const words2 = new Set(str2.split(/\s+/));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  return Math.round((intersection.size / union.size) * 100);
};

// Build advanced system prompt
const buildAdvancedSystemPrompt = (approach: any, targetWords: number, voicePatterns: any, uniquenessContext: any) => {
  return `You are an elite scriptwriter creating completely original content. This script must be fundamentally different from anything previously written.

CREATIVE MISSION:
- Perspective: ${approach.perspective}
- Angle: ${approach.angle}
- Narrative Style: ${approach.narrativeStyle}
- Emotional Tone: ${approach.emotionalTone}

VOICE FINGERPRINT MATCHING:
- Target sentence length: ${voicePatterns.avgSentenceLength} ± ${voicePatterns.sentenceLengthVariation} words
- Vocabulary complexity level: ${voicePatterns.vocabularyComplexity > 100 ? 'Advanced' : 'Moderate'}
- Question frequency: ${Math.round(voicePatterns.questionFrequency * 100)}% of sentences
- Personal pronoun usage: ${Math.round(voicePatterns.personalPronounUsage * 100)}% of words
- Preferred transitions: ${voicePatterns.commonTransitions.join(', ')}

STRICT REQUIREMENTS:
- Write EXACTLY ${targetWords} words (verify count before finishing)
- Content uniqueness score must exceed 70%
- Use the specified narrative style consistently
- Match the emotional tone throughout
- Create genuine value and insight

FORBIDDEN ELEMENTS:
- Generic business clichés or buzzwords
- Predictable opening hooks or transitions
- Content patterns similar to previous generations
- Template-based structures or formulas
- Repetitive phrasing or concepts

SUCCESS CRITERIA:
- Completely original perspective on the topic
- Authentic voice matching the reference samples
- Engaging narrative that holds attention
- Actionable insights that provide real value
- Perfect word count adherence`;
};

// Enhanced user prompt
const buildComprehensiveUserPrompt = (data: any, approach: any, targetWords: number, voicePatterns: any) => {
  return `VOICE REFERENCE ANALYSIS:
${data.scripts.map((script: string, index: number) => `\nSAMPLE ${index + 1} (${script.split(' ').length} words):\n${script.substring(0, 300)}...`).join('')}

CONTENT BRIEF:
Topic: "${data.topic}"
Target Audience: ${data.targetAudience || 'General audience'}
Context: ${data.description || 'No additional context provided'}
Call to Action: "${data.callToAction}"
Required Word Count: EXACTLY ${targetWords} words

CREATIVE DIRECTION:
Perspective: ${approach.perspective}
Narrative Approach: ${approach.narrativeStyle}
Emotional Tone: ${approach.emotionalTone}
Unique Angle: ${approach.angle}

VOICE MATCHING REQUIREMENTS:
- Match the conversational rhythm and flow of the reference samples
- Use similar sentence structures and lengths (avg: ${voicePatterns.avgSentenceLength} words)
- Incorporate the natural language patterns observed
- Maintain the same level of vocabulary complexity

UNIQUENESS MANDATE:
This script must be completely original and unlike any content previously created. Avoid any formulaic approaches or template language. Create something that feels fresh, authentic, and genuinely valuable.

Write the complete script now, ensuring it meets the exact word count requirement:`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { topic, description, targetAudience, scripts, callToAction, targetWordCount } = requestData;
    
    const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');
    if (!claudeApiKey) {
      throw new Error('Claude API key not configured');
    }

    // Generate unique session
    const sessionId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    
    // Get previous approaches for this topic
    const previousApproaches = generationHistory
      .filter(h => h.topic === topic)
      .map(h => h.approach);
    
    // Advanced analysis and generation
    const voicePatterns = analyzeVoiceFingerprint(scripts);
    const uniqueApproach = generateDynamicApproach(topic, targetAudience, sessionId, previousApproaches);
    const targetWords = calculateOptimalWordCount(targetWordCount, topic, uniqueApproach, voicePatterns);

    // Build advanced prompts
    const systemPrompt = buildAdvancedSystemPrompt(uniqueApproach, targetWords, voicePatterns, { sessionId });
    const userPrompt = buildComprehensiveUserPrompt(requestData, uniqueApproach, targetWords, voicePatterns);

    console.log(`Advanced script generation initiated:`);
    console.log(`- Session: ${sessionId}`);
    console.log(`- Topic: ${topic}`);
    console.log(`- Approach: ${uniqueApproach.perspective.substring(0, 80)}...`);
    console.log(`- Narrative: ${uniqueApproach.narrativeStyle}`);
    console.log(`- Tone: ${uniqueApproach.emotionalTone}`);
    console.log(`- Target words: ${targetWords} (base: ${targetWordCount})`);
    console.log(`- Voice complexity: ${voicePatterns.vocabularyComplexity}`);

    // Use Claude Sonnet 4 with optimized creativity settings
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 8000,
        temperature: 1.0,
        top_p: 0.9,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API Error:', errorText);
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const generatedScript = data.content[0].text;
    
    // Advanced quality checks
    const actualWordCount = generatedScript.trim().split(/\s+/).length;
    const uniquenessCheck = checkContentUniqueness(generatedScript, topic);
    const meetsTarget = actualWordCount >= targetWordCount;
    const wordCountAccuracy = Math.abs(targetWords - actualWordCount);

    // Record generation history
    generationHistory.push({
      sessionId,
      topic,
      approach: uniqueApproach.perspective,
      timestamp: Date.now(),
      contentHash: generateSemanticHash(generatedScript)
    });

    // Comprehensive metrics
    const metrics = {
      wordCount: actualWordCount,
      targetWordCount: targetWords,
      minimumTarget: targetWordCount,
      meetsMinimum: meetsTarget,
      wordCountAccuracy: wordCountAccuracy,
      uniquenessScore: 100 - uniquenessCheck.similarity,
      isUnique: uniquenessCheck.isUnique,
      voiceMatchScore: Math.max(0, 100 - Math.abs(voicePatterns.avgSentenceLength - (actualWordCount / generatedScript.split(/[.!?]+/).length))),
      narrativeStyle: uniqueApproach.narrativeStyle,
      emotionalTone: uniqueApproach.emotionalTone,
      sessionId: sessionId,
      generationQuality: meetsTarget && uniquenessCheck.isUnique && wordCountAccuracy < 50 ? 'Excellent' : 'Good'
    };

    console.log(`Script generation completed:`);
    console.log(`- Words: ${actualWordCount}/${targetWords} (accuracy: ±${wordCountAccuracy})`);
    console.log(`- Uniqueness: ${metrics.uniquenessScore}%`);
    console.log(`- Quality: ${metrics.generationQuality}`);
    console.log(`- Voice match: ${metrics.voiceMatchScore}%`);

    return new Response(
      JSON.stringify({ 
        script: generatedScript,
        success: true,
        metrics: metrics,
        approach: {
          perspective: uniqueApproach.perspective,
          narrativeStyle: uniqueApproach.narrativeStyle,
          emotionalTone: uniqueApproach.emotionalTone
        },
        message: `Advanced script generated: ${actualWordCount} words, ${metrics.uniquenessScore}% unique, ${metrics.generationQuality.toLowerCase()} quality`
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in advanced script generation:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Advanced script generation failed',
        success: false 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
