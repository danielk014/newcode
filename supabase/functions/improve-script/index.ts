
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { originalScript, improvementType, improvementInstruction, description } = await req.json();
    
    const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');
    if (!claudeApiKey) {
      throw new Error('Claude API key not configured');
    }

    const systemPrompt = `You are an expert YouTube script editor who specializes in applying specific improvements to existing scripts. You understand viral content strategies and how to enhance scripts for better engagement and conversion.

Your task is to:
1. Take the original script and apply the specific improvement requested
2. Maintain the original script's core message and structure
3. Clearly mark where improvements have been made
4. Ensure the improved version flows naturally
5. Keep the same approximate length and style`;

    const userPrompt = `Please improve this YouTube script by applying the following specific enhancement:

**Improvement Type:** ${improvementType}
**Improvement Instruction:** ${improvementInstruction}
**Description:** ${description}

**Original Script:**
${originalScript}

**Requirements:**
1. Apply the specific improvement requested
2. Mark improved sections with **[IMPROVED]** tags so they're easily identifiable
3. Maintain the original script's flow and message
4. Ensure the improvement enhances engagement and retention
5. Keep the same overall structure and length

**Output Format:**
Provide the complete improved script with **[IMPROVED]** markers around the enhanced sections.`;

    console.log('Calling Claude API for script improvement...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        temperature: 0.7,
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
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Script improvement generated successfully');
    
    const improvedScript = data.content[0].text;

    return new Response(
      JSON.stringify({ 
        improvedScript: improvedScript,
        success: true,
        improvementApplied: improvementType
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in improve-script function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to improve script',
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
