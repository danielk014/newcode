
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
    const { topic, description, targetAudience, videoLength, scripts, callToAction, format, targetWordCount } = await req.json();
    
    const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');
    if (!claudeApiKey) {
      throw new Error('Claude API key not configured');
    }

    // Enhanced system prompt based on DanielKCI's proven tactics
    const systemPrompt = `You are an expert YouTube script writer who uses proven viral content strategies. You understand that successful content follows these core principles:

1. GIVE PEOPLE WHAT THEY WANT - Don't force creativity, adapt proven formats
2. PROVEN FORMAT + UNIQUE TWIST = VIRAL CONTENT
3. Hook viewers in first 3 seconds, keep them curious throughout
4. Use psychological triggers that have worked for centuries
5. Structure for algorithm optimization and maximum retention
6. ALWAYS meet or exceed the target word count - this is critical for proper video length

Key Viral Strategies:
- Start with climax/result first (grab immediate attention)
- Create information gaps that viewers MUST fill
- Use micro-hooks every 15-30 seconds
- Build greed/desire triggers (financial freedom, status, improvement)
- Integrate soft-sell monetization naturally
- Optimize for watch time and engagement
- Use pattern interrupts to reset attention
- End with strong, specific call-to-action
- MINIMUM word count requirement must be met or exceeded

Format Types:
- Competition Format (proven since Roman times)
- Transformation Journey (before/after)
- Teaching Format (authority building)
- Success Story Format (social proof)
- Trend Jack Format (rapid response)

Write scripts that collaborate with the algorithm, not fight it.`;

    // Analyze the provided scripts to extract patterns
    const scriptAnalysis = scripts.length > 0 ? `

**SCRIPT ANALYSIS:**
You have been provided with ${scripts.length} reference scripts to analyze and learn from:

${scripts.map((script, index) => `
**Reference Script ${index + 1}:**
${script}

---
`).join('')}

**CRITICAL INSTRUCTIONS:**
1. Analyze the writing style, hooks, transitions, and tactics used in these reference scripts
2. Identify the psychological triggers and persuasion techniques employed
3. Note the structure and pacing patterns
4. Adapt these proven elements to the new topic while maintaining what makes them effective
5. The generated script MUST be at least ${targetWordCount || 1400} words to meet the target video length
6. If the script falls short of the word count, expand the content with additional value, examples, stories, or detailed explanations
` : '';

    const userPrompt = `Create a viral YouTube script using proven psychological tactics and format structures.

**Content Details:**
Topic: ${topic}
${description ? `Description/Context: ${description}` : ''}
Target Audience: ${targetAudience}
Video Length: ${videoLength} minutes
Call to Action: ${callToAction}
${format ? `Preferred Format: ${format}` : ''}
**MINIMUM Word Count Required: ${targetWordCount || 1400} words**

${scriptAnalysis}

**Script Requirements:**
1. HOOK (0-3 seconds): Use information gap, climax first, or bold statement
2. PROMISE (3-15 seconds): Clear value proposition - "By the end you'll..."
3. PAYOFF (Main Content): 
   - Micro-hooks every 15-30 seconds
   - Pattern interrupts for attention reset
   - Build desire/greed triggers
   - Use proven format structure
   - Soft-sell integration if monetization opportunity exists
4. CALL TO ACTION (Final 10 seconds): Specific, actionable direction

**CRITICAL WORD COUNT REQUIREMENT:**
- The script MUST contain at least ${targetWordCount || 1400} words
- If your initial draft is shorter, expand it with:
  - Additional examples and case studies
  - More detailed explanations
  - Personal stories or student success stories
  - Deeper dives into concepts
  - Additional psychological triggers
  - More comprehensive value delivery

**Psychological Tactics to Incorporate:**
- Information gaps and curiosity loops
- Success stories and social proof
- Dream selling and future pacing
- Authority building and credibility
- Engagement optimization for algorithm
- Watch time maximization techniques

**Format Structure:**
**VIRAL HOOK (0-3s)**
[Attention-grabbing opener - climax first, information gap, or bold statement]

**PROMISE & SETUP (3-15s)**
[Clear value proposition and expectations]

**MAIN CONTENT (15s-${Math.round(videoLength * 0.8)}m)**
[Structured content with micro-hooks, pattern interrupts, and value delivery - EXPAND THIS SECTION TO MEET WORD COUNT]

**PAYOFF & CTA (${Math.round(videoLength * 0.8)}m-${videoLength}m)**
[Deliver on promise, recap value, strong call to action]

Create a script that gives people what they want while building your authority and driving specific action. Remember: The script must be comprehensive and detailed to meet the minimum ${targetWordCount || 1400} word requirement.`;

    console.log('Calling Claude API with enhanced viral tactics and script analysis...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 6000, // Increased for longer scripts
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
    console.log('Enhanced viral script generated successfully');
    
    const generatedScript = data.content[0].text;
    
    // Verify word count and expand if necessary
    const wordCount = generatedScript.trim().split(/\s+/).length;
    console.log(`Generated script word count: ${wordCount}, Target: ${targetWordCount || 1400}`);

    return new Response(
      JSON.stringify({ 
        script: generatedScript,
        success: true,
        wordCount: wordCount,
        tactics_used: "Enhanced with DanielKCI proven viral strategies and script analysis"
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
