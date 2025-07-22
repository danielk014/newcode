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

  console.log('Calling OpenAI API for enhanced script generation...');
  
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
        model: 'gpt-4o-2025-04-14',
        temperature: 0.7,
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
      analysis,
      scripts = [], 
      callToAction,
      videoFormat,
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

    // Extract format details
    const platform = videoFormat?.platform || 'youtube';
    const isShortForm = videoFormat?.format === 'short';
    const duration = videoFormat?.duration || (isShortForm ? '30-60 seconds' : '8-10 minutes');
    const style = videoFormat?.style || 'Educational';

    // Build comprehensive system prompt based on format
    const systemPrompt = `You are an expert ${platform} script writer specializing in ${isShortForm ? 'viral short-form' : 'long-form'} content.

CRITICAL FORMAT REQUIREMENTS:
- Platform: ${platform}
- Format: ${isShortForm ? 'SHORT-FORM' : 'LONG-FORM'} (${duration})
- Style: ${style}
- Target: EXACTLY ${targetWordCount} words

${isShortForm ? `
SHORT-FORM SPECIFIC RULES:
1. First 3 seconds MUST hook immediately - no introductions
2. Every 5-10 seconds needs a micro-hook or pattern interrupt
3. Show don't tell - reference visuals/actions
4. End with a loop back to beginning or strong CTA
5. Use platform-specific language (e.g., "Stop scrolling" for TikTok, not YouTube)
` : `
LONG-FORM SPECIFIC RULES:
1. First 15 seconds establish credibility and promise
2. Use chapter-style structure with clear sections
3. Include detailed examples and case studies
4. Build emotional journey from problem to transformation
5. Multiple CTAs throughout, strongest at end
`}

WRITING RULES:
1. Write ONLY the spoken script - no stage directions or [brackets]
2. Use natural, conversational language
3. Apply psychological tactics subtly and effectively
4. Match the exact style and energy of reference scripts
5. ${isShortForm ? 'Be extremely concise - every word counts' : 'Be comprehensive but engaging throughout'}

When applying tactics:
- Don't just mention them, DEMONSTRATE them in the writing
- Layer multiple tactics for compound effect
- Time them according to platform best practices`;

    let userPrompt = `Create a ${targetWordCount}-word ${platform} script about "${topic}".

Format: ${isShortForm ? 'SHORT-FORM' : 'LONG-FORM'} (${duration})
Style: ${style}
Target Audience: ${targetAudience || 'General audience'}
Call-to-Action: ${callToAction}
${description ? `Additional Context: ${description}` : ''}`;

    // Add analysis insights if available
    if (analysis && analysis.synthesizedTactics) {
      userPrompt += `\n\nKEY TACTICS TO APPLY (from analysis):`;
      analysis.synthesizedTactics.forEach((tactic: any) => {
        userPrompt += `\n- ${tactic.name}: ${tactic.description} (Strength: ${tactic.avgStrength}/10)`;
        if (tactic.bestPractices) {
          userPrompt += `\n  Best Practice: ${tactic.bestPractices}`;
        }
      });
    }

    // Add structure blueprint if available
    if (analysis && analysis.recommendedStructure) {
      userPrompt += `\n\nRECOMMENDED STRUCTURE:`;
      analysis.recommendedStructure.blueprint.forEach((section: any) => {
        userPrompt += `\n- ${section.section} (${section.duration}): ${section.goal}`;
        userPrompt += `\n  Tactics: ${section.tactics.join(', ')}`;
      });
    }

    // Add reference scripts with tactic analysis
    if (scripts.length > 0) {
      userPrompt += `\n\nREFERENCE SCRIPTS TO ANALYZE:`;
      scripts.forEach((script: string, index: number) => {
        userPrompt += `\n\n--- REFERENCE ${index + 1} ---\n${script}`;
        
        // Add detected tactics from this script if available
        if (analysis && analysis.scriptAnalyses && analysis.scriptAnalyses[index]) {
          const scriptAnalysis = analysis.scriptAnalyses[index];
          userPrompt += `\n\nDETECTED TACTICS IN THIS SCRIPT:`;
          scriptAnalysis.tactics.forEach((tactic: any) => {
            userPrompt += `\n- ${tactic.name} (${tactic.strength}/10): "${tactic.exactPhrase}"`;
          });
        }
      });
      
      userPrompt += `\n\nREPLICATE the style, energy, and psychological techniques from these references while creating original content about "${topic}".`;
    }

    // Platform-specific instructions
    if (platform === 'tiktok' && isShortForm) {
      userPrompt += `\n\nTIKTOK OPTIMIZATION:
- Start with "Stop scrolling" or similar scroll-stopper
- Reference trending sounds/challenges if relevant
- Use Gen-Z language and references
- End with "Follow for more" or save prompt`;
    } else if (platform === 'youtube' && !isShortForm) {
      userPrompt += `\n\nYOUTUBE OPTIMIZATION:
- Hook must compete with suggested videos
- Reference "in this video" for clarity
- Use "chapters" language for navigation
- Strong end screen CTA setup`;
    }

    userPrompt += `\n\nWrite the complete ${targetWordCount}-word script now:`;

    console.log(`Generating enhanced ${isShortForm ? 'short' : 'long'}-form script for ${platform}`);

    const generatedScript = await callOpenAIAPI(userPrompt, systemPrompt);
    const finalWordCount = generatedScript.trim().split(/\s+/).filter(word => word.length > 0).length;
    console.log(`Generated script: ${finalWordCount} words (target: ${targetWordCount})`);

    // Post-process to ensure platform fit
    let processedScript = generatedScript;
    
    // Remove any accidental stage directions
    processedScript = processedScript.replace(/\[.*?\]/g, '');
    processedScript = processedScript.replace(/\(.*?\)/g, '');
    
    // Ensure proper formatting
    processedScript = processedScript.trim();

    return new Response(
      JSON.stringify({ 
        success: true, 
        script: processedScript,
        wordCount: finalWordCount,
        format: {
          platform,
          type: isShortForm ? 'short' : 'long',
          duration,
          style
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Script generation error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});