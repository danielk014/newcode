
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced tracking system with better uniqueness detection
const sessionHistory = new Map<string, Array<{
  contentHash: string;
  wordCount: number;
  timestamp: number;
  approach: string;
}>>();

const topicHistory = new Map<string, Set<string>>();

// Generate truly unique content hash based on semantic meaning
const generateContentHash = (content: string): string => {
  // Extract semantic elements: key phrases, structure, and concepts
  const sentences = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  // Create semantic signature from meaningful words
  const semanticWords = sentences
    .filter(word => !['this', 'that', 'will', 'have', 'been', 'they', 'them', 'your', 'with', 'from'].includes(word))
    .slice(0, 30)
    .sort();
  
  const signature = semanticWords.join('|');
  let hash = 0;
  for (let i = 0; i < signature.length; i++) {
    const char = signature.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

// Check if content is truly unique
const isContentUnique = (content: string, topic: string, sessionId: string): boolean => {
  const contentHash = generateContentHash(content);
  
  // Check against topic history
  const topicHashes = topicHistory.get(topic.toLowerCase()) || new Set();
  if (topicHashes.has(contentHash)) {
    return false;
  }
  
  // Check against session history
  const sessionHistoryData = sessionHistory.get(sessionId) || [];
  const isDuplicate = sessionHistoryData.some(entry => entry.contentHash === contentHash);
  
  // Store new content
  topicHashes.add(contentHash);
  topicHistory.set(topic.toLowerCase(), topicHashes);
  
  return !isDuplicate;
};

// Generate truly dynamic approaches based on multiple factors
const generateUniqueApproach = (topic: string, audience: string, sessionId: string, attemptNumber: number = 0): any => {
  const sessionSeed = parseInt(sessionId.slice(-6), 16) + attemptNumber * 1000;
  const topicWords = topic.toLowerCase().split(/\s+/);
  
  // Dynamic perspective generators that change based on attempt
  const perspectives = [
    `Reveal the counterintuitive truth about ${topic} that nobody talks about`,
    `Share the insider methodology for ${topic} that only experts know`,
    `Expose the hidden psychology behind successful ${topic} strategies`,
    `Challenge conventional wisdom about ${topic} with surprising data`,
    `Tell the untold story of how ${topic} really works behind the scenes`,
    `Decode the secret patterns that make ${topic} actually effective`,
    `Unveil the systematic approach to ${topic} that bypasses common failures`,
    `Demonstrate the advanced ${topic} techniques that seem impossible`,
    `Break down the mental models that separate ${topic} winners from losers`,
    `Investigate why most ${topic} advice is completely backwards`
  ];
  
  const narrativeStyles = [
    'Documentary investigation style',
    'Personal transformation journey',
    'Scientific case study approach',
    'Behind-the-scenes revelation',
    'Step-by-step methodology breakdown',
    'Contrarian analysis format',
    'Expert interview synthesis',
    'Historical pattern analysis',
    'Psychology-focused explanation',
    'System architecture reveal'
  ];
  
  const emotionalTones = [
    'Urgent and revelatory',
    'Confident and authoritative',
    'Curious and investigative',
    'Passionate and energetic',
    'Calm and systematic',
    'Bold and challenging',
    'Empathetic and supportive',
    'Analytical and precise',
    'Inspiring and motivational',
    'Cautionary and wise'
  ];
  
  const selectedPerspective = perspectives[sessionSeed % perspectives.length];
  const selectedNarrative = narrativeStyles[(sessionSeed + attemptNumber) % narrativeStyles.length];
  const selectedTone = emotionalTones[(sessionSeed * 2 + attemptNumber) % emotionalTones.length];
  
  return {
    perspective: selectedPerspective,
    narrativeStyle: selectedNarrative,
    emotionalTone: selectedTone,
    uniqueAngle: generateUniqueAngle(topic, sessionSeed, attemptNumber),
    structuralApproach: generateStructuralApproach(sessionSeed, attemptNumber)
  };
};

const generateUniqueAngle = (topic: string, seed: number, attempt: number): string => {
  const angles = [
    `Focus on the unexpected obstacles that derail most ${topic} attempts`,
    `Emphasize the timing and sequencing that makes ${topic} work`,
    `Highlight the psychological barriers that prevent ${topic} success`,
    `Concentrate on the environmental factors that influence ${topic} outcomes`,
    `Examine the social dynamics that impact ${topic} effectiveness`,
    `Analyze the systematic thinking required for ${topic} mastery`,
    `Investigate the resource allocation strategies for ${topic}`,
    `Explore the decision-making frameworks that optimize ${topic}`,
    `Study the pattern recognition skills needed for ${topic}`,
    `Understand the adaptation strategies for ${topic} challenges`
  ];
  
  return angles[(seed + attempt * 3) % angles.length];
};

const generateStructuralApproach = (seed: number, attempt: number): string => {
  const structures = [
    'Problem → Root Cause → Solution → Implementation',
    'Mystery → Investigation → Discovery → Application',
    'Challenge → Analysis → Strategy → Execution',
    'Question → Research → Insight → Action',
    'Observation → Pattern → System → Results',
    'Conflict → Understanding → Resolution → Transformation',
    'Confusion → Clarity → Method → Success',
    'Struggle → Breakthrough → Framework → Achievement',
    'Failure → Learning → Improvement → Mastery',
    'Doubt → Evidence → Conviction → Implementation'
  ];
  
  return structures[(seed * 2 + attempt) % structures.length];
};

// Analyze voice patterns from reference scripts
const analyzeVoicePatterns = (scripts: string[]): any => {
  if (!scripts || scripts.length === 0) {
    return {
      avgSentenceLength: 15,
      vocabularyComplexity: 'moderate',
      questionFrequency: 0.1,
      personalPronounUsage: 0.08,
      transitionWords: ['however', 'therefore', 'but'],
      emotionalIntensity: 'medium'
    };
  }
  
  let totalSentences = 0;
  let totalWords = 0;
  let questionCount = 0;
  let personalPronounCount = 0;
  const vocabulary = new Set<string>();
  
  scripts.forEach(script => {
    const sentences = script.split(/[.!?]+/).filter(s => s.trim().length > 0);
    totalSentences += sentences.length;
    questionCount += (script.match(/\?/g) || []).length;
    
    const words = script.toLowerCase().split(/\s+/);
    totalWords += words.length;
    
    words.forEach(word => {
      vocabulary.add(word);
      if (['i', 'you', 'we', 'my', 'your', 'our'].includes(word)) {
        personalPronounCount++;
      }
    });
  });
  
  return {
    avgSentenceLength: Math.round(totalWords / Math.max(totalSentences, 1)),
    vocabularyComplexity: vocabulary.size > 200 ? 'high' : vocabulary.size > 100 ? 'moderate' : 'simple',
    questionFrequency: questionCount / Math.max(totalSentences, 1),
    personalPronounUsage: personalPronounCount / Math.max(totalWords, 1),
    transitionWords: ['however', 'therefore', 'meanwhile', 'furthermore'],
    emotionalIntensity: questionCount > totalSentences * 0.15 ? 'high' : 'medium'
  };
};

// Calculate target word count with strict minimum enforcement
const calculateTargetWordCount = (requestedWords: number, approach: any, complexity: string): number => {
  // Always ensure we meet or exceed the requested minimum
  const baseTarget = Math.max(requestedWords, 1200); // Absolute minimum
  
  // Add complexity multipliers
  const complexityMultiplier = approach.narrativeStyle.includes('investigation') ? 1.2 : 
                              approach.narrativeStyle.includes('breakdown') ? 1.15 : 1.1;
  
  const finalTarget = Math.max(baseTarget, Math.ceil(baseTarget * complexityMultiplier));
  
  console.log(`Word count calculation: requested=${requestedWords}, base=${baseTarget}, final=${finalTarget}`);
  return finalTarget;
};

// Build enhanced system prompt for maximum creativity
const buildSystemPrompt = (approach: any, targetWords: number, voicePatterns: any): string => {
  return `You are an elite content creator specializing in viral YouTube scripts. Your mission is to create completely original, engaging content that captures attention and drives action.

CREATIVE MANDATE:
- Perspective: ${approach.perspective}
- Narrative Style: ${approach.narrativeStyle}
- Emotional Tone: ${approach.emotionalTone}
- Unique Angle: ${approach.uniqueAngle}
- Structure: ${approach.structuralApproach}

VOICE MATCHING REQUIREMENTS:
- Average sentence length: ${voicePatterns.avgSentenceLength} words
- Vocabulary complexity: ${voicePatterns.vocabularyComplexity}
- Question frequency: ${Math.round(voicePatterns.questionFrequency * 100)}% of sentences
- Personal engagement: ${Math.round(voicePatterns.personalPronounUsage * 100)}% personal pronouns
- Emotional intensity: ${voicePatterns.emotionalIntensity}

CRITICAL REQUIREMENTS:
1. Write EXACTLY ${targetWords} words (this is non-negotiable)
2. Create completely original content - no templates or formulas
3. Match the specified narrative style throughout
4. Maintain the emotional tone consistently
5. Provide genuine value and actionable insights
6. End with a compelling call-to-action

FORBIDDEN ELEMENTS:
- Generic business clichés or buzzwords
- Template-based structures
- Predictable hooks or transitions
- Repetitive content patterns
- Filler content to reach word count

SUCCESS CRITERIA:
- Exact word count achievement: ${targetWords} words
- Completely unique perspective and approach
- Authentic voice matching reference samples
- Engaging narrative that maintains attention
- Actionable value for the viewer

Write the complete script now, ensuring every word serves a purpose and the total count is exactly ${targetWords} words.`;
};

// Build comprehensive user prompt
const buildUserPrompt = (data: any, approach: any, targetWords: number, voicePatterns: any): string => {
  const scriptSamples = data.scripts && data.scripts.length > 0 
    ? data.scripts.map((script: string, index: number) => 
        `\nREFERENCE SCRIPT ${index + 1} (${script.split(' ').length} words):\n${script}`
      ).join('')
    : '\nNo reference scripts provided - create in your best style.';

  return `${scriptSamples}

CONTENT BRIEF:
Topic: "${data.topic}"
Target Audience: ${data.targetAudience || 'YouTube viewers'}
Context: ${data.description || 'No additional context'}
Call to Action: "${data.callToAction}"
REQUIRED WORD COUNT: EXACTLY ${targetWords} words

CREATIVE DIRECTION:
${approach.perspective}

Apply this narrative approach: ${approach.narrativeStyle}
Maintain this emotional tone: ${approach.emotionalTone}
Focus on this unique angle: ${approach.uniqueAngle}
Follow this structure: ${approach.structuralApproach}

VOICE MATCHING:
Based on the reference scripts, match these patterns:
- Sentence structure and rhythm
- Vocabulary level and complexity
- Question usage and engagement style
- Personal connection approach

UNIQUENESS REQUIREMENT:
This script must be completely different from any previous content. Create something fresh, authentic, and valuable that provides a genuinely new perspective on the topic.

Generate the complete ${targetWords}-word script now:`;
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

    // Generate unique session and tracking
    const sessionId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    let attemptNumber = 0;
    let generatedScript = '';
    let isUnique = false;
    
    // Voice analysis
    const voicePatterns = analyzeVoicePatterns(scripts || []);
    
    console.log(`Starting script generation for topic: ${topic}`);
    console.log(`Requested word count: ${targetWordCount}`);
    console.log(`Session ID: ${sessionId}`);

    // Generation loop with uniqueness checking
    while (!isUnique && attemptNumber < 3) {
      const uniqueApproach = generateUniqueApproach(topic, targetAudience, sessionId, attemptNumber);
      const targetWords = calculateTargetWordCount(targetWordCount || 1400, uniqueApproach, voicePatterns.vocabularyComplexity);
      
      console.log(`Attempt ${attemptNumber + 1}: Targeting ${targetWords} words`);
      console.log(`Approach: ${uniqueApproach.perspective.substring(0, 60)}...`);
      
      const systemPrompt = buildSystemPrompt(uniqueApproach, targetWords, voicePatterns);
      const userPrompt = buildUserPrompt(requestData, uniqueApproach, targetWords, voicePatterns);

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
          temperature: 0.9 + (attemptNumber * 0.1), // Increase creativity with each attempt
          top_p: 0.95,
          system: systemPrompt,
          messages: [{
            role: 'user',
            content: userPrompt
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      generatedScript = data.content[0].text;
      
      // Verify uniqueness and word count
      isUnique = isContentUnique(generatedScript, topic, sessionId);
      const actualWordCount = generatedScript.trim().split(/\s+/).length;
      
      console.log(`Attempt ${attemptNumber + 1} results:`);
      console.log(`- Words generated: ${actualWordCount}`);
      console.log(`- Target was: ${targetWords}`);
      console.log(`- Content unique: ${isUnique}`);
      
      // If word count is significantly under target, regenerate
      if (actualWordCount < targetWordCount * 0.9) {
        console.log(`Word count too low (${actualWordCount} < ${targetWordCount * 0.9}), regenerating...`);
        isUnique = false;
      }
      
      if (isUnique && actualWordCount >= targetWordCount * 0.9) {
        // Store successful generation
        const sessionHistoryData = sessionHistory.get(sessionId) || [];
        sessionHistoryData.push({
          contentHash: generateContentHash(generatedScript),
          wordCount: actualWordCount,
          timestamp: Date.now(),
          approach: uniqueApproach.perspective
        });
        sessionHistory.set(sessionId, sessionHistoryData);
        break;
      }
      
      attemptNumber++;
    }

    const finalWordCount = generatedScript.trim().split(/\s+/).length;
    const meetsWordCount = finalWordCount >= (targetWordCount || 1400) * 0.9;

    console.log(`Final script generated:`);
    console.log(`- Final word count: ${finalWordCount}`);
    console.log(`- Requested minimum: ${targetWordCount || 1400}`);
    console.log(`- Meets requirement: ${meetsWordCount}`);
    console.log(`- Attempts needed: ${attemptNumber + 1}`);

    return new Response(
      JSON.stringify({ 
        script: generatedScript,
        success: true,
        metrics: {
          wordCount: finalWordCount,
          targetWordCount: targetWordCount || 1400,
          meetsRequirement: meetsWordCount,
          attemptsNeeded: attemptNumber + 1,
          isUnique: isUnique,
          sessionId: sessionId
        },
        message: `Script generated: ${finalWordCount} words (target: ${targetWordCount || 1400})`
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Script generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Script generation failed',
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
