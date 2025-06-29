
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
    avoidWords: ["framework", "system", "blueprint", "secret", "experts", "step-by-step", "nobody talks about"]
  },
  "Transformation Journey": {
    structure: "Before State → Catalyst → Struggle → Breakthrough → After State → Replication",
    approach: "Personal story-driven, emotional journey, concrete before/after evidence",
    lengthMultiplier: 1.1,
    uniqueElements: ["specific before situation", "catalyst moment", "struggle documentation", "breakthrough point", "after evidence", "replication guide"],
    avoidWords: ["framework", "system", "blueprint", "secret", "experts", "step-by-step", "nobody talks about"]
  },
  "Teaching Format": {
    structure: "Problem → Solution Preview → Method → Examples → Advanced Tips → Practice",
    approach: "Educational authority, practical instruction, multiple examples and applications",
    lengthMultiplier: 1.3,
    uniqueElements: ["problem identification", "solution preview", "method explanation", "real examples", "advanced applications", "practice opportunities"],
    avoidWords: ["secret", "nobody talks about", "hidden", "blueprint", "framework", "stop scrolling"]
  },
  "Trend Jack Format": {
    structure: "Trend Hook → Context → Your Angle → Evidence → Implications → Action",
    approach: "Timely, reactive, controversial takes, rapid response style",
    lengthMultiplier: 0.9,
    uniqueElements: ["trend reference", "context setting", "unique angle", "supporting evidence", "implications", "immediate action"],
    avoidWords: ["framework", "system", "blueprint", "step-by-step", "secret", "nobody talks about"]
  },
  "Success Story Format": {
    structure: "Result First → Background → Challenge → Strategy → Implementation → Results → Blueprint",
    approach: "Results-focused, credibility-building, proof-driven narrative",
    lengthMultiplier: 1.1,
    uniqueElements: ["concrete results", "background story", "specific challenge", "strategy used", "implementation details", "measurable outcomes", "replication method"],
    avoidWords: ["secret", "nobody talks about", "hidden", "framework", "stop scrolling"]
  },
  "Documentary Format": {
    structure: "Mystery/Question → Investigation → Evidence → Interviews → Revelations → Truth",
    approach: "Investigative journalism style, multiple perspectives, evidence-based conclusions",
    lengthMultiplier: 1.4,
    uniqueElements: ["central mystery", "investigation process", "evidence gathering", "expert perspectives", "revelations", "truth conclusion"],
    avoidWords: ["framework", "system", "blueprint", "secret", "step-by-step", "stop scrolling"]
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

    const systemPrompt = `You are an expert YouTube script writer who creates authentic, engaging content that follows specific viral formats. Your scripts must be completely unique and avoid generic templates.

CRITICAL REQUIREMENTS:
1. WORD COUNT: Must be exactly ${adjustedWordCount} words (±25 words maximum)
2. FORMAT ADHERENCE: Must follow ${format} structure precisely
3. VOICE AUTHENTICITY: Must match the reference author's writing style exactly
4. TOPIC FOCUS: 100% about "${topic}" with specific, actionable content
5. UNIQUENESS: Every script must be completely different and original

ABSOLUTELY BANNED PHRASES (NEVER USE):
${formatInfo.avoidWords.map(word => `"${word}"`).join(', ')}

FORMAT: ${format}
- Structure: ${formatInfo.structure}
- Approach: ${formatInfo.approach}
- Required Elements: ${formatInfo.uniqueElements.join(', ')}

VOICE ANALYSIS REQUIRED: Analyze the reference scripts to capture:
- Their specific vocabulary and phrases
- Sentence structure and rhythm
- How they address their audience
- Their emotional tone and energy
- Transition styles between ideas
- Storytelling approach and examples`;

    const userPrompt = `REFERENCE SCRIPTS FOR VOICE ANALYSIS:

${scripts.map((script, index) => `
=== REFERENCE SCRIPT ${index + 1} ===
${script}
`).join('')}

TASK: Create a completely original ${format} script about "${topic}"

SPECIFICATIONS:
- Topic: ${topic}
- Target Audience: ${targetAudience}
- Video Length: ${videoLength} minutes
- EXACT Word Count: ${adjustedWordCount} words
- Call to Action: ${callToAction}
- Format: ${format}
${description ? `- Additional Context: ${description}` : ''}

CREATION PROCESS:

1. **VOICE DNA EXTRACTION**
Analyze the reference scripts to identify:
- Their unique phrases and vocabulary
- Sentence patterns and flow
- How they connect with their audience
- Their specific tone and energy
- Storytelling techniques they use

2. **FORMAT IMPLEMENTATION**
Structure your script using the ${format} approach:

${formatInfo.uniqueElements.map((element, index) => `
**${element.toUpperCase()}** (~${Math.round(adjustedWordCount / formatInfo.uniqueElements.length)} words)
- Must authentically sound like the reference author
- Must advance the ${format} narrative structure
- Must provide specific value about "${topic}"`).join('')}

3. **CONTENT REQUIREMENTS**
- Write EXACTLY ${adjustedWordCount} words of valuable content about "${topic}"
- Use the author's authentic voice, not generic business language
- Include specific examples, tactics, and actionable insights about "${topic}"
- Follow ${format} structure without deviation
- End with natural CTA incorporating "${callToAction}"
- ZERO template language - every sentence must sound authentically theirs

4. **QUALITY STANDARDS**
✓ Uses their specific vocabulary and communication style
✓ Matches their energy and personality
✓ Follows ${format} structure exactly
✓ Reaches ${adjustedWordCount} words with valuable content
✓ 100% focused on "${topic}" with specific insights
✓ Completely avoids all banned generic phrases
✓ Sounds like something they would actually write

Create a completely unique script that captures their authentic voice while following the ${format} structure. Begin immediately with the script - no analysis or explanation.`;

    console.log(`Generating ${format} script with Claude API...`);
    console.log(`Target word count: ${adjustedWordCount}`);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
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
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const generatedScript = data.content[0].text;
    
    // Verify word count
    const actualWordCount = generatedScript.trim().split(/\s+/).length;
    const wordCountDifference = Math.abs(actualWordCount - adjustedWordCount);
    const wordCountAccuracy = ((adjustedWordCount - wordCountDifference) / adjustedWordCount) * 100;

    console.log(`${format} script generated successfully:`);
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
        message: `${format} script generated with Claude: ${actualWordCount} words (${wordCountAccuracy.toFixed(1)}% accuracy), ${formatAdherence.toFixed(1)}% format adherence, ${bannedPhraseCount} banned phrases detected`
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
