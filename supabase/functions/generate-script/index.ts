
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

    // Enhanced system prompt that focuses on actual content creation
    const systemPrompt = `You are an expert YouTube script writer who creates content that actually addresses the specific topic requested. You understand that successful scripts must:

1. ACTUALLY DISCUSS THE TOPIC - Never use generic placeholder language
2. Match the tone, style, and delivery of the reference scripts provided
3. Create topic-specific hooks, examples, and content
4. Use the actual subject matter throughout the script
5. Incorporate psychological triggers naturally within the topic context
6. Generate content that sounds like a real person talking about the real topic

CRITICAL RULES:
- NEVER use generic phrases like "framework" or "system" unless the topic specifically calls for it
- NEVER use placeholder text or generic language that could apply to any topic
- ALWAYS create content that is 100% specific to the requested topic
- Match the writing style, tone, and delivery patterns from the reference scripts
- The script must actually educate or inform about the specific topic requested
- Word count MUST meet or exceed the target requirement`;

    // Analyze reference scripts for style patterns
    const scriptAnalysis = scripts.length > 0 ? `
**REFERENCE SCRIPT ANALYSIS:**
You have ${scripts.length} reference scripts to learn from. Study these carefully:

${scripts.map((script, index) => `
**Reference Script ${index + 1}:**
${script}

---
`).join('')}

**CRITICAL ANALYSIS INSTRUCTIONS:**
1. Extract the exact writing style, tone, and personality from these scripts
2. Note how they introduce topics, build tension, and deliver information
3. Identify their specific language patterns, sentence structures, and transitions
4. See how they use hooks, stories, and examples
5. Notice their pacing and rhythm
6. Observe how they handle the topic-specific content (not generic frameworks)
7. Copy their authentic voice and delivery method
` : '';

    const userPrompt = `Create a YouTube script about "${topic}" that matches the style and delivery of the reference scripts provided.

**TOPIC REQUIREMENTS:**
- The script MUST be specifically about: ${topic}
- ${description ? `Additional context: ${description}` : ''}
- Target audience: ${targetAudience}
- Video length: ${videoLength} minutes
- Call to action: ${callToAction}
- ${format ? `Format style: ${format}` : ''}
- **MINIMUM ${targetWordCount || 1400} words required**

${scriptAnalysis}

**SCRIPT CREATION REQUIREMENTS:**

1. **TOPIC FOCUS**: Every sentence must relate directly to "${topic}". NO generic business/framework language unless the topic specifically calls for it.

2. **STYLE MATCHING**: Write in the exact same style, tone, and personality as the reference scripts. Copy their:
   - Hook patterns and opening style
   - Way of explaining concepts
   - Storytelling approach
   - Language patterns and vocabulary
   - Pacing and rhythm
   - How they build curiosity and engagement

3. **CONTENT SPECIFICITY**: 
   - Use real facts, statistics, or insights about the actual topic
   - Create topic-specific examples and scenarios
   - Address real concerns or questions people have about this topic
   - Provide actual value related to the subject matter

4. **WORD COUNT**: The script MUST contain at least ${targetWordCount || 1400} words. If your initial draft is shorter:
   - Add more topic-specific examples and case studies
   - Include additional insights and perspectives on the topic
   - Expand on key points with more detail and explanation
   - Add relevant stories or anecdotes related to the topic

5. **STRUCTURE**: Follow this format but fill it with topic-specific content:

**VIRAL HOOK (0-3s)**
[Topic-specific attention-grabbing opener that directly relates to "${topic}"]

**PROMISE & SETUP (3-15s)**
[Clear value about what they'll learn regarding "${topic}"]

**MAIN CONTENT (15s-${Math.round(videoLength * 0.8)}m)**
[Deep dive into "${topic}" with specific insights, examples, and information - EXPAND THIS HEAVILY]

**PAYOFF & CTA (${Math.round(videoLength * 0.8)}m-${videoLength}m)**
[Conclusion about "${topic}" and specific call to action]

Remember: This must be a real script about "${topic}" written in the style of your reference scripts, not a generic template with the topic name plugged in. Make it authentic, informative, and genuinely valuable.`;

    console.log('Calling Claude API for topic-specific script generation...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
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
    console.log('Topic-specific script generated successfully');
    
    const generatedScript = data.content[0].text;
    
    // Verify word count and topic relevance
    const wordCount = generatedScript.trim().split(/\s+/).length;
    console.log(`Generated script word count: ${wordCount}, Target: ${targetWordCount || 1400}`);

    // Basic check to ensure the script actually discusses the topic
    const topicMentions = (generatedScript.toLowerCase().match(new RegExp(topic.toLowerCase().split(' ').join('|'), 'g')) || []).length;
    console.log(`Topic mentions in script: ${topicMentions}`);

    return new Response(
      JSON.stringify({ 
        script: generatedScript,
        success: true,
        wordCount: wordCount,
        topicRelevance: topicMentions,
        message: "Enhanced script generation with topic-specific content and style matching"
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
