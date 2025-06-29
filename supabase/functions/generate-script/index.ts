
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Format-specific structures with distinct approaches
const formatStructures = {
  "Competition Format": {
    structure: "Challenge Setup → Contestants/Options → Stakes → Process → Tension → Winner → Lessons",
    approach: "Competition-based tension, clear winner/loser dynamic, builds suspense through process",
    lengthMultiplier: 1.2,
    uniqueElements: ["challenger introduction", "stakes establishment", "process documentation", "tension building", "winner reveal", "lesson extraction"],
    avoidWords: ["framework", "system", "blueprint", "secret", "experts", "step-by-step"]
  },
  "Transformation Journey": {
    structure: "Before State → Catalyst → Struggle → Breakthrough → After State → Replication",
    approach: "Personal story-driven, emotional journey, concrete before/after evidence",
    lengthMultiplier: 1.1,
    uniqueElements: ["specific before situation", "catalyst moment", "struggle documentation", "breakthrough point", "after evidence", "replication guide"],
    avoidWords: ["framework", "system", "blueprint", "secret", "experts", "step-by-step"]
  },
  "Teaching Format": {
    structure: "Problem → Solution Preview → Method → Examples → Advanced Tips → Practice",
    approach: "Educational authority, practical instruction, multiple examples and applications",
    lengthMultiplier: 1.3,
    uniqueElements: ["problem identification", "solution preview", "method explanation", "real examples", "advanced applications", "practice opportunities"],
    avoidWords: ["secret", "nobody talks about", "hidden", "blueprint", "framework"]
  },
  "Trend Jack Format": {
    structure: "Trend Hook → Context → Your Angle → Evidence → Implications → Action",
    approach: "Timely, reactive, controversial takes, rapid response style",
    lengthMultiplier: 0.9,
    uniqueElements: ["trend reference", "context setting", "unique angle", "supporting evidence", "implications", "immediate action"],
    avoidWords: ["framework", "system", "blueprint", "step-by-step", "secret"]
  },
  "Success Story Format": {
    structure: "Result First → Background → Challenge → Strategy → Implementation → Results → Blueprint",
    approach: "Results-focused, credibility-building, proof-driven narrative",
    lengthMultiplier: 1.1,
    uniqueElements: ["concrete results", "background story", "specific challenge", "strategy used", "implementation details", "measurable outcomes", "replication method"],
    avoidWords: ["secret", "nobody talks about", "hidden", "framework"]
  },
  "Documentary Format": {
    structure: "Mystery/Question → Investigation → Evidence → Interviews → Revelations → Truth",
    approach: "Investigative journalism style, multiple perspectives, evidence-based conclusions",
    lengthMultiplier: 1.4,
    uniqueElements: ["central mystery", "investigation process", "evidence gathering", "expert perspectives", "revelations", "truth conclusion"],
    avoidWords: ["framework", "system", "blueprint", "secret", "step-by-step"]
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

    const systemPrompt = `You are a master script analyst and creator. Your mission is to create scripts that are COMPLETELY AUTHENTIC to the reference author's voice while following specific viral format structures.

CRITICAL REQUIREMENTS:
1. WORD COUNT: Must be exactly ${adjustedWordCount} words (±50 words maximum)
2. FORMAT ADHERENCE: Must follow ${format} structure precisely
3. VOICE AUTHENTICITY: Must sound exactly like the reference author wrote it
4. TOPIC FOCUS: 100% about "${topic}" with specific, actionable content
5. NO GENERIC CONTENT: Absolutely no template language or generic phrases

BANNED PHRASES (NEVER USE):
${formatInfo.avoidWords.map(word => `"${word}"`).join(', ')}

FORMAT: ${format}
- Structure: ${formatInfo.structure}
- Approach: ${formatInfo.approach}
- Required Elements: ${formatInfo.uniqueElements.join(', ')}`;

    const userPrompt = `REFERENCE SCRIPTS FOR VOICE ANALYSIS:

${scripts.map((script, index) => `
=== REFERENCE SCRIPT ${index + 1} ===
${script}
`).join('')}

TASK: Create a ${format} script about "${topic}"

SPECIFICATIONS:
- Topic: ${topic}
- Target Audience: ${targetAudience}
- Video Length: ${videoLength} minutes
- MANDATORY Word Count: ${adjustedWordCount} words
- Call to Action: ${callToAction}
- Format: ${format}
${description ? `- Context: ${description}` : ''}

ANALYSIS PROCESS:

1. **VOICE DNA EXTRACTION**
From the reference scripts, identify:
- Exact phrases they use repeatedly
- Their sentence structure and rhythm
- How they address the audience
- Their specific vocabulary and slang
- Their emotional tone and energy level
- How they transition between ideas
- Their storytelling style and examples

2. **FORMAT ADAPTATION**
Apply their authentic voice to ${format} structure:

${formatInfo.uniqueElements.map((element, index) => `
**Element ${index + 1}: ${element}**
- Word allocation: ~${Math.round(adjustedWordCount / formatInfo.uniqueElements.length)} words
- Voice requirement: Use their exact language patterns and phrases
- Topic integration: Make it 100% about "${topic}" with specific details
- Format requirement: Follow ${format} approach - ${formatInfo.approach}`).join('')}

3. **CONTENT CREATION RULES**
- Write EXACTLY ${adjustedWordCount} words through valuable content about "${topic}"
- Use their actual phrases, not generic business speak
- Include specific examples, numbers, and actionable details about "${topic}"
- Follow ${format} structure without deviation
- End with authentic CTA incorporating "${callToAction}"
- NO template language - every sentence must sound like them

4. **AUTHENTICITY CHECK**
Before finalizing, verify:
✓ Uses their specific vocabulary and phrases
✓ Matches their energy and tone
✓ Follows ${format} structure exactly
✓ Reaches ${adjustedWordCount} words with valuable content
✓ 100% focused on "${topic}" with specific insights
✓ Avoids all banned generic phrases
✓ Someone familiar with their work would believe they wrote this

FINAL OUTPUT: Write the complete ${adjustedWordCount}-word script that authentically captures their voice while following the ${format} structure and being 100% about "${topic}".

Begin with the script immediately - no preamble or analysis summary.`;

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
    const generatedScript = data.content[0].text;
    
    // Verify word count
    const actualWordCount = generatedScript.trim().split(/\s+/).length;
    const wordCountDifference = Math.abs(actualWordCount - adjustedWordCount);
    const wordCountAccuracy = ((adjustedWordCount - wordCountDifference) / adjustedWordCount) * 100;

    console.log(`${format} script generated:`);
    console.log(`Target: ${adjustedWordCount} words, Actual: ${actualWordCount} words`);
    console.log(`Accuracy: ${wordCountAccuracy.toFixed(1)}%`);

    // Check for banned phrases
    const bannedPhraseCount = formatInfo.avoidWords.reduce((count, phrase) => {
      return count + (generatedScript.toLowerCase().split(phrase.toLowerCase()).length - 1);
    }, 0);

    // Check topic relevance
    const topicWords = topic.toLowerCase().split(' ').filter(word => word.length > 2);
    const scriptLower = generatedScript.toLowerCase();
    const topicMentions = topicWords.reduce((count, word) => {
      return count + (scriptLower.split(word).length - 1);
    }, 0);

    // Check format elements
    const formatElementsFound = formatInfo.uniqueElements.filter(element => {
      const keywords = element.toLowerCase().split(' ');
      return keywords.some(keyword => scriptLower.includes(keyword));
    }).length;

    const formatAdherence = (formatElementsFound / formatInfo.uniqueElements.length) * 100;

    return new Response(
      JSON.stringify({ 
        script: generatedScript,
        success: true,
        metrics: {
          wordCount: actualWordCount,
          targetWordCount: adjustedWordCount,
          wordCountAccuracy: wordCountAccuracy,
          formatAdherence: formatAdherence,
          topicRelevance: topicMentions,
          bannedPhraseCount: bannedPhraseCount,
          formatUsed: format,
          uniqueElementsFound: formatElementsFound,
          totalUniqueElements: formatInfo.uniqueElements.length
        },
        message: `${format} script generated: ${actualWordCount} words (${wordCountAccuracy.toFixed(1)}% accuracy), ${formatAdherence.toFixed(1)}% format adherence, ${bannedPhraseCount} banned phrases used`
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
