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

  console.log('Calling OpenAI API for script generation...');
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        max_tokens: 8000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ]
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
      targetWordCount = 2000
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

    const systemPrompt = `You are a professional YouTube script writer. Your job is to write actual script content that will be spoken in a video.

CRITICAL RULES:
1. Write ONLY the script content that will be spoken aloud
2. Do NOT write any instructions, explanations, or meta-commentary
3. Do NOT use section headers like "Hook:" or "Problem:" 
4. Start writing the script immediately with the opening words
5. Write at least ${targetWordCount} words
6. Use engaging, conversational language as if speaking directly to viewers

When reference scripts are provided, analyze their style and replicate:
- Their tone of voice and personality
- Their psychological triggers and persuasion techniques  
- Their formatting and structure patterns
- Their storytelling approach and examples
- Their call-to-action style

Write a complete YouTube script that viewers will hear when watching the video.`;

    let userPrompt;
    
    if (scripts.length > 0) {
      userPrompt = `Write a ${targetWordCount}+ word YouTube script about "${topic}".

Here are reference scripts to analyze and replicate the style:

${scripts.map((script, index) => `
REFERENCE SCRIPT ${index + 1}:
${script}
---
`).join('\n')}

Study these reference scripts and write a new script about "${topic}" that:
- Uses the same writing style and tone
- Applies similar psychological triggers  
- Follows similar structure patterns
- Includes engaging examples and stories
- Ends with a compelling call-to-action: "${callToAction}"

Target audience: ${targetAudience}
${description ? `Context: ${description}` : ''}

Write the complete script (minimum ${targetWordCount} words):`;
    } else {
      userPrompt = `Write a complete ${targetWordCount}+ word YouTube script about "${topic}".

Requirements:
- Target audience: ${targetAudience}
- Call-to-action: "${callToAction}"
${description ? `- Context: ${description}` : ''}
- Use proven viral techniques like hooks, storytelling, and psychological triggers
- Include specific examples and actionable advice
- Write in an engaging, conversational tone

Start writing the script now:`;
    }

    console.log(`Generating script with target ${targetWordCount} words for topic: ${topic}`);

    const generatedScript = await callOpenAIAPI(userPrompt, systemPrompt);
    const finalWordCount = generatedScript.trim().split(/\s+/).filter(word => word.length > 0).length;
    console.log(`Generated script: ${finalWordCount} words`);

    return new Response(
      JSON.stringify({ 
        script: generatedScript,
        success: true,
        wordCount: finalWordCount,
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