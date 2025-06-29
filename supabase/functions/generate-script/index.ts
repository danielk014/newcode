
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
    const { topic, targetAudience, videoLength, script1, script2, callToAction } = await req.json();
    
    const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');
    if (!claudeApiKey) {
      throw new Error('Claude API key not configured');
    }

    // Create a comprehensive prompt that incorporates the reference scripts
    const systemPrompt = `You are an expert YouTube script writer who specializes in creating engaging, high-converting scripts. You analyze successful reference scripts to understand their psychological tactics and structure, then create new scripts that incorporate these proven techniques while being completely original.

Key principles:
1. Use proven psychological tactics like pattern interrupts, curiosity gaps, social proof, scarcity, authority, and future pacing
2. Structure scripts for maximum engagement and retention
3. Include clear calls-to-action that drive viewer behavior
4. Write in a conversational, engaging tone
5. Use storytelling elements to maintain interest`;

    const userPrompt = `Please create a compelling YouTube script based on the following information:

**Topic:** ${topic}
**Target Audience:** ${targetAudience}
**Video Length:** ${videoLength} minutes
**Call to Action:** ${callToAction}

**Reference Scripts for Analysis:**
Reference Script 1:
${script1}

Reference Script 2:
${script2}

**Instructions:**
1. Analyze the psychological tactics used in the reference scripts
2. Create a new, original script that incorporates the most effective techniques
3. Structure the script with clear sections: Hook, Problem/Pain Point, Solution, Value Delivery, and Call-to-Action
4. Aim for approximately ${Math.round(videoLength * 140)} words (140 words per minute)
5. Include specific timestamps for each section
6. Make the script engaging, conversational, and action-oriented

**Format the output as follows:**
**HOOK (0-15s)**
[Compelling opening that grabs attention]

**PROBLEM SETUP (15-45s)**
[Identify and amplify the pain point]

**SOLUTION INTRODUCTION (45s-2m)**
[Present your solution with authority]

**VALUE DELIVERY (2-4m)**
[Provide valuable content and build credibility]

**CALL TO ACTION (4-5m)**
[Clear, compelling call to action]

Create a script that feels natural and engaging while incorporating proven psychological principles from the reference materials.`;

    console.log('Calling Claude API with topic:', topic);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
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
    console.log('Claude API Response received');
    
    const generatedScript = data.content[0].text;

    return new Response(
      JSON.stringify({ 
        script: generatedScript,
        success: true 
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
