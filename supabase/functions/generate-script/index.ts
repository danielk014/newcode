
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

    const systemPrompt = `You are an expert YouTube script writer specializing in viral content creation. Your task is to generate high-converting scripts that maximize engagement, retention, and conversion rates.

CRITICAL REQUIREMENTS:
1. The script MUST be at least ${targetWordCount} words long - this is non-negotiable
2. Use the provided reference scripts as style guides but create completely original content
3. Apply proven psychological tactics and viral elements
4. Structure the script for maximum retention and engagement
5. Include clear formatting with timing markers

Your script must include:
- Hook (0-15s): Attention-grabbing opening
- Problem/Setup (15s-1m): Establish the problem or context
- Solution/Content (1m-80% of video): Main content delivery
- Payoff/CTA (Final 20%): Resolution and call-to-action

WORD COUNT ENFORCEMENT: If your initial script is under ${targetWordCount} words, you MUST expand it by:
- Adding more detailed explanations
- Including additional examples and case studies
- Expanding on psychological triggers
- Adding more storytelling elements
- Including more social proof and testimonials

The final script must be engaging, conversational, and feel natural while meeting the exact word count requirement.`;

    const userPrompt = `Generate a viral YouTube script with these specifications:

**Topic:** ${topic}
**Description:** ${description || 'Not specified'}
**Target Audience:** ${targetAudience || 'General YouTube audience'}
**Video Length:** ${videoLength || 'Not specified'} minutes
**Format Style:** ${format || 'Not specified'}
**Call to Action:** ${callToAction || 'Subscribe and like'}
**MINIMUM WORD COUNT:** ${targetWordCount} words (THIS IS MANDATORY)

${scripts.length > 0 ? `**Reference Scripts for Style (use as inspiration but create original content):**
${scripts.map((script, index) => `
Reference Script ${index + 1}:
${script.substring(0, 500)}...
`).join('\n')}` : ''}

**Instructions:**
1. Create a completely original script - do not copy from references
2. The script MUST be at least ${targetWordCount} words - count them and expand if needed
3. Use viral psychological tactics and engagement techniques
4. Include timing markers and clear structure
5. Make it conversational and engaging
6. Include specific examples and storytelling elements
7. If the script is under ${targetWordCount} words, expand it with more content, examples, and details

**Output the complete script with word count verification.**`;

    console.log(`Generating script with minimum ${targetWordCount} words...`);

    let generatedScript = await callClaudeAPI(userPrompt, systemPrompt);

    // Check word count and regenerate if needed
    const wordCount = generatedScript.trim().split(/\s+/).length;
    console.log(`Initial script generated with ${wordCount} words`);

    if (wordCount < targetWordCount) {
      console.log(`Script too short (${wordCount} words), expanding...`);
      
      const expansionPrompt = `The previous script only has ${wordCount} words but needs to be at least ${targetWordCount} words. 

EXPAND this script to meet the word count requirement by:
1. Adding more detailed explanations and examples
2. Including additional case studies and success stories
3. Expanding psychological elements and storytelling
4. Adding more specific details and actionable advice
5. Including more social proof and testimonials

Current script:
${generatedScript}

REQUIREMENTS:
- Expand to AT LEAST ${targetWordCount} words
- Maintain the same quality and engagement level
- Keep the original structure but add substantial content
- Make expansions feel natural and valuable, not just filler

Return the complete expanded script.`;

      generatedScript = await callClaudeAPI(expansionPrompt, systemPrompt);
      
      const finalWordCount = generatedScript.trim().split(/\s+/).length;
      console.log(`Final script generated with ${finalWordCount} words`);
    }

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
