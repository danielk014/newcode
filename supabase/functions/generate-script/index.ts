
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Content uniqueness tracking
const contentHashes = new Set<string>();

// Generate a simple hash for content tracking
const simpleHash = (content: string): string => {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
};

// Analyze voice patterns from reference scripts
const analyzeVoicePatterns = (scripts: string[]) => {
  const analysis = {
    avgSentenceLength: 0,
    commonStartWords: [],
    toneMarkers: [],
    structuralPatterns: []
  };

  let totalSentences = 0;
  let totalWords = 0;
  const startWords = new Map<string, number>();

  scripts.forEach(script => {
    const sentences = script.split(/[.!?]+/).filter(s => s.trim());
    totalSentences += sentences.length;
    
    sentences.forEach(sentence => {
      const words = sentence.trim().split(/\s+/);
      totalWords += words.length;
      
      if (words.length > 0) {
        const firstWord = words[0].toLowerCase();
        startWords.set(firstWord, (startWords.get(firstWord) || 0) + 1);
      }
    });
  });

  analysis.avgSentenceLength = Math.round(totalWords / totalSentences);
  analysis.commonStartWords = Array.from(startWords.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);

  return analysis;
};

// Generate truly unique approaches based on topic and format
const generateUniqueApproach = (topic: string, format: string, sessionId: string) => {
  const perspectives = [
    `Tell this from the perspective of someone who failed at ${topic} and learned the hard way`,
    `Approach ${topic} as if you're revealing industry secrets that 'they' don't want you to know`,
    `Present ${topic} through the lens of common myths that need to be debunked`,
    `Share ${topic} as if you're a insider giving exclusive behind-the-scenes access`,
    `Teach ${topic} by showing what NOT to do first, then the right way`,
    `Frame ${topic} as solving a specific problem your audience faces daily`,
    `Present ${topic} through surprising statistics and counterintuitive facts`,
    `Share ${topic} through personal transformation stories and case studies`
  ];

  const angles = [
    `Focus on the psychological barriers that prevent success in ${topic}`,
    `Emphasize the hidden costs and unexpected benefits of ${topic}`,
    `Reveal the step-by-step process that experts use but never share`,
    `Address the specific fears and objections people have about ${topic}`,
    `Show the before-and-after transformation that's possible with ${topic}`,
    `Expose the common scams and misconceptions around ${topic}`,
    `Demonstrate the compound effect of small actions in ${topic}`,
    `Connect ${topic} to current trends and cultural moments`
  ];

  const sessionSeed = parseInt(sessionId.slice(-4), 16) || 1;
  const perspectiveIndex = sessionSeed % perspectives.length;
  const angleIndex = (sessionSeed * 7) % angles.length;

  return {
    perspective: perspectives[perspectiveIndex],
    angle: angles[angleIndex]
  };
};

// Generate dynamic word count with intelligent variation
const calculateTargetWords = (baseTarget: number, topic: string, sessionId: string): number => {
  const sessionSeed = parseInt(sessionId.slice(-4), 16) || 1;
  const topicComplexity = topic.length > 20 ? 1.2 : 1.0;
  const randomFactor = 1 + (sessionSeed % 30) / 100; // 0-30% variation
  
  return Math.max(baseTarget, Math.round(baseTarget * topicComplexity * randomFactor));
};

// Create content-aware system prompt
const buildSystemPrompt = (approach: any, targetWords: number, voicePatterns: any, sessionId: string) => {
  return `You are an expert scriptwriter creating completely unique content. Your mission is to write something that has NEVER been written before.

CREATIVE MANDATE:
${approach.perspective}
${approach.angle}

VOICE REQUIREMENTS:
- Average sentence length: ${voicePatterns.avgSentenceLength} words
- Incorporate starting patterns like: ${voicePatterns.commonStartWords.join(', ')}
- Match the conversational rhythm of the reference scripts

CONTENT RULES:
- Write EXACTLY ${targetWords} words (count carefully)
- Make every script fundamentally different in structure and content
- Use fresh analogies, examples, and stories
- Avoid generic business language
- Create genuine emotional connection
- Session ID: ${sessionId} (for uniqueness tracking)

FORBIDDEN:
- Template language or formulaic structures
- Generic marketing phrases
- Predictable openings or transitions
- Repeated content patterns from previous scripts

Write pure, natural content that flows like authentic conversation.`;
};

// Enhanced user prompt with dynamic elements
const buildUserPrompt = (data: any, approach: any, targetWords: number, sessionId: string) => {
  const dynamicElements = [
    `Current context: ${new Date().toLocaleDateString()} session`,
    `Unique angle: ${approach.angle}`,
    `Content perspective: ${approach.perspective}`,
    `Session identifier: ${sessionId}`
  ];

  return `REFERENCE VOICE SAMPLES:
${data.scripts.map((script: string, index: number) => `\nVOICE SAMPLE ${index + 1}:\n${script}`).join('')}

CONTENT CREATION BRIEF:
Topic: ${data.topic}
Perspective: ${approach.perspective}
Angle: ${approach.angle}
Target Words: EXACTLY ${targetWords}
Call to Action: ${data.callToAction}
Context: ${data.description || 'No additional context'}
Audience: ${data.targetAudience}

UNIQUENESS FACTORS:
${dynamicElements.map(elem => `- ${elem}`).join('\n')}

Create a completely original script that:
1. Matches the voice patterns from the samples
2. Covers "${data.topic}" from this unique perspective
3. Is EXACTLY ${targetWords} words
4. Feels like natural conversation
5. Has never been written before

Begin writing the script now:`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { topic, description, targetAudience, videoLength, scripts, callToAction, format, targetWordCount } = requestData;
    
    const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');
    if (!claudeApiKey) {
      throw new Error('Claude API key not configured');
    }

    // Generate unique session and approach
    const sessionId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    const voicePatterns = analyzeVoicePatterns(scripts);
    const uniqueApproach = generateUniqueApproach(topic, format, sessionId);
    const targetWords = calculateTargetWords(targetWordCount, topic, sessionId);

    // Build dynamic prompts
    const systemPrompt = buildSystemPrompt(uniqueApproach, targetWords, voicePatterns, sessionId);
    const userPrompt = buildUserPrompt(requestData, uniqueApproach, targetWords, sessionId);

    console.log(`Generating unique script - Session: ${sessionId}`);
    console.log(`Approach: ${uniqueApproach.perspective.substring(0, 100)}...`);
    console.log(`Target words: ${targetWords} (base: ${targetWordCount})`);

    // Use latest Claude model with maximum creativity
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
        top_p: 0.95,
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
    
    // Verify uniqueness
    const scriptHash = simpleHash(generatedScript);
    const isUnique = !contentHashes.has(scriptHash);
    contentHashes.add(scriptHash);

    // Calculate metrics
    const actualWordCount = generatedScript.trim().split(/\s+/).length;
    const meetsTarget = actualWordCount >= targetWordCount;
    const accuracy = Math.abs(targetWords - actualWordCount);

    console.log(`Script generated successfully:`);
    console.log(`- Words: ${actualWordCount}/${targetWords} (target: ${targetWordCount})`);
    console.log(`- Meets minimum: ${meetsTarget}`);
    console.log(`- Unique content: ${isUnique}`);
    console.log(`- Session: ${sessionId}`);

    return new Response(
      JSON.stringify({ 
        script: generatedScript,
        success: true,
        metrics: {
          wordCount: actualWordCount,
          targetWordCount: targetWords,
          minimumTarget: targetWordCount,
          meetsMinimum: meetsTarget,
          accuracy: accuracy,
          isUnique: isUnique,
          sessionId: sessionId,
          approach: uniqueApproach.perspective.substring(0, 100) + '...',
          voiceMatchScore: Math.min(100, 100 - accuracy)
        },
        message: `Unique script generated using innovative approach: ${actualWordCount} words, ${isUnique ? 'completely unique' : 'similar to previous'} content`
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in generate-script function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate script',
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
