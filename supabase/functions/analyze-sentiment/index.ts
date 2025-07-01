
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a sentiment analysis expert. Analyze the emotional tone of the given text and return a JSON object with:
            - overall_sentiment: "positive", "negative", or "neutral"
            - confidence: number between 0-1
            - emotions: array of detected emotions with intensity scores
            - tone_indicators: array of specific tonal elements
            - engagement_score: predicted engagement level (0-100)
            - viral_potential: assessment of viral potential (0-100)
            
            Focus on elements that drive engagement: urgency, curiosity, controversy, relatability, emotional hooks.`
          },
          { role: 'user', content: text }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify({ 
      success: true, 
      sentiment: analysis 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
