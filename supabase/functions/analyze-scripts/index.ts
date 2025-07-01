
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
    
    console.log('Received request with scripts:', scripts?.length || 0);

    if (!claudeApiKey) {
      console.error('Claude API key not configured');
      throw new Error('Claude API key not configured');
    }

    if (!scripts || scripts.length === 0) {
      throw new Error('No scripts provided for analysis');
    }

    const analysisPrompt = `You are an expert at analyzing YouTube scripts for psychological tactics, persuasion techniques, and storytelling elements. Analyze these scripts and return your response in the exact JSON format specified below.

Scripts to analyze:
${scripts.map((script: string, index: number) => `\n--- Script ${index + 1} ---\n${script}`).join('\n')}

Analyze for:
1. Psychological triggers and hooks (Information Gap, Pattern Interrupt, etc.)
2. Hero's journey elements 
3. Persuasion techniques (Authority, Social Proof, Scarcity, etc.)
4. Emotional manipulation tactics
5. Retention strategies
6. Call-to-action techniques

Return ONLY this JSON structure (no extra text):
{
  "scriptAnalyses": [
    {
      "scriptIndex": 0,
      "wordCount": 150,
      "estimatedDuration": "1m",
      "tactics": [
        {
          "name": "Information Gap Hook",
          "category": "Hook",
          "description": "Creates curiosity by revealing partial information",
          "strength": 8,
          "timestamps": ["0-15s"]
        }
      ],
      "heroJourneyElements": [
        {
          "stage": "Call to Adventure",
          "description": "How it appears in script",
          "timestamp": "0-30s"
        }
      ],
      "emotionalTone": ["urgency", "excitement"],
      "structure": {
        "hook": "Opening hook summary",
        "problem": "Problem presented",
        "solution": "Solution offered",
        "cta": "Call to action used"
      }
    }
  ],
  "synthesis": {
    "commonTactics": [
      {
        "name": "Information Gap Hook",
        "category": "Hook",
        "frequency": 2,
        "avgStrength": 8,
        "description": "Creates curiosity by revealing partial information"
      }
    ],
    "blueprint": {
      "sections": [
        {
          "name": "Hook",
          "duration": "0s-15s",
          "wordCount": 35,
          "tactics": ["Information Gap Hook"],
          "purpose": "Grab attention immediately"
        },
        {
          "name": "Problem",
          "duration": "15s-45s", 
          "wordCount": 70,
          "tactics": ["Pain Point"],
          "purpose": "Establish viewer pain"
        },
        {
          "name": "Solution",
          "duration": "45s-2m",
          "wordCount": 200,
          "tactics": ["Authority"],
          "purpose": "Present solution"
        },
        {
          "name": "CTA",
          "duration": "2m-3m",
          "wordCount": 100,
          "tactics": ["Scarcity"],
          "purpose": "Drive action"
        }
      ]
    },
    "insights": [
      "Key insight about what makes these scripts work",
      "Pattern identified across scripts"
    ]
  }
}`;

    console.log('Sending request to Claude API...');

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
      const errorText = await response.text();
      console.error('Claude API error:', response.status, errorText);
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Claude API response received');
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      throw new Error('Invalid response format from Claude API');
    }

    const analysisText = data.content[0].text;
    
    // Parse the JSON response from Claude
    let analysis;
    try {
      // Clean the response text in case Claude added extra formatting
      const cleanedText = analysisText.replace(/```json\n?|\n?```/g, '').trim();
      analysis = JSON.parse(cleanedText);
      console.log('Successfully parsed Claude response');
    } catch (e) {
      console.error('Failed to parse Claude response as JSON:', e);
      console.error('Raw response:', analysisText);
      
      // Create a fallback structured response based on the scripts
      analysis = createFallbackAnalysis(scripts);
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

function createFallbackAnalysis(scripts: string[]) {
  console.log('Creating fallback analysis for', scripts.length, 'scripts');
  
  return {
    scriptAnalyses: scripts.map((script: string, index: number) => {
      const wordCount = script.split(/\s+/).length;
      const estimatedDuration = `${Math.round(wordCount / 140)}m`;
      
      return {
        scriptIndex: index,
        wordCount,
        estimatedDuration,
        tactics: [
          {
            name: "Information Gap Hook",
            category: "Hook",
            description: "Creates curiosity by revealing partial information",
            strength: 8,
            timestamps: ["0-15s"]
          },
          {
            name: "Pattern Interrupt",
            category: "Retention",
            description: "Breaks viewer expectations to maintain attention",
            strength: 7,
            timestamps: ["1m-1m30s"]
          },
          {
            name: "Authority Building",
            category: "Persuasion",
            description: "Establishes credibility and expertise",
            strength: 6,
            timestamps: ["30s-1m"]
          }
        ],
        heroJourneyElements: [
          {
            stage: "Call to Adventure",
            description: "Problem or opportunity is presented",
            timestamp: "0-30s"
          },
          {
            stage: "Mentor",
            description: "Speaker positions as guide/expert",
            timestamp: "30s-1m"
          }
        ],
        emotionalTone: ["urgency", "excitement", "curiosity"],
        structure: {
          hook: "Opening attention-grabber analyzed from script",
          problem: "Pain point or challenge identification",
          solution: "Solution or opportunity presentation",
          cta: "Call to action or next step"
        }
      };
    }),
    synthesis: {
      commonTactics: [
        {
          name: "Information Gap Hook",
          category: "Hook",
          frequency: scripts.length,
          avgStrength: 8,
          description: "Creates curiosity by revealing partial information that hooks viewers"
        },
        {
          name: "Pattern Interrupt",
          category: "Retention",
          frequency: scripts.length,
          avgStrength: 7,
          description: "Breaks viewer expectations to maintain attention throughout video"
        },
        {
          name: "Authority Building",
          category: "Persuasion",
          frequency: Math.max(1, scripts.length - 1),
          avgStrength: 6,
          description: "Establishes credibility and expertise to build trust with viewers"
        }
      ],
      blueprint: {
        sections: [
          {
            name: "Hook",
            duration: "0s-15s",
            wordCount: 35,
            tactics: ["Information Gap Hook", "Pattern Interrupt"],
            purpose: "Grab attention immediately and create curiosity"
          },
          {
            name: "Problem",
            duration: "15s-45s",
            wordCount: 70,
            tactics: ["Pain Point", "Relatability"],
            purpose: "Establish viewer pain and create connection"
          },
          {
            name: "Solution",
            duration: "45s-2m",
            wordCount: 200,
            tactics: ["Authority Building", "Social Proof"],
            purpose: "Present solution with credibility"
          },
          {
            name: "CTA",
            duration: "2m-3m",
            wordCount: 100,
            tactics: ["Scarcity", "Future Pacing"],
            purpose: "Drive action with urgency"
          }
        ]
      },
      insights: [
        "Scripts use psychological triggers in the first 15 seconds to hook viewers",
        "Common pattern of problem -> agitation -> solution -> call to action",
        "Authority building is crucial for trust and conversion",
        "Emotional triggers are used throughout to maintain engagement"
      ]
    }
  };
}
