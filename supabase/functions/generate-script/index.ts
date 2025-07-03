
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
    
    console.log('=== SCRIPT GENERATION WITH REFERENCE STYLE ANALYSIS ===');
    console.log('Topic:', topic);
    console.log('Target Word Count:', targetWordCount);
    console.log('Scripts provided:', scripts?.length || 0);
    
    if (!topic) {
      throw new Error('Topic is required');
    }

    const sessionId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    
    console.log('Generating script based on reference styles...');
    
    const dynamicPrompt = generateDynamicPrompt(requestData, 1);
    
    const systemPrompt = `You are an expert YouTube script writer who specializes in analyzing successful viral scripts and replicating their winning patterns. Your job is to create a compelling script that captures the essence and style of the provided reference scripts while creating completely new content.

CORE APPROACH:
1. Analyze the reference scripts for their successful patterns
2. Identify the structure, pacing, and stylistic elements that make them effective
3. Create a new script that follows these proven patterns but with completely different content
4. Maintain the same energy, flow, and psychological triggers as the reference scripts

SCRIPT REQUIREMENTS:
- Target length: Approximately ${targetWordCount} words
- Topic: ${topic}
- Call to action: ${callToAction}
- Style: Match the tone and pacing of the reference scripts
- Structure: Follow the successful pattern from the reference scripts

WRITING STYLE GUIDELINES:
- Use active voice and direct address ("you")
- Create strong hooks that grab attention immediately
- Build tension and curiosity throughout
- Use psychological triggers like urgency, scarcity, and social proof
- Include specific examples and stories when relevant
- Maintain high energy and engagement
- End with a clear, compelling call to action

FORMATTING:
- Use clear section breaks
- Include [VISUAL: description] tags for important visual elements
- Add [CUT] tags where pacing changes or visual breaks are needed
- Structure the script for easy reading and production

Your goal is to create a script that feels authentic to the reference style while being completely unique and tailored to the new topic.`;

    const userPrompt = `Create a compelling YouTube script about: ${topic}

${description ? `Additional Context: ${description}` : ''}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}

CREATIVE APPROACH FOR THIS SCRIPT:
${dynamicPrompt}

${scripts && scripts.length > 0 ? `
REFERENCE SCRIPTS TO ANALYZE AND REPLICATE STYLE FROM:
${scripts.map((script: string, i: number) => `\n--- Reference Script ${i+1} ---\n${script.substring(0, 1500)}${script.length > 1500 ? '...' : ''}\n`).join('')}

INSTRUCTIONS:
1. Carefully study the reference scripts above
2. Identify their successful patterns: structure, pacing, tone, psychological triggers
3. Create a NEW script about "${topic}" that follows these same successful patterns
4. DO NOT copy content - create completely original material that matches the STYLE and STRUCTURE
5. Maintain the same energy and engagement level as the reference scripts
6. Use similar psychological triggers and persuasion techniques
7. Follow the same general flow and pacing patterns
` : ''}

REQUIREMENTS:
- Write approximately ${targetWordCount} words
- Create original content (no copying from reference scripts)
- Match the successful style and structure patterns from the references
- Include engaging hooks, stories, and examples
- Build tension and curiosity throughout
- End with call-to-action: "${callToAction}"
- Add [VISUAL: description] and [CUT] tags where appropriate

Create a script that captures the viral essence of the reference materials while being completely unique and focused on the new topic.`;

    console.log('Starting AI generation with reference style analysis...');
    const startTime = Date.now();
    
    const generatedScript = await generateWithAI(userPrompt, systemPrompt);
    
    const generationTime = Date.now() - startTime;
    console.log(`Generation completed in ${generationTime}ms`);
    
    const actualWordCount = generatedScript.trim().split(/\s+/).length;
    console.log(`Generated ${actualWordCount} words (target: ${targetWordCount})`);
    
    // Check uniqueness
    const isUnique = isContentUnique(generatedScript, sessionId);
    console.log(`Content uniqueness: ${isUnique}`);
    
    // Accept scripts within reasonable range (70-130% of target)
    const wordCountMet = actualWordCount >= targetWordCount * 0.7 && actualWordCount <= targetWordCount * 1.3;
    
    if (!generatedScript) {
      throw new Error('Failed to generate script content');
    }

    console.log('=== SCRIPT GENERATION COMPLETE ===');
    console.log(`Final word count: ${actualWordCount}`);
    console.log(`Word count requirement met: ${wordCountMet}`);
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
          styleBasedGeneration: true
        },
        message: `Script generated based on reference styles: ${actualWordCount} words in ${Math.round(generationTime/1000)}s`
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('=== SCRIPT GENERATION ERROR ===');
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
