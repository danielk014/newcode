import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Dynamic approach variations - no fixed templates
const generateDynamicApproach = (format: string, topic: string) => {
  const approaches = {
    "Competition Format": [
      `Write as if you're documenting a real competition where ${topic} experts compete head-to-head`,
      `Create a narrative about discovering who's the best at ${topic} through direct comparison`,
      `Tell the story of a challenge that reveals the truth about ${topic}`,
      `Document a contest that exposes the real winners and losers in ${topic}`
    ],
    "Transformation Journey": [
      `Share a personal transformation story about mastering ${topic}`,
      `Document someone's journey from complete beginner to expert in ${topic}`,
      `Tell the story of a dramatic change through ${topic}`,
      `Narrate a before-and-after transformation using ${topic}`
    ],
    "Teaching Format": [
      `Teach ${topic} like you're explaining it to a curious friend`,
      `Share practical knowledge about ${topic} through real examples`,
      `Demonstrate ${topic} skills step-by-step with personal insights`,
      `Explain ${topic} by showing rather than just telling`
    ],
    "Trend Jack Format": [
      `Connect ${topic} to what's happening right now in the world`,
      `Use current events to explain why ${topic} matters today`,
      `Ride the wave of current trends to teach ${topic}`,
      `Show how ${topic} relates to what everyone's talking about`
    ],
    "Success Story Format": [
      `Share specific results and proof about ${topic}`,
      `Document real achievements and outcomes in ${topic}`,
      `Present a case study of success with ${topic}`,
      `Show concrete evidence of ${topic} working in practice`
    ],
    "Documentary Format": [
      `Investigate the truth behind ${topic} like a journalist`,
      `Uncover hidden aspects of ${topic} through research`,
      `Present multiple perspectives on ${topic}`,
      `Deep-dive into the reality of ${topic} with evidence`
    ]
  };

  const formatApproaches = approaches[format] || approaches["Teaching Format"];
  return formatApproaches[Math.floor(Math.random() * formatApproaches.length)];
};

// Fixed word count variations - ensures minimum target is met
const getWordCountVariation = (targetWords: number) => {
  // Only allow positive variations or small negative ones that don't go below target
  const variations = [0, 25, 50, 75, 100, 150, 200, 250, 300];
  const variation = variations[Math.floor(Math.random() * variations.length)];
  return targetWords + variation; // Always at least target or higher
};

// Dynamic opening styles
const getRandomOpeningStyle = () => {
  const styles = [
    "Start with a question that makes people think",
    "Open with a surprising fact or statistic", 
    "Begin with a personal story or experience",
    "Start with a bold statement or claim",
    "Open with a common misconception",
    "Begin with a relatable scenario",
    "Start with a what-if question",
    "Open with a contrarian viewpoint"
  ];
  return styles[Math.floor(Math.random() * styles.length)];
};

// Dynamic voice instructions
const generateVoiceInstructions = (scripts: string[]) => {
  const voiceElements = [
    "sentence rhythm and pacing",
    "vocabulary choices and word selection", 
    "storytelling patterns and narrative flow",
    "emotional tone and energy level",
    "way of connecting with the audience",
    "use of examples and analogies",
    "conversational style and personality",
    "level of formality or casualness"
  ];
  
  const selectedElements = voiceElements
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);
    
  return `Focus on matching these voice elements from the reference scripts: ${selectedElements.join(', ')}`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, description, targetAudience, videoLength, scripts, callToAction, format, targetWordCount } = await req.json();
    
    const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');
    if (!claudeApiKey) {
      throw new Error('Claude API key not configured');
    }

    // Dynamic generation parameters
    const dynamicApproach = generateDynamicApproach(format, topic);
    const dynamicWordCount = getWordCountVariation(targetWordCount);
    const openingStyle = getRandomOpeningStyle();
    const voiceInstructions = generateVoiceInstructions(scripts);
    const sessionId = Date.now().toString(); // Add uniqueness

    // Completely dynamic system prompt
    const systemPrompt = `You are a creative scriptwriter who writes completely unique content every time. Each script you create must be entirely different from any previous script.

SESSION: ${sessionId}
CREATIVE MISSION: ${dynamicApproach}
TARGET WORDS: Write EXACTLY ${dynamicWordCount} words - this is CRITICAL. Count carefully and ensure you meet this exact requirement.
OPENING STYLE: ${openingStyle}
VOICE MATCHING: ${voiceInstructions}

ABSOLUTE REQUIREMENTS:
- Write in a completely natural, conversational style
- Make every sentence flow naturally into the next
- Avoid any templated language or predictable phrases
- Focus entirely on delivering valuable insights about "${topic}"
- Create genuine engagement through authentic storytelling
- End naturally with: "${callToAction}"
- MUST be exactly ${dynamicWordCount} words - no less, no more

FORBIDDEN ELEMENTS:
- Any structured sections like "HOOK", "MAIN CONTENT", etc.
- Generic business language or marketing speak
- Templated openings or transitions
- Predictable phrase patterns
- Formulaic structures

WRITE ONLY THE SCRIPT - no formatting, no sections, no analysis. Just pure, natural, conversational content that flows like natural speech and is EXACTLY ${dynamicWordCount} words.`;

    // Dynamic user prompt with randomization
    const randomSeed = Math.random().toString(36).substring(7);
    const userPrompt = `REFERENCE VOICE SAMPLES:
${scripts.map((script, index) => `\nSAMPLE ${index + 1}:\n${script}`).join('')}

CREATE UNIQUE SCRIPT:
Topic: ${topic}
Approach: ${dynamicApproach}
Context: ${description || 'No additional context'}
Audience: ${targetAudience}
Duration: ${videoLength} minutes
Word Count: EXACTLY ${dynamicWordCount} words (CRITICAL - must meet this exactly)
Call to Action: ${callToAction}
Seed: ${randomSeed}

Write a completely original script that sounds exactly like the reference voice but covers "${topic}" in a fresh, engaging way. Make it conversational and natural - like you're talking to a friend who's interested in learning about this topic.

IMPORTANT: The script MUST be exactly ${dynamicWordCount} words. Count carefully as you write.

Start now with the content:`;

    console.log(`Generating unique script with dynamic approach: ${dynamicApproach}`);
    console.log(`Dynamic word count: ${dynamicWordCount} (minimum target: ${targetWordCount})`);
    console.log(`Session ID: ${sessionId}`);

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
        temperature: 1.0, // Maximum creativity
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
    
    // Calculate metrics
    const actualWordCount = generatedScript.trim().split(/\s+/).length;
    const wordCountAccuracy = Math.abs(dynamicWordCount - actualWordCount);
    
    // Check if script meets minimum target
    const meetsMinimum = actualWordCount >= targetWordCount;
    
    // Check for uniqueness indicators
    const topicMentions = (generatedScript.toLowerCase().match(new RegExp(topic.toLowerCase(), 'g')) || []).length;
    const uniquenessScore = Math.min(100, (topicMentions * 10) + (actualWordCount / 10));

    console.log(`Dynamic script generated:`);
    console.log(`Words: ${actualWordCount}/${dynamicWordCount} (target minimum: ${targetWordCount})`);
    console.log(`Meets minimum target: ${meetsMinimum}`);
    console.log(`Approach: ${dynamicApproach}`);
    console.log(`Topic mentions: ${topicMentions}`);
    console.log(`Uniqueness score: ${uniquenessScore}`);

    return new Response(
      JSON.stringify({ 
        script: generatedScript,
        success: true,
        metrics: {
          wordCount: actualWordCount,
          targetWordCount: dynamicWordCount,
          minimumTarget: targetWordCount,
          meetsMinimum: meetsMinimum,
          wordCountAccuracy: wordCountAccuracy,
          topicRelevance: topicMentions,
          formatUsed: format,
          uniquenessScore: uniquenessScore,
          approach: dynamicApproach,
          sessionId: sessionId
        },
        message: `Unique script created using "${dynamicApproach}" approach: ${actualWordCount} words (${meetsMinimum ? 'meets' : 'below'} minimum ${targetWordCount}), ${topicMentions} topic references`
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
