
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

    const systemPrompt = `You are an expert YouTube script writer specializing in viral content creation and precise style replication.

🚨 CRITICAL WORD COUNT REQUIREMENT 🚨
- MINIMUM ${targetWordCount} WORDS - THIS IS MANDATORY
- COUNT EVERY SINGLE WORD - NO EXCEPTIONS
- GENERATE A COMPLETE, FULL-LENGTH SCRIPT
- DO NOT PROVIDE INSTRUCTIONS OR META-COMMENTARY
- ONLY RETURN THE ACTUAL SCRIPT CONTENT

🎯 YOUR TASK 🎯
Generate a complete YouTube script that:
1. Uses proven viral psychological triggers
2. Follows high-converting structure patterns
3. Includes engaging storytelling elements
4. Has clear hooks and retention elements
5. Ends with strong call-to-action

When reference scripts are provided, analyze and replicate:
- EXACT formatting patterns (headers, bullet points, spacing, capitalization)
- Writing tone and voice (casual/formal, energy level, personality)
- Sentence structure and length patterns
- Specific psychological triggers used
- Hook patterns and opening styles
- Transition phrases and connectors
- Call-to-action language and placement
- Storytelling approach and narrative flow

SCRIPT STRUCTURE (MINIMUM ${targetWordCount} WORDS):
1. **VIRAL HOOK (0-15s)** - Pattern interrupt + curiosity gap
2. **PROBLEM SETUP (15s-45s)** - Emotional pain points and frustrations
3. **SOLUTION FRAMEWORK (45s-4m)** - Step-by-step methodology with examples
4. **PROOF & EXAMPLES (Throughout)** - Success stories and case studies
5. **ADVANCED INSIGHTS (4m-5m)** - Hidden mechanisms and advanced tips
6. **STRONG CTA (Final 30s)** - Clear next steps with urgency

CRITICAL: You must generate a COMPLETE script, not instructions about script writing. Start immediately with the hook and continue through to the call-to-action.`;

    const userPrompt = `Generate a complete ${targetWordCount}+ word YouTube script about "${topic}".

**SCRIPT REQUIREMENTS:**
• Topic: ${topic}
• Description: ${description || 'Not specified'}
• Target Audience: ${targetAudience || 'General YouTube audience'}
• Video Length: ${videoLength || 'Not specified'} minutes
• Format Style: ${format || 'Copy Reference Script Format'}
• Call to Action: ${callToAction || 'Subscribe and like'}
• MINIMUM WORDS: ${targetWordCount}

${scripts.length > 0 ? `**REFERENCE SCRIPTS TO ANALYZE AND REPLICATE:**

${scripts.map((script, index) => `
=== REFERENCE SCRIPT ${index + 1} ===
${script}
==============================
`).join('\n')}

**REPLICATION INSTRUCTIONS:**
Study the reference scripts above and replicate their:
- Exact formatting style and structure
- Writing tone, voice, and personality
- Psychological triggers and persuasion techniques
- Storytelling approach and narrative flow
- Hook patterns and retention elements
- Transition phrases and language patterns
- Call-to-action style and placement

Your script must feel like it was written by the same person who wrote the reference scripts.` : ''}

**GENERATE THE COMPLETE SCRIPT NOW:**
Start with a powerful hook and create a full ${targetWordCount}+ word script that follows the proven structure. Do not provide instructions or commentary - only the actual script content.

BEGIN THE SCRIPT:`;

    console.log(`Generating script with minimum ${targetWordCount} words...`);

    let generatedScript = await callClaudeAPI(userPrompt, systemPrompt);
    let attempts = 0;
    const maxAttempts = 3;

    // Robust word count validation with multiple expansion attempts
    while (attempts < maxAttempts) {
      const wordCount = generatedScript.trim().split(/\s+/).length;
      console.log(`Attempt ${attempts + 1}: Script generated with ${wordCount} words (target: ${targetWordCount})`);

      if (wordCount >= targetWordCount) {
        console.log(`✅ Word count requirement met: ${wordCount} words`);
        break;
      }

      attempts++;
      console.log(`⚠️ Script too short (${wordCount} words), expanding... (Attempt ${attempts}/${maxAttempts})`);
      
      const wordsNeeded = targetWordCount - wordCount;
      const expansionPrompt = `You previously generated a script that is too short. Here is the current script:

${generatedScript}

This script has only ${wordCount} words but needs to be at least ${targetWordCount} words. Please expand it by adding ${wordsNeeded} more words while maintaining the same style and quality.

Add content by:
- Expanding existing sections with more details and examples
- Adding more psychological explanations
- Including additional case studies and success stories
- Providing more step-by-step breakdowns
- Adding advanced tips and strategies

Return the COMPLETE expanded script that reaches the ${targetWordCount} word requirement:`;

      generatedScript = await callClaudeAPI(expansionPrompt, "You are a script writer. Expand the provided script to meet the word count requirement while maintaining quality and style. Return only the expanded script content, no instructions or commentary.");
    }

    const finalWordCount = generatedScript.trim().split(/\s+/).length;
    console.log(`Final script completed with ${finalWordCount} words after ${attempts + 1} attempts`);

    console.log('Script generation completed successfully');

    return new Response(
      JSON.stringify({ 
        script: generatedScript,
        success: true,
        wordCount: generatedScript.trim().split(/\s+/).length,
        targetWordCount: targetWordCount
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
