
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Format-specific structures and approaches
const formatStructures = {
  "Competition Format": {
    structure: "Challenge Setup → Contestants/Options → Stakes → Process → Tension → Winner → Lessons",
    approach: "Create drama through competition, show clear winners/losers, build suspense",
    lengthMultiplier: 1.2,
    sections: ["Hook: Challenge announcement", "Setup: Who/what is competing", "Stakes: What's at risk", "Process: How it unfolds", "Climax: The competition", "Resolution: Winner and why", "Takeaway: What this means for viewers"]
  },
  "Transformation Journey": {
    structure: "Before State → Catalyst → Struggle → Breakthrough → After State → Replication",
    approach: "Show dramatic before/after, focus on the journey and struggles",
    lengthMultiplier: 1.1,
    sections: ["Hook: The transformation preview", "Before: Starting point", "Catalyst: What changed", "Journey: The process and struggles", "Breakthrough: The turning point", "After: The new reality", "How-to: Steps for viewers"]
  },
  "Teaching Format": {
    structure: "Problem → Solution Preview → Method → Examples → Advanced Tips → Practice",
    approach: "Educational but engaging, step-by-step breakdown with examples",
    lengthMultiplier: 1.3,
    sections: ["Hook: The problem everyone faces", "Preview: What you'll learn", "Method: Step-by-step process", "Examples: Real applications", "Advanced: Pro tips", "Practice: How to implement"]
  },
  "Trend Jack Format": {
    structure: "Trend Hook → Context → Your Angle → Evidence → Implications → Action",
    approach: "Fast-paced, timely, controversial takes on current events",
    lengthMultiplier: 0.9,
    sections: ["Hook: Reference the trend", "Context: What everyone knows", "Angle: Your unique take", "Evidence: Why you're right", "Implications: What this means", "Action: What viewers should do"]
  },
  "Success Story Format": {
    structure: "Result First → Background → Challenge → Strategy → Implementation → Results → Blueprint",
    approach: "Lead with results, show the journey, provide replicable framework",
    lengthMultiplier: 1.1,
    sections: ["Hook: The impressive result", "Background: Who they were", "Challenge: What they faced", "Strategy: Their approach", "Implementation: How they did it", "Results: What happened", "Blueprint: How you can copy it"]
  },
  "Documentary Format": {
    structure: "Mystery/Question → Investigation → Evidence → Interviews → Revelations → Truth",
    approach: "Deep investigation, multiple perspectives, uncovering hidden truth",
    lengthMultiplier: 1.4,
    sections: ["Hook: The mystery or question", "Investigation: What we found", "Evidence: The facts", "Perspectives: Different viewpoints", "Discovery: What we uncovered", "Truth: The real story", "Impact: What this means"]
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, description, targetAudience, videoLength, scripts, callToAction, format, targetWordCount } = await req.json();
    
    const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');
    if (!claudeApiKey) {
      throw new Error('Claude API key not configured');
    }

    // Get format-specific structure
    const formatInfo = formatStructures[format] || formatStructures["Teaching Format"];
    const adjustedWordCount = Math.round(targetWordCount * formatInfo.lengthMultiplier);

    const systemPrompt = `You are a master YouTube script analyst and ghostwriter. Your expertise is in studying successful creators' scripts and replicating their EXACT voice, style, and psychological tactics while applying specific viral formats.

CRITICAL MISSION: Create a script that is INDISTINGUISHABLE from the reference author's work while following the specific viral format structure.

WORD COUNT REQUIREMENT: The script MUST be exactly ${adjustedWordCount} words (±50 words). This is non-negotiable.

FORMAT: ${format}
- Structure: ${formatInfo.structure}
- Approach: ${formatInfo.approach}
- Required Sections: ${formatInfo.sections.join(', ')}

ANALYSIS PROCESS:
1. Voice DNA Analysis: Extract their personality, energy, tone, and communication style
2. Language Patterns: Identify their specific vocabulary, sentence structure, and rhythm
3. Psychological Tactics: Map their persuasion techniques and emotional triggers
4. Storytelling Style: Understand how they structure narratives and examples
5. Format Adaptation: Apply their style to the specific viral format chosen`;

    const userPrompt = `REFERENCE SCRIPTS FOR DEEP ANALYSIS:

${scripts.map((script, index) => `
=== REFERENCE SCRIPT ${index + 1} ===
${script}

`).join('')}

**TASK: Create a ${format} script about "${topic}"**

**SPECIFICATIONS:**
- Topic: ${topic}
- Target Audience: ${targetAudience}
- Video Length: ${videoLength} minutes
- Target Word Count: ${adjustedWordCount} words (MANDATORY)
- Call to Action: ${callToAction}
- Format Structure: ${formatInfo.structure}
${description ? `- Additional Context: ${description}` : ''}

**STEP 1: VOICE DNA EXTRACTION**
Analyze the reference scripts and identify:

1. **Personality Profile:**
   - Energy level (high/medium/low)
   - Tone (casual/professional/edgy/friendly)
   - Attitude (confident/humble/rebellious/educational)
   - Relationship with audience (friend/teacher/authority/peer)

2. **Language Fingerprint:**
   - Signature phrases they use repeatedly
   - Average sentence length and complexity
   - Question vs statement ratio
   - Use of slang, technical terms, or specific vocabulary
   - Punctuation and emphasis patterns

3. **Psychological Toolkit:**
   - Primary emotions they target (fear, excitement, curiosity, urgency)
   - How they build credibility and authority
   - Their approach to creating urgency and scarcity
   - How they handle objections and skepticism
   - Their storytelling and example style

4. **Structural Patterns:**
   - How they typically open content
   - Their transition phrases and connecting words
   - How they present information and build arguments
   - Their closing and CTA style

**STEP 2: FORMAT-SPECIFIC ADAPTATION**
Apply their voice to the ${format} structure:

${formatInfo.sections.map((section, index) => `
**Section ${index + 1}: ${section}**
- Word target: ~${Math.round(adjustedWordCount / formatInfo.sections.length)} words
- Apply their voice: [Use their specific language patterns]
- Format requirement: [Follow ${format} structure]
- Topic integration: [Make it 100% about "${topic}"]`).join('')}

**STEP 3: SCRIPT CREATION**
Write the complete script following these requirements:

1. **WORD COUNT**: Must reach ${adjustedWordCount} words through valuable content about "${topic}"
2. **VOICE MATCHING**: Every sentence must sound like the reference author wrote it
3. **FORMAT ADHERENCE**: Must follow ${format} structure exactly
4. **TOPIC FOCUS**: 100% about "${topic}" with specific insights, examples, and actionable content
5. **NO GENERIC CONTENT**: No template language, placeholder frameworks, or generic business advice

**QUALITY CHECKLIST:**
✓ Sounds exactly like the reference author's voice
✓ Follows ${format} structure precisely
✓ Reaches ${adjustedWordCount} words with valuable content
✓ 100% focused on "${topic}" with specific insights
✓ Includes authentic examples and stories about the topic
✓ Uses their specific psychological tactics and language patterns
✓ Ends with their authentic CTA style incorporating "${callToAction}"

**FINAL CHECK:**
Would someone who knows this creator's work believe they wrote this ${format} script about "${topic}"? If not, rewrite until authentic.

Begin with a brief voice analysis, then write the complete ${adjustedWordCount}-word script.`;

    console.log(`Generating ${format} script with ${adjustedWordCount} word target...`);

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
    const generatedScript = data.content[0].text;
    
    // Verify word count
    const actualWordCount = generatedScript.trim().split(/\s+/).length;
    const wordCountDifference = Math.abs(actualWordCount - adjustedWordCount);
    const wordCountAccuracy = ((adjustedWordCount - wordCountDifference) / adjustedWordCount) * 100;

    console.log(`${format} script generated:`);
    console.log(`Target: ${adjustedWordCount} words, Actual: ${actualWordCount} words`);
    console.log(`Accuracy: ${wordCountAccuracy.toFixed(1)}%`);

    // Check for format-specific elements
    const formatElements = formatInfo.sections.length;
    const scriptSections = generatedScript.split('\n').filter(line => line.includes('**')).length;
    const structureScore = Math.min((scriptSections / formatElements), 1) * 100;

    // Check topic relevance
    const topicWords = topic.toLowerCase().split(' ').filter(word => word.length > 2);
    const scriptLower = generatedScript.toLowerCase();
    const topicMentions = topicWords.reduce((count, word) => {
      return count + (scriptLower.split(word).length - 1);
    }, 0);

    return new Response(
      JSON.stringify({ 
        script: generatedScript,
        success: true,
        metrics: {
          wordCount: actualWordCount,
          targetWordCount: adjustedWordCount,
          wordCountAccuracy: wordCountAccuracy,
          formatStructureScore: structureScore,
          topicRelevance: topicMentions,
          formatUsed: format
        },
        message: `${format} script generated with ${actualWordCount} words (${wordCountAccuracy.toFixed(1)}% accuracy)`
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
