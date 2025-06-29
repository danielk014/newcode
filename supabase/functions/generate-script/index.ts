
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

    // Completely new approach focused on authentic style replication
    const systemPrompt = `You are an expert YouTube script ghostwriter who specializes in studying successful creators and writing scripts that are INDISTINGUISHABLE from their authentic work.

Your mission: Analyze the reference scripts with forensic precision and create a new script that sounds like the EXACT SAME PERSON wrote it.

CRITICAL RULES:
1. NO GENERIC TEMPLATES - Every word must reflect the specific author's voice
2. NO PLACEHOLDER FRAMEWORKS - Use their actual writing patterns and tactics
3. TOPIC IMMERSION - Write 100% about the actual topic, not about "frameworks"
4. AUTHENTIC VOICE - Match their personality, energy, and communication style exactly
5. REAL PSYCHOLOGY - Use their specific psychological approaches, not textbook tactics

ANALYSIS PROCESS:
1. Study their opening patterns - How do they actually start content?
2. Identify their transition phrases and connecting words
3. Extract their specific vocabulary and word choices
4. Understand their storytelling approach and examples style
5. Map their psychological triggers and how they deploy them
6. Analyze their pacing and rhythm patterns
7. Study their closing and CTA style`;

    const userPrompt = `REFERENCE SCRIPTS FOR DEEP ANALYSIS:

${scripts.map((script, index) => `
=== REFERENCE SCRIPT ${index + 1} ===
${script}

`).join('')}

Now write a script about "${topic}" that captures their EXACT writing DNA.

**REQUIREMENTS:**
- Topic: ${topic}
- Target: ${targetAudience}
- Length: ${videoLength} minutes (${targetWordCount} words)
- CTA: ${callToAction}
${description ? `- Context: ${description}` : ''}
${format ? `- Style: ${format}` : ''}

**DEEP ANALYSIS QUESTIONS TO ANSWER FIRST:**

1. VOICE FINGERPRINT:
   - What's their personality? (energy level, tone, attitude)
   - How do they talk to their audience? (friend, teacher, authority, rebel)
   - What makes their voice unique vs generic YouTubers?

2. LANGUAGE DNA:
   - What specific words/phrases do they repeat?
   - How long are their sentences typically?
   - What's their question-to-statement ratio?
   - How do they use punctuation and emphasis?

3. STRUCTURAL PATTERNS:
   - How do they actually open content? (not generic hooks)
   - How do they transition between ideas?
   - How do they present information and examples?
   - How do they close and create action?

4. PSYCHOLOGICAL APPROACH:
   - What specific emotions do they target?
   - How do they build credibility in their unique way?
   - What's their approach to creating urgency?
   - How do they handle objections and skepticism?

5. TOPIC INTEGRATION:
   - How would they naturally approach "${topic}"?
   - What examples and stories would they use?
   - What angle would they take that's authentic to them?
   - How would they make "${topic}" relevant to their audience?

**SCRIPT CREATION PROCESS:**

Step 1: Write a brief analysis of their unique style based on the questions above.

Step 2: Create the script using ONLY their authentic patterns:
- Use their actual opening style (not "stop scrolling")
- Follow their natural information flow
- Include topic-specific insights and examples
- Match their energy and personality exactly
- Use their specific psychological approaches
- End with their authentic CTA style

**QUALITY STANDARDS:**
✓ Sounds like the same person who wrote the references
✓ 100% focused on "${topic}" with real insights
✓ No generic business templates or frameworks
✓ Uses their specific language patterns and vocabulary
✓ Matches their psychological approach and energy
✓ Includes authentic examples and stories about the topic
✓ Reaches ${targetWordCount} words through valuable content, not filler

**CRITICAL CHECK:**
Would someone who knows this creator's work believe they wrote this script about "${topic}"? If not, rewrite until authentic.

Begin with your style analysis, then write the script.`;

    console.log('Calling Claude API for authentic style replication...');

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
        temperature: 0.9,
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
    console.log('Authentic style-matched script generated successfully');
    
    const generatedScript = data.content[0].text;
    
    // Quality checks
    const wordCount = generatedScript.trim().split(/\s+/).length;
    console.log(`Generated script word count: ${wordCount}, Target: ${targetWordCount}`);

    // Check for topic relevance (avoid generic content)
    const topicWords = topic.toLowerCase().split(' ').filter(word => word.length > 2);
    const scriptLower = generatedScript.toLowerCase();
    const topicMentions = topicWords.reduce((count, word) => {
      return count + (scriptLower.split(word).length - 1);
    }, 0);
    
    // Check for generic template phrases (red flags)
    const genericPhrases = [
      'simple framework',
      'one crucial element', 
      'step by step',
      'here\'s the thing nobody talks about',
      '97% of people fail',
      'from zero to hero in just 30 days'
    ];
    
    const genericCount = genericPhrases.reduce((count, phrase) => {
      return count + (scriptLower.split(phrase.toLowerCase()).length - 1);
    }, 0);

    console.log(`Topic relevance: ${topicMentions} mentions, Generic phrases detected: ${genericCount}`);

    return new Response(
      JSON.stringify({ 
        script: generatedScript,
        success: true,
        wordCount: wordCount,
        topicRelevance: topicMentions,
        genericContent: genericCount,
        message: "Authentic style replication with deep voice analysis"
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
