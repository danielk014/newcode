
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

  console.log('Calling OpenAI API for translation...');
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  
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
        temperature: 0.3,
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', response.status, error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, targetLanguage, preserveStructure = true } = await req.json();

    if (!text || !targetLanguage) {
      throw new Error('Text and target language are required');
    }

    console.log(`Translating to ${targetLanguage}...`);

    const systemPrompt = `You are a professional translator specializing in video scripts and viral content. 
    Translate the given text to ${targetLanguage} while:
    - Preserving the emotional impact and engagement factor
    - Maintaining cultural relevance for the target audience
    - Keeping the same structure and formatting
    - Adapting idioms and expressions appropriately
    - Preserving marketing hooks and psychological triggers
    ${preserveStructure ? '- Keep all formatting, line breaks, and section markers intact' : ''}
    
    Return only the translated text, maintaining the exact same format as the input.`;

    const translatedText = await callOpenAIAPI(text, systemPrompt);

    console.log('Translation completed successfully');

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
      error: error.message || 'Translation failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
