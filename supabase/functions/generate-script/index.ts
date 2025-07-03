
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

  console.log('Calling Claude API for script generation...');
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // Extended timeout for longer scripts
  
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
        max_tokens: 8000,
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

    const systemPrompt = `You are an expert YouTube script writer specializing in viral content creation.

🚨 CRITICAL WORD COUNT REQUIREMENT 🚨
- MINIMUM ${targetWordCount} WORDS - THIS IS MANDATORY
- COUNT EVERY SINGLE WORD - NO EXCEPTIONS
- IF UNDER ${targetWordCount} WORDS, THE SCRIPT IS INCOMPLETE
- ADD MORE CONTENT UNTIL YOU REACH EXACTLY ${targetWordCount} WORDS OR MORE

CONTENT REQUIREMENTS:
1. Hook (0-15s): Strong attention-grabbing opening
2. Problem Setup (15s-45s): Establish stakes and pain points
3. Solution Framework (45s-4m): Detailed step-by-step content
4. Proof & Examples (Throughout): Multiple case studies and stories
5. Advanced Insights (4m-5m): Deep mechanisms and psychology
6. Call to Action (Final 30s): Strong conversion-focused ending

TO REACH ${targetWordCount} WORDS, INCLUDE:
- Detailed explanations for every point (minimum 100 words per major point)
- Multiple specific examples with full context
- Step-by-step breakdowns with sub-steps
- Psychology explanations for why each tactic works
- Common mistakes and how to avoid them
- Success stories with specific details
- Advanced strategies and insider tips
- Objection handling sections

WORD COUNT VALIDATION: Before finishing, count your words. If under ${targetWordCount}, immediately add more content sections.`;

    const userPrompt = `🚨 URGENT: Generate a ${targetWordCount}+ word viral YouTube script 🚨

**MANDATORY SPECIFICATIONS:**
• Topic: ${topic}
• Description: ${description || 'Not specified'}
• Target Audience: ${targetAudience || 'General YouTube audience'}
• Video Length: ${videoLength || 'Not specified'} minutes
• Format Style: ${format || 'Copy Reference Script Format'}
• Call to Action: ${callToAction || 'Subscribe and like'}

🎯 **CRITICAL SUCCESS METRICS:**
✅ MINIMUM ${targetWordCount} WORDS (COUNT EVERY WORD)
✅ Viral psychological triggers throughout
✅ High retention structure with hooks every 30 seconds
✅ Detailed examples and case studies
✅ Step-by-step breakdowns for each major point

${scripts.length > 0 ? `📚 **REFERENCE SCRIPTS FOR STYLE ANALYSIS:**
${scripts.map((script, index) => `
=== REFERENCE SCRIPT ${index + 1} ===
${script.substring(0, 800)}...
===========================
`).join('\n')}

📋 **ANALYSIS INSTRUCTIONS:**
1. Study the hook patterns from reference scripts
2. Mirror the tone and energy level
3. Adapt the structure but create 100% original content
4. Include similar psychological triggers and engagement tactics` : ''}

🔥 **CONTENT EXPANSION REQUIREMENTS:**
Since you need ${targetWordCount}+ words, include ALL of these sections:

1. **VIRAL HOOK (0-15s)** - 100+ words
   - Pattern interrupt + curiosity gap
   - Specific numbers or shocking claims
   - Promise of transformation

2. **PROBLEM AGITATION (15-45s)** - 200+ words  
   - Emotional pain points
   - Common frustrations
   - Why current solutions fail

3. **SOLUTION FRAMEWORK (45s-4m)** - 800+ words
   - Step-by-step methodology  
   - Detailed explanations for each step
   - Multiple specific examples per step
   - Psychology behind why it works

4. **PROOF & CASE STUDIES (Throughout)** - 300+ words
   - Success stories with specific details
   - Before/after scenarios
   - Testimonial-style narratives

5. **ADVANCED INSIGHTS (4-5m)** - 200+ words
   - Hidden mechanisms
   - Common mistakes to avoid
   - Advanced optimization tips

6. **STRONG CTA (Final 30s)** - 100+ words
   - Urgency and scarcity
   - Clear next steps
   - Benefit reinforcement

WORD COUNT VERIFICATION: After writing, count your words. If under ${targetWordCount}, immediately expand each section with more examples, details, and insights.

CREATE THE COMPLETE ${targetWordCount}+ WORD SCRIPT NOW:`;

    console.log(`Generating script with minimum ${targetWordCount} words...`);

    let generatedScript = await callClaudeAPI(userPrompt, systemPrompt);
    let attempts = 0;
    const maxAttempts = 3;

    // Robust word count validation with multiple expansion attempts
    while (attempts < maxAttempts) {
      const wordCount = generatedScript.trim().split(/\s+/).length;
      console.log(`Attempt ${attempts + 1}: Script generated with ${wordCount} words (target: ${targetWordCount})`);

      if (wordCount >= targetWordCount) {
        console.log(`✅ Word count requirement met: ${wordCount} words`);
        break;
      }

      attempts++;
      console.log(`⚠️ Script too short (${wordCount} words), expanding... (Attempt ${attempts}/${maxAttempts})`);
      
      const wordsNeeded = targetWordCount - wordCount;
      const expansionPrompt = `CRITICAL: The current script has only ${wordCount} words but MUST have at least ${targetWordCount} words. You need to add approximately ${wordsNeeded} more words.

CURRENT SCRIPT:
${generatedScript}

EXPANSION REQUIREMENTS:
- Add EXACTLY ${wordsNeeded} or more words to reach the ${targetWordCount} word minimum
- Include detailed step-by-step explanations
- Add specific examples, case studies, and success stories  
- Include psychological explanations for why tactics work
- Add more storytelling elements and personal anecdotes
- Include objection handling and common mistakes sections
- Add advanced tips and insider secrets
- Provide additional context and background information

STRUCTURE TO ADD:
1. More detailed breakdown of each main point
2. Additional examples for each concept
3. "Common Mistakes" section
4. "Advanced Strategies" section  
5. More social proof and testimonials
6. Deeper psychological explanations

Return the COMPLETE expanded script that is AT LEAST ${targetWordCount} words. Count carefully and ensure you meet this requirement.`;

      generatedScript = await callClaudeAPI(expansionPrompt, systemPrompt);
    }

    const finalWordCount = generatedScript.trim().split(/\s+/).length;
    console.log(`Final script completed with ${finalWordCount} words after ${attempts + 1} attempts`);

    console.log('Script generation completed successfully');

    return new Response(
      JSON.stringify({ 
        script: generatedScript,
        success: true,
        wordCount: generatedScript.trim().split(/\s+/).length,
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
