
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const callOpenAIAPI = async (prompt: string, systemPrompt: string): Promise<string> => {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  console.log('Calling OpenAI API for script improvement...');
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Script improvement API error:', error);
    throw error;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { originalScript, improvementType, improvementInstruction, description } = await req.json();
    
    if (!originalScript || !improvementType) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Original script and improvement type are required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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

    console.log('Processing script improvement...');

    const improvedScript = await callOpenAIAPI(userPrompt, systemPrompt);

    console.log('Script improvement generated successfully');

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
