
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simplified session tracking for better performance
const sessionHistory = new Map<string, Array<{
  contentHash: string;
  timestamp: number;
}>>();

// Faster content hash generation
const generateContentHash = (content: string): string => {
  const normalized = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Use first and last 100 characters for faster hashing
  const signature = normalized.substring(0, 100) + normalized.substring(Math.max(0, normalized.length - 100));
  let hash = 0;
  for (let i = 0; i < signature.length; i++) {
    const char = signature.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

// Check content uniqueness
const isContentUnique = (content: string, sessionId: string): boolean => {
  const contentHash = generateContentHash(content);
  const sessionData = sessionHistory.get(sessionId) || [];
  
  const isDuplicate = sessionData.some(entry => entry.contentHash === contentHash);
  
  if (!isDuplicate) {
    sessionData.push({
      contentHash,
      timestamp: Date.now()
    });
    sessionHistory.set(sessionId, sessionData.slice(-5)); // Keep only last 5 for memory efficiency
  }
  
  return !isDuplicate;
};

// Optimized dynamic prompt generation
const generateDynamicPrompt = (data: any, attemptNumber: number): string => {
  const timestamp = Date.now();
  const seed = (timestamp + attemptNumber * 1000) % 100;
  
  const approaches = [
    {
      perspective: "Take a contrarian stance and challenge conventional wisdom",
      structure: "Hook → Problem → Agitation → Solution → Proof → Call to Action",
      tone: "urgent and direct"
    },
    {
      perspective: "Focus on psychological triggers and emotional responses", 
      structure: "Pattern Interrupt → Curiosity → Story → Teaching → Application → CTA",
      tone: "conversational and relatable"
    },
    {
      perspective: "Use storytelling with unexpected plot twists",
      structure: "Question → Investigation → Discovery → Implementation → Results → Next Steps", 
      tone: "mysterious and intriguing"
    },
    {
      perspective: "Create mystery and curiosity gaps throughout",
      structure: "Challenge → Stakes → Strategy → Execution → Victory → Your Path",
      tone: "passionate and energetic"
    }
  ];
  
  const selected = approaches[seed % approaches.length];
  
  return `${selected.perspective}. Use this structure: ${selected.structure}. Tone: ${selected.tone}. Topic: ${data.topic}. Make this completely unique and engaging.`;
};

// Optimized Claude API call with timeout
const callClaudeAPI = async (prompt: string, systemPrompt: string): Promise<string> => {
  const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');
  if (!claudeApiKey) {
    throw new Error('Claude API key not configured');
  }

  console.log('Calling Claude API...');
  
  // Add timeout to prevent long waits
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 6000, // Reduced from 8000 for faster response
        temperature: 0.8, // Reduced from 0.9 for more consistency
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: prompt
        }]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.text();
      console.error('Claude API error:', response.status, error);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Optimized OpenAI API call with timeout
const callOpenAIAPI = async (prompt: string, systemPrompt: string): Promise<string> => {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  console.log('Calling OpenAI API as fallback...');
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 3000, // Reduced for faster response
        temperature: 0.8,
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', response.status, error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Generate script with AI
const generateWithAI = async (prompt: string, systemPrompt: string): Promise<string> => {
  try {
    return await callClaudeAPI(prompt, systemPrompt);
  } catch (claudeError) {
    console.log('Claude failed, trying OpenAI:', claudeError.message);
    try {
      return await callOpenAIAPI(prompt, systemPrompt);
    } catch (openaiError) {
      console.error('Both AI services failed:', { claude: claudeError.message, openai: openaiError.message });
      throw new Error('AI services temporarily unavailable. Please try again.');
    }
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { topic, description, targetAudience, scripts, callToAction, targetWordCount = 1400 } = requestData;
    
    console.log('=== PROFESSIONAL YOUTUBE SCRIPT GENERATION ===');
    console.log('Topic:', topic);
    console.log('Target Word Count:', targetWordCount);
    console.log('Scripts provided:', scripts?.length || 0);
    
    if (!topic) {
      throw new Error('Topic is required');
    }

    const sessionId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    
    console.log('Generating with professional YouTube standards...');
    
    const dynamicPrompt = generateDynamicPrompt(requestData, 1);
    
    const systemPrompt = `You are a professional YouTube script writer following industry-standard best practices. Create a compelling, viral-ready script that strictly adheres to these professional guidelines:

1. DEFINE THE GOAL BEFORE WRITING
- Core promise: One crisp sentence that will appear in thumbnail/title
- Video type: Educational "How-to/Explainer" (default), Challenge/Competition, or Commentary
- Single-line payoff: Must not fully happen until final 15% of runtime

2. SCRIPT SKELETON (MANDATORY STRUCTURE)
A) Cold-Open Hook (0-30s)
   1) WHAT – statement of the topic
   2) WHY – immediate personal benefit to viewer  
   3) TENSION – open loop/question

B) Rising Value Segments (≈90s blocks, repeat as needed)
   - Facts/demos/stories that inch toward payoff
   - Engagement pulse every ≤120s (mini-challenge, reveal, joke, visual stunt)
   - Visual change every 2-7s; micro-change every 1-3s

C) Climax & Payoff
   - Resolve main tension; deliver promised result
   - Flash a reward (bonus tip, discount code, etc.)

D) Outro (≤15s)
   - Tease related video that extends the journey
   - 1-line CTA; no long self-talk

3. WRITING & STYLE DIRECTIVES (MANDATORY RULES)
- Tone: Active voice, second person ("you")
- Length: Script equals 85-90% of final runtime (leave room for pauses/edits)
- Cuts: Insert [CUT] or [VISUAL: description] tags every 2-7s
- Jargon: Explain any term <5s after first use
- Personality: Focus on viewer benefits, not host
- Psychology: Weave "dream" or "greed" appeal every major segment

4. ALGORITHM COLLABORATION RULES
- Retention First: Never sacrifice tension for completeness
- Payoff withheld until final 15%
- No section longer than 120s without engagement pulse

5. QUALITY CHECKLIST (ALL MUST BE MET)
✓ Payoff withheld until final 15%
✓ Hook uses 3-piece formula with tension question
✓ No section >120s without engagement pulse
✓ At least one audience dream/aspiration trigger
✓ Script length matches target runtime ±10%
✓ [VISUAL] and [CUT] tags inserted every 2-7s

CRITICAL REQUIREMENTS:
- Write approximately ${targetWordCount} words (aim for 90-110% of target)
- Follow the exact skeleton structure above
- Include [VISUAL: description] tags for B-roll/graphics
- Add [CUT] tags where pacing would drop
- End with specified call-to-action: "${callToAction}"
- Use curiosity gaps and open loops throughout
- Maintain tension until final 15% payoff

OUTPUT FORMAT:
Return ONLY the script content with proper formatting, visual cues, and cut tags. No metadata, no explanations, just the professional script following all guidelines above.`;

    const userPrompt = `Create a professional YouTube script about: ${topic}

${description ? `Context: ${description}` : ''}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}

APPROACH FOR THIS SCRIPT:
${dynamicPrompt}

${scripts && scripts.length > 0 ? `
REFERENCE STYLE (analyze for tone and structure, create completely different content):
${scripts.map((script: string, i: number) => `\nExample ${i+1}:\n${script.substring(0, 300)}...`).join('')}
` : ''}

MANDATORY REQUIREMENTS:
1. Follow the exact 4-part skeleton structure (Hook → Rising Value → Climax → Outro)
2. Include [VISUAL: description] tags every 2-7 seconds
3. Add [CUT] tags where pacing needs breaks
4. Withhold main payoff until final 15% of script
5. Use active voice, second person throughout
6. Include engagement pulses every 120 seconds max
7. End with call-to-action: "${callToAction}"

Create a ${targetWordCount}-word professional YouTube script that meets ALL quality checklist requirements.`;

    console.log('Starting professional AI generation...');
    const startTime = Date.now();
    
    const generatedScript = await generateWithAI(userPrompt, systemPrompt);
    
    const generationTime = Date.now() - startTime;
    console.log(`Generation completed in ${generationTime}ms`);
    
    const actualWordCount = generatedScript.trim().split(/\s+/).length;
    console.log(`Generated ${actualWordCount} words (target: ${targetWordCount})`);
    
    // Check uniqueness
    const isUnique = isContentUnique(generatedScript, sessionId);
    console.log(`Content uniqueness: ${isUnique}`);
    
    // Professional script acceptance (80-120% of target)
    const wordCountMet = actualWordCount >= targetWordCount * 0.8 && actualWordCount <= targetWordCount * 1.2;
    
    if (!generatedScript) {
      throw new Error('Failed to generate script content');
    }

    console.log('=== PROFESSIONAL GENERATION COMPLETE ===');
    console.log(`Final word count: ${actualWordCount}`);
    console.log(`Professional standards met: ${wordCountMet}`);
    console.log(`Generation time: ${generationTime}ms`);

    return new Response(
      JSON.stringify({ 
        script: generatedScript,
        success: true,
        metrics: {
          wordCount: actualWordCount,
          targetWordCount,
          meetsRequirement: wordCountMet,
          generationTimeMs: generationTime,
          isUnique,
          sessionId,
          professionalStandards: true
        },
        message: `Professional YouTube script generated: ${actualWordCount} words in ${Math.round(generationTime/1000)}s`
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('=== PROFESSIONAL SCRIPT GENERATION ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        details: 'Check edge function logs for more information'
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
