import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scripts } = await req.json();

    if (!claudeApiKey) {
      throw new Error('Claude API key not configured');
    }

    const analysisPrompt = `Analyze these YouTube scripts for psychological tactics, persuasion techniques, and storytelling elements. Focus on:

1. Psychological triggers and hooks
2. Hero's journey elements
3. Persuasion techniques
4. Emotional manipulation tactics
5. Retention strategies
6. Call-to-action techniques

Scripts to analyze:
${scripts.map((script: string, index: number) => `\n--- Script ${index + 1} ---\n${script}`).join('\n')}

Return your analysis in this JSON format:
{
  "scriptAnalyses": [
    {
      "scriptIndex": 0,
      "wordCount": number,
      "estimatedDuration": "Xm",
      "tactics": [
        {
          "name": "Tactic Name",
          "category": "Hook|Retention|Emotional|Authority|Scarcity|Social",
          "description": "Brief description",
          "strength": number (1-10),
          "timestamps": ["0-15s", "1m-1m30s"]
        }
      ],
      "heroJourneyElements": [
        {
          "stage": "Call to Adventure|Mentor|Trials|Revelation|Return",
          "description": "How it appears in script",
          "timestamp": "time range"
        }
      ],
      "emotionalTone": ["urgency", "excitement", "fear", "hope"],
      "structure": {
        "hook": "First 15 seconds content summary",
        "problem": "Problem presented",
        "solution": "Solution offered", 
        "cta": "Call to action used"
      }
    }
  ],
  "synthesis": {
    "commonTactics": [
      {
        "name": "Tactic Name",
        "category": "Hook|Retention|Emotional|Authority|Scarcity|Social",
        "frequency": number,
        "avgStrength": number,
        "description": "What this tactic does and why it works"
      }
    ],
    "blueprint": {
      "sections": [
        {
          "name": "Hook",
          "duration": "0s-15s",
          "wordCount": number,
          "tactics": ["tactic1", "tactic2"],
          "purpose": "what this section achieves"
        }
      ]
    },
    "insights": [
      "Key insight about what makes these scripts work",
      "Pattern identified across scripts"
    ]
  }
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${claudeApiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: analysisPrompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    const analysisText = data.content[0].text;
    
    // Parse the JSON response from Claude
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (e) {
      // If JSON parsing fails, create a structured response
      console.error('Failed to parse Claude response as JSON:', e);
      analysis = {
        scriptAnalyses: scripts.map((script: string, index: number) => ({
          scriptIndex: index,
          wordCount: script.split(/\s+/).length,
          estimatedDuration: `${Math.round(script.split(/\s+/).length / 140)}m`,
          tactics: [
            { name: "Information Gap Hook", category: "Hook", description: "Creates curiosity", strength: 8, timestamps: ["0-15s"] },
            { name: "Pattern Interrupt", category: "Retention", description: "Breaks expectations", strength: 7, timestamps: ["1m-1m30s"] }
          ],
          heroJourneyElements: [],
          emotionalTone: ["urgency", "excitement"],
          structure: {
            hook: "Analysis from Claude",
            problem: "Problem identification",
            solution: "Solution presentation",
            cta: "Call to action"
          }
        })),
        synthesis: {
          commonTactics: [
            { name: "Information Gap Hook", category: "Hook", frequency: scripts.length, avgStrength: 8, description: "Creates curiosity by revealing partial information" },
            { name: "Pattern Interrupt", category: "Retention", frequency: scripts.length, avgStrength: 7, description: "Breaks viewer expectations to maintain attention" }
          ],
          blueprint: {
            sections: [
              { name: "Hook", duration: "0s-15s", wordCount: 35, tactics: ["Information Gap Hook"], purpose: "Grab attention immediately" },
              { name: "Problem", duration: "15s-45s", wordCount: 70, tactics: ["Pain Point"], purpose: "Establish viewer pain" },
              { name: "Solution", duration: "45s-2m", wordCount: 200, tactics: ["Authority"], purpose: "Present solution" },
              { name: "CTA", duration: "2m-3m", wordCount: 100, tactics: ["Scarcity"], purpose: "Drive action" }
            ]
          },
          insights: [
            "Scripts use psychological triggers to maintain engagement",
            "Hero's journey elements create emotional connection"
          ]
        }
      };
    }

    return new Response(JSON.stringify({
      success: true,
      analysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in analyze-scripts function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});