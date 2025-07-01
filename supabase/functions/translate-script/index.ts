
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
    const { text, targetLanguage, preserveStructure = true } = await req.json();

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
            content: `You are a professional translator specializing in video scripts and viral content. 
            Translate the given text to ${targetLanguage} while:
            - Preserving the emotional impact and engagement factor
            - Maintaining cultural relevance for the target audience
            - Keeping the same structure and formatting
            - Adapting idioms and expressions appropriately
            - Preserving marketing hooks and psychological triggers
            ${preserveStructure ? '- Keep all formatting, line breaks, and section markers intact' : ''}
            
            Return only the translated text, maintaining the exact same format as the input.`
          },
          { role: 'user', content: text }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const translatedText = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      success: true, 
      translatedText: translatedText,
      sourceLanguage: 'auto-detected',
      targetLanguage: targetLanguage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error translating script:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
