
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Completely rewritten format approaches - no templates, just strategic guidance
const formatApproaches = {
  "Competition Format": {
    essence: "Creates tension through contest/challenge dynamics, builds suspense toward winner reveal",
    startingStyles: [
      "immediate challenge introduction",
      "stakes establishment upfront", 
      "competitor comparison setup",
      "challenge parameters reveal"
    ],
    narrativeFlow: "challenge presentation → participant introduction → process documentation → climax/resolution → takeaway",
    avoidPhrases: ["stop scrolling", "here's the thing", "nobody talks about", "secret", "framework", "blueprint", "step-by-step"],
    uniqueAngle: "competition/contest energy with clear winner/loser outcomes"
  },
  "Transformation Journey": {
    essence: "Documents dramatic change over time, focuses on before/after contrast with emotional journey",
    startingStyles: [
      "dramatic before/after reveal",
      "moment of decision story",
      "rock bottom introduction",
      "catalyst event description"
    ],
    narrativeFlow: "starting point → catalyst → struggle phase → breakthrough → new reality → lessons learned",
    avoidPhrases: ["stop scrolling", "here's the thing", "nobody talks about", "secret", "framework", "blueprint"],
    uniqueAngle: "personal transformation with specific, measurable change"
  },
  "Teaching Format": {
    essence: "Educational authority sharing practical knowledge through instruction and examples",
    startingStyles: [
      "problem identification",
      "counterintuitive insight",
      "common mistake correction",
      "skill demonstration"
    ],
    narrativeFlow: "problem awareness → solution preview → instruction → examples → advanced applications → practice",
    avoidPhrases: ["stop scrolling", "nobody talks about", "secret", "hidden", "blueprint"],
    uniqueAngle: "instructor authority with actionable learning outcomes"
  },
  "Trend Jack Format": {
    essence: "Rapid response to current events/trends with unique perspective and timely relevance",
    startingStyles: [
      "trend reference hook",
      "contrarian take opening",
      "breaking news angle",
      "cultural moment capture"
    ],
    narrativeFlow: "trend acknowledgment → unique perspective → supporting evidence → implications → action items",
    avoidPhrases: ["stop scrolling", "framework", "blueprint", "step-by-step", "secret", "nobody talks about"],
    uniqueAngle: "timely relevance with fresh perspective on current topics"
  },
  "Success Story Format": {
    essence: "Concrete results and proof-driven narrative showing specific achievements and methods",
    startingStyles: [
      "results announcement",
      "achievement reveal",
      "case study introduction",
      "proof presentation"
    ],
    narrativeFlow: "results preview → background context → challenge faced → strategy employed → implementation → outcomes → replication method",
    avoidPhrases: ["stop scrolling", "nobody talks about", "hidden", "secret", "framework"],
    uniqueAngle: "credibility through concrete results and specific case studies"
  },
  "Documentary Format": {
    essence: "Investigative deep-dive with multiple perspectives, evidence gathering, and comprehensive analysis",
    startingStyles: [
      "mystery question",
      "investigation premise",
      "unexplored angle",
      "evidence preview"
    ],
    narrativeFlow: "central question → investigation setup → evidence gathering → expert insights → revelations → conclusions",
    avoidPhrases: ["stop scrolling", "framework", "blueprint", "step-by-step", "secret"],
    uniqueAngle: "investigative journalism approach with thorough research and multiple viewpoints"
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

    const formatInfo = formatApproaches[format] || formatApproaches["Teaching Format"];
    const adjustedWordCount = Math.round(targetWordCount * 1.1);

    // Completely different prompt approach - no templates, pure creative direction
    const systemPrompt = `You are a master scriptwriter who creates completely unique, engaging content for each request. Your scripts are never templated or formulaic.

CRITICAL MISSION:
- Create a 100% unique ${format} script about "${topic}"
- EXACT word count: ${adjustedWordCount} words (strict requirement)
- Capture the authentic voice from reference scripts
- Follow ${format} essence without using any templates

ABSOLUTELY FORBIDDEN PHRASES (never use these):
${formatInfo.avoidPhrases.map(phrase => `"${phrase}"`).join(', ')}

FORMAT ESSENCE: ${formatInfo.essence}
NARRATIVE APPROACH: ${formatInfo.narrativeFlow}
UNIQUE ANGLE: ${formatInfo.uniqueAngle}

VOICE CAPTURE PROTOCOL:
Analyze reference scripts for:
- Their specific vocabulary choices
- How they structure sentences  
- Their rhythm and pacing
- Emotional tone and energy
- How they connect with audience
- Their storytelling patterns

CREATION REQUIREMENTS:
- Start with one of these approaches: ${formatInfo.startingStyles.join(', ')}
- Every sentence must sound authentically like the reference author
- Focus 100% on "${topic}" with specific, valuable insights
- Avoid any generic business language or templates
- Create natural flow that feels conversational and engaging
- Include specific examples and actionable content about "${topic}"
- End with natural integration of: "${callToAction}"

OUTPUT ONLY THE SCRIPT - no analysis, no explanation, no meta-commentary.`;

    const userPrompt = `REFERENCE SCRIPTS FOR VOICE ANALYSIS:

${scripts.map((script, index) => `
REFERENCE ${index + 1}:
${script}
`).join('')}

ASSIGNMENT: Write a completely original ${format} script about "${topic}"

SPECIFICATIONS:
- Topic Focus: ${topic}
- Target Audience: ${targetAudience}
- Video Length: ${videoLength} minutes
- Word Count: EXACTLY ${adjustedWordCount} words
- Call to Action: ${callToAction}
- Format: ${format}
${description ? `- Context: ${description}` : ''}

Write the script now - start immediately with the content. Make it sound exactly like the reference author would write it, but 100% unique and focused on "${topic}".`;

    console.log(`Generating unique ${format} script with Claude...`);
    console.log(`Target: ${adjustedWordCount} words`);

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
        temperature: 0.9, // Higher temperature for more creativity
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
    
    // Verify uniqueness and quality
    const actualWordCount = generatedScript.trim().split(/\s+/).length;
    const wordCountAccuracy = ((adjustedWordCount - Math.abs(actualWordCount - adjustedWordCount)) / adjustedWordCount) * 100;

    // Check for banned phrases
    const bannedPhraseCount = formatInfo.avoidPhrases.reduce((count, phrase) => {
      return count + (generatedScript.toLowerCase().split(phrase.toLowerCase()).length - 1);
    }, 0);

    // Check topic relevance
    const topicWords = topic.toLowerCase().split(' ').filter(word => word.length > 2);
    const scriptLower = generatedScript.toLowerCase();
    const topicMentions = topicWords.reduce((count, word) => {
      return count + (scriptLower.split(word).length - 1);
    }, 0);

    console.log(`Unique ${format} script generated:`);
    console.log(`Words: ${actualWordCount}/${adjustedWordCount} (${wordCountAccuracy.toFixed(1)}% accuracy)`);
    console.log(`Banned phrases found: ${bannedPhraseCount}`);
    console.log(`Topic mentions: ${topicMentions}`);

    return new Response(
      JSON.stringify({ 
        script: generatedScript,
        success: true,
        metrics: {
          wordCount: actualWordCount,
          targetWordCount: adjustedWordCount,
          wordCountAccuracy: wordCountAccuracy,
          topicRelevance: topicMentions,
          bannedPhraseCount: bannedPhraseCount,
          formatUsed: format,
          uniquenessScore: Math.max(0, 100 - (bannedPhraseCount * 10))
        },
        message: `Unique ${format} script created: ${actualWordCount} words, ${bannedPhraseCount} template phrases detected, ${topicMentions} topic references`
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
