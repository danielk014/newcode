
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const callOpenAIAPI = async (prompt: string, systemPrompt: string): Promise<string> => {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    console.error('OpenAI API key not found in environment variables');
    throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in Supabase secrets.');
  }

  console.log('Calling OpenAI API for translation...');
  console.log('API key exists:', openAIApiKey ? 'Yes' : 'No');
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        max_tokens: 8000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
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
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error('Invalid response from OpenAI API');
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Translation API error:', error);
    throw error;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { text, targetLanguage, preserveStructure = true } = requestBody;

    if (!text || !targetLanguage) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Text and target language are required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Starting translation to ${targetLanguage}...`);
    console.log(`Source text length: ${text.length} characters`);

    const systemPrompt = `You are a professional translator specializing in video scripts and viral content. 

🚨 CRITICAL REQUIREMENT: You MUST translate the ENTIRE input text without any truncation or omission.

Translate the given text to ${targetLanguage} while:
- Preserving the emotional impact and engagement factor
- Maintaining cultural relevance for the target audience
- Keeping the same structure and formatting
- Adapting idioms and expressions appropriately
- Preserving marketing hooks and psychological triggers
- TRANSLATING EVERY SINGLE WORD AND SECTION
${preserveStructure ? '- Keep all formatting, line breaks, and section markers intact' : ''}

IMPORTANT: Return the COMPLETE translation. Do not summarize, shorten, or omit any content. The output must be as comprehensive as the input.`;

    const userPrompt = `Please translate this COMPLETE script to ${targetLanguage}. Make sure to translate EVERY section and maintain the full length:

${text}

Remember: Translate the ENTIRE script above without any omissions.`;

    const translatedText = await callOpenAIAPI(userPrompt, systemPrompt);

    const translatedLength = translatedText.length;
    console.log(`Translation completed successfully. Output length: ${translatedLength} characters`);

    return new Response(JSON.stringify({ 
      success: true, 
      translatedText: translatedText,
      sourceLanguage: 'auto-detected',
      targetLanguage: targetLanguage,
      sourceLength: text.length,
      translatedLength: translatedLength
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
