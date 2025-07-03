
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

  console.log('Calling Claude API for translation...');
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);
  
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
        max_tokens: 4000,
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

    const systemPrompt = `You are a professional translator specializing in video scripts and viral content. 
    Translate the given text to ${targetLanguage} while:
    - Preserving the emotional impact and engagement factor
    - Maintaining cultural relevance for the target audience
    - Keeping the same structure and formatting
    - Adapting idioms and expressions appropriately
    - Preserving marketing hooks and psychological triggers
    ${preserveStructure ? '- Keep all formatting, line breaks, and section markers intact' : ''}
    
    Return only the translated text, maintaining the exact same format as the input.`;

    const translatedText = await callClaudeAPI(text, systemPrompt);

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
