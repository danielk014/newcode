
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

    // Enhanced system prompt focused on authentic style replication
    const systemPrompt = `You are a master scriptwriter who specializes in analyzing and replicating the exact writing style, voice, and psychological tactics of successful content creators.

Your job is to:
1. DEEPLY ANALYZE the reference scripts to understand their unique writing DNA
2. EXTRACT their specific voice, tone, pacing, and delivery patterns
3. IDENTIFY their psychological tactics and how they implement them
4. CREATE a new script that sounds like it was written by the SAME PERSON
5. Make the content 100% about the actual topic - never use generic frameworks

CRITICAL ANALYSIS REQUIREMENTS:
- Study how they start sentences and paragraphs
- Notice their rhythm and pacing patterns
- Identify their specific vocabulary and phrase choices
- Understand their storytelling approach and examples
- Extract their unique psychological hooks and triggers
- Analyze how they build tension and release it
- Notice their transition phrases and connecting words
- Study their call-to-action style and urgency creation

SCRIPT CREATION RULES:
- The script must sound like the SAME AUTHOR wrote it
- Every word must relate to the specific topic requested
- Use their exact tone, pacing, and delivery style
- Implement their psychological tactics in the same way they do
- Match their energy level and personality
- Use similar sentence structures and paragraph lengths
- Include topic-specific facts, insights, and examples
- NO GENERIC BUSINESS FRAMEWORKS unless that's their style`;

    const userPrompt = `I need you to write a script about "${topic}" that perfectly matches the writing style of these reference scripts.

**TOPIC:** ${topic}
${description ? `**CONTEXT:** ${description}` : ''}
**TARGET AUDIENCE:** ${targetAudience}
**VIDEO LENGTH:** ${videoLength} minutes
**CALL TO ACTION:** ${callToAction}
${format ? `**FORMAT STYLE:** ${format}` : ''}
**MINIMUM WORD COUNT:** ${targetWordCount || 1400} words

**REFERENCE SCRIPTS TO ANALYZE AND REPLICATE:**

${scripts.map((script, index) => `
==========================================
REFERENCE SCRIPT ${index + 1}:
==========================================
${script}

`).join('')}

**ANALYSIS INSTRUCTIONS:**

First, analyze these scripts deeply:

1. **VOICE & TONE ANALYSIS:**
   - What's their personality? (casual/formal, energetic/calm, friendly/authoritative)
   - How do they speak to their audience? (like a friend, teacher, expert, rebel)
   - What's their energy level and pacing?

2. **STRUCTURAL PATTERNS:**
   - How do they open their content?
   - How do they transition between ideas?
   - How do they build and release tension?
   - How do they close and create urgency?

3. **LANGUAGE DNA:**
   - What specific words and phrases do they repeat?
   - What's their sentence length preference?
   - How do they use questions, statements, and exclamations?
   - What metaphors or analogies do they prefer?

4. **PSYCHOLOGICAL TACTICS:**
   - How do they create curiosity and intrigue?
   - How do they build credibility and authority?
   - How do they create emotional connection?
   - How do they handle objections and skepticism?
   - How do they create urgency and scarcity?

5. **CONTENT APPROACH:**
   - How do they present information and insights?
   - How do they use stories and examples?
   - How do they explain complex concepts?
   - How do they make their content memorable?

**SCRIPT CREATION REQUIREMENTS:**

Now create a script about "${topic}" that:

✅ SOUNDS IDENTICAL to the reference scripts in voice and tone
✅ USES THE SAME structural patterns and pacing
✅ IMPLEMENTS their psychological tactics in their specific style
✅ CONTAINS 100% topic-specific content about "${topic}"
✅ INCLUDES real insights, facts, or perspectives about the topic
✅ REACHES the ${targetWordCount || 1400} word minimum
✅ FEELS like the same person wrote it

**STRUCTURE:** Use their natural flow, but ensure these elements:
- **HOOK:** Match their opening style but make it about "${topic}"
- **BODY:** Follow their content development pattern with topic-specific insights
- **CLOSE:** Use their closing style with the specified call-to-action

**QUALITY CHECK:**
- Does this sound like the same person who wrote the reference scripts?
- Is every sentence about "${topic}" specifically?
- Are the psychological tactics implemented in their unique style?
- Would someone familiar with the reference scripts believe this is authentic?

Write the script now, making it indistinguishable from their authentic work while being completely focused on "${topic}".`;

    console.log('Calling Claude API with enhanced style analysis and replication...');

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
        temperature: 0.8,
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
    console.log('Enhanced style-matching script generated successfully');
    
    const generatedScript = data.content[0].text;
    
    // Verify word count and topic relevance
    const wordCount = generatedScript.trim().split(/\s+/).length;
    console.log(`Generated script word count: ${wordCount}, Target: ${targetWordCount || 1400}`);

    // Enhanced topic relevance check
    const topicWords = topic.toLowerCase().split(' ').filter(word => word.length > 2);
    const scriptLower = generatedScript.toLowerCase();
    const topicMentions = topicWords.reduce((count, word) => {
      return count + (scriptLower.split(word).length - 1);
    }, 0);
    
    console.log(`Topic relevance score: ${topicMentions} mentions across ${topicWords.length} key words`);

    return new Response(
      JSON.stringify({ 
        script: generatedScript,
        success: true,
        wordCount: wordCount,
        topicRelevance: topicMentions,
        message: "Enhanced script generation with deep style analysis and authentic replication"
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
