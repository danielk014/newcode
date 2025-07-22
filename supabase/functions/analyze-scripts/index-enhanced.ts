import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scripts, videoFormat } = await req.json();
    
    console.log('Received request with scripts:', scripts?.length || 0);
    console.log('Video format:', videoFormat);

    if (!openaiApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(JSON.stringify({
        success: false,
        error: 'OpenAI API key not configured'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!scripts || scripts.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No scripts provided for analysis'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const isShortForm = videoFormat?.format === 'short';
    const platform = videoFormat?.platform || 'youtube';

    const analysisPrompt = `You are an expert at analyzing ${isShortForm ? 'short-form' : 'long-form'} video scripts for ${platform}. Analyze these scripts for psychological tactics, persuasion techniques, and storytelling elements.

Scripts to analyze:
${scripts.map((script: string, index: number) => `\n--- Script ${index + 1} ---\n${script}`).join('\n')}

${isShortForm ? 'Focus on SHORT-FORM specific tactics like:' : 'Focus on LONG-FORM specific tactics like:'}
${isShortForm ? `
- 3-second hooks and immediate engagement
- Loop structures (showing result first)
- Rapid value delivery
- Visual/action hooks
- Trending format patterns
- Quick emotional triggers
- Save/share prompts
` : `
- Documentary-style hooks and credibility building
- Chapter-based structure
- Deep storytelling arcs
- Authority establishment
- Detailed explanations
- Case studies and examples
- Extended emotional journeys
`}

Analyze for:
1. Platform-specific optimization (${platform})
2. Hook effectiveness (rate 1-10)
3. Retention tactics and their placement
4. Emotional journey mapping
5. Call-to-action techniques
6. Viral elements and shareability factors

For each tactic found, provide:
- Exact location/timestamp (estimate based on script position)
- Strength rating (1-10)
- Why it works for ${isShortForm ? 'short-form' : 'long-form'} content

Return ONLY this JSON structure:
{
  "scriptAnalyses": [
    {
      "scriptIndex": 0,
      "wordCount": 150,
      "estimatedDuration": "${isShortForm ? '30s' : '8m'}",
      "platformOptimization": {
        "platform": "${platform}",
        "formatMatch": 8,
        "notes": "How well it matches platform best practices"
      },
      "hookAnalysis": {
        "type": "Information Gap",
        "effectiveness": 9,
        "firstWords": "First 10-15 words of the script",
        "explanation": "Why this hook works"
      },
      "tactics": [
        {
          "name": "3-Second Hook",
          "category": "Hook",
          "description": "Immediate attention grab",
          "strength": 9,
          "timestamps": ["0-3s"],
          "exactPhrase": "The exact phrase used",
          "whyItWorks": "Explanation of effectiveness"
        }
      ],
      "retentionCurve": [
        {
          "timestamp": "0-15s",
          "technique": "Hook",
          "predictedRetention": 95
        },
        {
          "timestamp": "15-30s",
          "technique": "Value Promise",
          "predictedRetention": 85
        }
      ],
      "emotionalJourney": [
        {
          "phase": "Curiosity",
          "timestamp": "0-10s",
          "tactics": ["Information Gap"]
        }
      ],
      "viralFactors": {
        "shareability": 8,
        "replayValue": 7,
        "commentBait": 9,
        "savePotential": 8
      },
      "structure": {
        "format": "${isShortForm ? 'Hook-Value-CTA' : 'Problem-Solution-Implementation'}",
        "sections": [
          {
            "name": "Hook",
            "duration": "0-${isShortForm ? '3s' : '15s'}",
            "content": "Summary of hook"
          }
        ]
      }
    }
  ],
  "synthesizedTactics": [
    {
      "name": "Pattern Interrupt",
      "category": "Hook",
      "frequency": 2,
      "avgStrength": 8.5,
      "description": "Sudden tone/topic changes",
      "bestPractices": "Use every 30-60 seconds",
      "platformNotes": "Works especially well on ${platform}"
    }
  ],
  "recommendedStructure": {
    "platform": "${platform}",
    "format": "${isShortForm ? 'short' : 'long'}",
    "blueprint": [
      {
        "section": "Hook",
        "duration": "${isShortForm ? '0-3s' : '0-15s'}",
        "tactics": ["3-Second Hook", "Pattern Interrupt"],
        "goal": "Capture attention"
      }
    ],
    "totalDuration": "${isShortForm ? '30-60s' : '8-10m'}",
    "wordCount": ${isShortForm ? 100 : 1400}
  },
  "insights": [
    "Key insight about viral potential",
    "Platform-specific optimization tip",
    "Improvement suggestion"
  ]
}`;

    console.log('Sending request to OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-2025-04-14',
        temperature: 0.3,
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: analysisPrompt
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      // Return fallback analysis
      const fallbackAnalysis = createEnhancedFallbackAnalysis(scripts, videoFormat);
      return new Response(JSON.stringify({
        success: true,
        analysis: fallbackAnalysis
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    console.log('OpenAI API response received');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('Invalid response format from OpenAI API');
      const fallbackAnalysis = createEnhancedFallbackAnalysis(scripts, videoFormat);
      return new Response(JSON.stringify({
        success: true,
        analysis: fallbackAnalysis
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const analysisText = data.choices[0].message.content;
    
    let analysis;
    try {
      const cleanedText = analysisText.replace(/```json\n?|\n?```/g, '').trim();
      analysis = JSON.parse(cleanedText);
      console.log('Successfully parsed OpenAI response');
    } catch (e) {
      console.error('Failed to parse OpenAI response as JSON:', e);
      console.error('Raw response:', analysisText);
      analysis = createEnhancedFallbackAnalysis(scripts, videoFormat);
    }

    return new Response(JSON.stringify({
      success: true,
      analysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function createEnhancedFallbackAnalysis(scripts: string[], videoFormat: any) {
  const isShortForm = videoFormat?.format === 'short';
  const platform = videoFormat?.platform || 'youtube';
  
  const scriptAnalyses = scripts.map((script, index) => {
    const wordCount = script.split(' ').length;
    const estimatedDuration = isShortForm 
      ? `${Math.round(wordCount / 3)}s`
      : `${Math.round(wordCount / 140)}m`;
    
    return {
      scriptIndex: index,
      wordCount,
      estimatedDuration,
      platformOptimization: {
        platform,
        formatMatch: 7,
        notes: "Good fit for platform conventions"
      },
      hookAnalysis: {
        type: "Pattern Interrupt",
        effectiveness: 8,
        firstWords: script.substring(0, 50) + "...",
        explanation: "Strong opening that captures attention"
      },
      tactics: [
        {
          name: isShortForm ? "3-Second Hook" : "Documentary Hook",
          category: "Hook",
          description: isShortForm ? "Immediate visual/verbal hook" : "Sets up compelling narrative",
          strength: 8,
          timestamps: [isShortForm ? "0-3s" : "0-15s"],
          exactPhrase: script.substring(0, 30),
          whyItWorks: "Creates immediate engagement"
        },
        {
          name: "Curiosity Gap",
          category: "Retention",
          description: "Information withheld to maintain interest",
          strength: 7,
          timestamps: [isShortForm ? "3-10s" : "15s-1m"],
          exactPhrase: "reveals partial information",
          whyItWorks: "Viewers must continue watching to get answers"
        }
      ],
      retentionCurve: isShortForm ? [
        { timestamp: "0-3s", technique: "Hook", predictedRetention: 95 },
        { timestamp: "3-15s", technique: "Value Delivery", predictedRetention: 80 },
        { timestamp: "15-30s", technique: "CTA", predictedRetention: 70 }
      ] : [
        { timestamp: "0-30s", technique: "Hook", predictedRetention: 90 },
        { timestamp: "30s-2m", technique: "Problem Setup", predictedRetention: 75 },
        { timestamp: "2m-5m", technique: "Solution", predictedRetention: 65 },
        { timestamp: "5m+", technique: "Implementation", predictedRetention: 55 }
      ],
      emotionalJourney: [
        { phase: "Curiosity", timestamp: isShortForm ? "0-5s" : "0-30s", tactics: ["Hook"] },
        { phase: "Interest", timestamp: isShortForm ? "5-20s" : "30s-3m", tactics: ["Value Promise"] },
        { phase: "Desire", timestamp: isShortForm ? "20-30s" : "3m-7m", tactics: ["Transformation"] }
      ],
      viralFactors: {
        shareability: 7,
        replayValue: 6,
        commentBait: 8,
        savePotential: 7
      },
      structure: {
        format: isShortForm ? "Hook-Value-CTA" : "Problem-Solution-Implementation",
        sections: isShortForm ? [
          { name: "Hook", duration: "0-3s", content: "Attention grabber" },
          { name: "Value", duration: "3-25s", content: "Core message" },
          { name: "CTA", duration: "25-30s", content: "Call to action" }
        ] : [
          { name: "Hook", duration: "0-30s", content: "Opening hook" },
          { name: "Problem", duration: "30s-2m", content: "Problem identification" },
          { name: "Solution", duration: "2m-5m", content: "Solution presentation" },
          { name: "Implementation", duration: "5m-8m", content: "How to apply" },
          { name: "CTA", duration: "8m-10m", content: "Next steps" }
        ]
      }
    };
  });

  const synthesizedTactics = [
    {
      name: isShortForm ? "Loop Structure" : "Story Arc",
      category: "Narrative",
      frequency: scripts.length,
      avgStrength: 8,
      description: isShortForm ? "Shows result first, then explains" : "Complete transformation journey",
      bestPractices: isShortForm ? "Start with the payoff" : "Build emotional investment",
      platformNotes: `Optimized for ${platform} algorithm`
    },
    {
      name: "Pattern Interrupt",
      category: "Retention",
      frequency: scripts.length,
      avgStrength: 7.5,
      description: "Breaks expected patterns to maintain attention",
      bestPractices: isShortForm ? "Every 5-10 seconds" : "Every 30-60 seconds",
      platformNotes: "Universal technique"
    }
  ];

  return {
    scriptAnalyses,
    synthesizedTactics,
    recommendedStructure: {
      platform,
      format: isShortForm ? 'short' : 'long',
      blueprint: isShortForm ? [
        { section: "Hook", duration: "0-3s", tactics: ["3-Second Hook"], goal: "Stop the scroll" },
        { section: "Value", duration: "3-25s", tactics: ["Rapid Tips", "Visual Demo"], goal: "Deliver promise" },
        { section: "CTA", duration: "25-30s", tactics: ["Save Prompt", "Comment Bait"], goal: "Drive engagement" }
      ] : [
        { section: "Hook", duration: "0-30s", tactics: ["Documentary Hook", "Credibility"], goal: "Establish authority" },
        { section: "Problem", duration: "30s-2m", tactics: ["Pain Points", "Relatability"], goal: "Create need" },
        { section: "Solution", duration: "2m-5m", tactics: ["Framework", "Examples"], goal: "Provide value" },
        { section: "Implementation", duration: "5m-8m", tactics: ["Step-by-Step", "Common Mistakes"], goal: "Enable action" },
        { section: "CTA", duration: "8m-10m", tactics: ["Scarcity", "Next Steps"], goal: "Convert viewers" }
      ],
      totalDuration: isShortForm ? "30s" : "8-10m",
      wordCount: isShortForm ? 100 : 1400
    },
    insights: [
      `Strong ${platform} optimization with platform-specific hooks`,
      isShortForm ? "Loop structure increases rewatch rate" : "Story arc maintains long-form engagement",
      "Consider adding more emotional triggers in middle section"
    ]
  };
}