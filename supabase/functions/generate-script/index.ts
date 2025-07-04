
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const callClaudeAPI = async (prompt: string, systemPrompt: string): Promise<string> => {
  const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');
  if (!claudeApiKey) {
    throw new Error('Claude API key not configured');
  }

  console.log('Calling Claude API for script generation...');
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // Extended timeout for longer scripts
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': claudeApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 8000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: prompt }
        ]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', response.status, errorText);
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      throw new Error('Invalid response from Claude API');
    }
    
    return data.content[0].text;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Script generation API error:', error);
    throw error;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      topic, 
      description, 
      targetAudience, 
      videoLength,
      scripts = [], 
      callToAction,
      format,
      targetWordCount = 1400
    } = await req.json();
    
    if (!topic) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Topic is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are an expert YouTube script writer specializing in viral content creation.

🚨 CRITICAL REQUIREMENTS 🚨
- GENERATE EXACTLY ${targetWordCount} WORDS OR MORE
- OUTPUT ONLY THE ACTUAL SCRIPT CONTENT
- NO INSTRUCTIONS, NO COMMENTARY, NO META-TEXT
- START DIRECTLY WITH THE HOOK

🎯 PSYCHOLOGICAL TACTICS TO APPLY 🎯
${scripts.length > 0 ? `
ANALYZE THE REFERENCE SCRIPTS AND EXTRACT:
1. Specific psychological triggers (fear, urgency, curiosity, social proof)
2. Persuasion techniques (authority, scarcity, reciprocity)
3. Emotional patterns (problem agitation, solution revelation)
4. Hook structures (pattern interrupts, bold claims)
5. Storytelling elements (case studies, testimonials)
6. Call-to-action styles (urgency, benefit reinforcement)

REPLICATE THESE EXACT ELEMENTS:
- Copy the writing tone and personality
- Use similar sentence structures and rhythm
- Apply the same psychological trigger sequences
- Mirror the emotional progression patterns
- Replicate the formatting style exactly
` : `
APPLY THESE PROVEN PSYCHOLOGICAL TACTICS:
1. Pattern Interrupt Hook (0-3s)
2. Curiosity Gap Creation (3-15s)
3. Problem Agitation (15-45s)
4. Authority Positioning (45s-1m)
5. Social Proof Integration (1-2m)
6. Solution Framework (2-4m)
7. Future Pacing (4-5m)
8. Scarcity/Urgency CTA (final 30s)
`}

SCRIPT STRUCTURE (MINIMUM ${targetWordCount} WORDS):
1. **HOOK (0-15s)** - Bold claim + pattern interrupt
2. **PROBLEM (15-60s)** - Pain point agitation
3. **SOLUTION (1-4m)** - Detailed methodology with examples
4. **PROOF (Throughout)** - Success stories and data
5. **ADVANCED TIPS (4-5m)** - Expert insights
6. **CTA (Final 30s)** - Urgent action with benefits

OUTPUT FORMAT: Pure script content only. No headings like "Hook:" or "Problem:" - just the actual words to be spoken.`;

    const userPrompt = `Create a ${targetWordCount}+ word YouTube script about: "${topic}"

TARGET: ${targetWordCount} WORDS MINIMUM
TOPIC: ${topic}
DESCRIPTION: ${description || 'Create engaging viral content'}
AUDIENCE: ${targetAudience || 'YouTube viewers'}
CTA: ${callToAction || 'Subscribe and like'}

${scripts.length > 0 ? `
REFERENCE SCRIPTS TO ANALYZE:
${scripts.map((script, index) => `
=== REFERENCE ${index + 1} ===
${script}
===============================
`).join('\n')}

INSTRUCTIONS:
1. Deeply analyze each reference script's psychological tactics
2. Extract their persuasion patterns and emotional triggers
3. Copy their writing style, tone, and formatting exactly
4. Apply their proven psychological frameworks to your new topic
5. Maintain their sentence structure and rhythm patterns
6. Use their specific transition phrases and power words
7. Mirror their storytelling approach and case study style
8. Replicate their call-to-action urgency and language

Your script must feel like it was written by the same person who wrote these references.
` : ''}

SCRIPT CONTENT (${targetWordCount}+ WORDS):
`;

    console.log(`Generating script with minimum ${targetWordCount} words...`);

    let generatedScript = await callClaudeAPI(userPrompt, systemPrompt);
    let attempts = 0;
    const maxAttempts = 5; // Increased attempts

    // Enhanced word count validation
    while (attempts < maxAttempts) {
      const wordCount = generatedScript.trim().split(/\s+/).filter(word => word.length > 0).length;
      console.log(`Attempt ${attempts + 1}: Script generated with ${wordCount} words (target: ${targetWordCount})`);

      if (wordCount >= targetWordCount) {
        console.log(`✅ Word count requirement met: ${wordCount} words`);
        break;
      }

      attempts++;
      console.log(`⚠️ Script too short (${wordCount} words), expanding... (Attempt ${attempts}/${maxAttempts})`);
      
      const wordsNeeded = targetWordCount - wordCount;
      const expansionPrompt = `EXPAND THIS SCRIPT TO ${targetWordCount} WORDS:

CURRENT SCRIPT (${wordCount} words):
${generatedScript}

REQUIREMENTS:
- Add ${wordsNeeded} more words to reach ${targetWordCount} total
- Expand with detailed examples, case studies, and psychological explanations
- Add more storytelling elements and specific tactics
- Include advanced strategies and implementation details
- Maintain the same writing style and tone throughout

EXPANDED SCRIPT (${targetWordCount}+ words):`;

      const expansionSystemPrompt = `You are expanding a YouTube script to meet word count requirements. 

CRITICAL RULES:
- Output ONLY the expanded script content
- NO instructions or commentary
- Reach exactly ${targetWordCount} words or more
- Maintain the original style and flow
- Add substantial content, not filler

Return the complete expanded script:`;

      generatedScript = await callClaudeAPI(expansionPrompt, expansionSystemPrompt);
    }

    const finalWordCount = generatedScript.trim().split(/\s+/).filter(word => word.length > 0).length;
    console.log(`Final script completed with ${finalWordCount} words after ${attempts + 1} attempts`);

    if (finalWordCount < targetWordCount) {
      console.log(`⚠️ WARNING: Final script (${finalWordCount} words) is still below target (${targetWordCount} words)`);
    }

    console.log('Script generation completed successfully');

    return new Response(
      JSON.stringify({ 
        script: generatedScript,
        success: true,
        wordCount: finalWordCount,
        targetWordCount: targetWordCount,
        attempts: attempts + 1
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
