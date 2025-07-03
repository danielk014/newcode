
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

CRITICAL WORD COUNT REQUIREMENT:
- The script MUST be EXACTLY ${targetWordCount} words or MORE
- This is NON-NEGOTIABLE - count every single word carefully
- If your script is under ${targetWordCount} words, you MUST expand it immediately
- Add detailed explanations, examples, stories, and additional content until you reach the target

STRUCTURE REQUIREMENTS:
1. Hook (0-15s): Attention-grabbing opening with curiosity gap
2. Problem/Setup (15s-1m): Establish the problem and emotional stakes  
3. Solution/Content (1m-80% of video): Detailed main content with examples
4. Proof/Stories (Middle section): Case studies and social proof
5. Advanced Insights: Deep dive into mechanisms and psychology
6. Payoff/CTA (Final 20%): Strong resolution and call-to-action

EXPANSION STRATEGIES (use these to reach word count):
- Add detailed step-by-step breakdowns
- Include multiple specific examples and case studies
- Add psychological explanations for why tactics work
- Include objection handling and common mistakes
- Add storytelling elements and personal anecdotes
- Provide additional context and background information
- Include advanced tips and insider secrets

The final script must be conversational, engaging, and MINIMUM ${targetWordCount} words.`;

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
      const expansionPrompt = `CRITICAL: The current script has only ${wordCount} words but MUST have at least ${targetWordCount} words. You need to add approximately ${wordsNeeded} more words.

CURRENT SCRIPT:
${generatedScript}

EXPANSION REQUIREMENTS:
- Add EXACTLY ${wordsNeeded} or more words to reach the ${targetWordCount} word minimum
- Include detailed step-by-step explanations
- Add specific examples, case studies, and success stories  
- Include psychological explanations for why tactics work
- Add more storytelling elements and personal anecdotes
- Include objection handling and common mistakes sections
- Add advanced tips and insider secrets
- Provide additional context and background information

STRUCTURE TO ADD:
1. More detailed breakdown of each main point
2. Additional examples for each concept
3. "Common Mistakes" section
4. "Advanced Strategies" section  
5. More social proof and testimonials
6. Deeper psychological explanations

Return the COMPLETE expanded script that is AT LEAST ${targetWordCount} words. Count carefully and ensure you meet this requirement.`;

      generatedScript = await callClaudeAPI(expansionPrompt, systemPrompt);
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
