
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
    
    console.log('=== OPTIMIZED SCRIPT GENERATION ===');
    console.log('Topic:', topic);
    console.log('Target Word Count:', targetWordCount);
    console.log('Scripts provided:', scripts?.length || 0);
    
    if (!topic) {
      throw new Error('Topic is required');
    }

    const sessionId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    
    // Single attempt with optimized parameters
    console.log('Generating with optimized approach...');
    
    const dynamicPrompt = generateDynamicPrompt(requestData, 1);
    
    const systemPrompt = `You are an expert YouTube script writer. Create a compelling, unique script that meets these requirements:

CRITICAL REQUIREMENTS:
- Write approximately ${targetWordCount} words (aim for 90-110% of target)
- Create completely original content with engaging hooks
- Use the specific approach provided in the user prompt
- Make it viral and attention-grabbing from the first sentence
- Include actionable value for viewers
- End with the specified call-to-action: "${callToAction}"

STYLE REQUIREMENTS:
- Hook viewers in the first 10 seconds with a strong pattern interrupt
- Use conversational, engaging language that builds rapport
- Include specific examples and concrete details
- Create curiosity gaps and maintain attention throughout
- Structure for YouTube audience retention and engagement

OUTPUT FORMAT:
Return ONLY the script content, approximately ${targetWordCount} words. No metadata, no explanations, just the compelling script.`;

    const userPrompt = `Create a YouTube script about: ${topic}

${description ? `Context: ${description}` : ''}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}

APPROACH FOR THIS SCRIPT:
${dynamicPrompt}

${scripts && scripts.length > 0 ? `
REFERENCE STYLE (analyze these for tone and structure, but create completely different content):
${scripts.map((script: string, i: number) => `\nExample ${i+1}:\n${script.substring(0, 300)}...`).join('')}
` : ''}

Call to Action: "${callToAction}"

Create a ${targetWordCount}-word script that is completely unique and follows the specified approach.`;

    console.log('Starting AI generation...');
    const startTime = Date.now();
    
    const generatedScript = await generateWithAI(userPrompt, systemPrompt);
    
    const generationTime = Date.now() - startTime;
    console.log(`Generation completed in ${generationTime}ms`);
    
    const actualWordCount = generatedScript.trim().split(/\s+/).length;
    console.log(`Generated ${actualWordCount} words (target: ${targetWordCount})`);
    
    // Check uniqueness
    const isUnique = isContentUnique(generatedScript, sessionId);
    console.log(`Content uniqueness: ${isUnique}`);
    
    // More lenient word count acceptance (80-120% of target)
    const wordCountMet = actualWordCount >= targetWordCount * 0.8 && actualWordCount <= targetWordCount * 1.2;
    
    if (!generatedScript) {
      throw new Error('Failed to generate script content');
    }

    console.log('=== GENERATION COMPLETE ===');
    console.log(`Final word count: ${actualWordCount}`);
    console.log(`Word count acceptable: ${wordCountMet}`);
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
          sessionId
        },
        message: `Script generated successfully: ${actualWordCount} words in ${Math.round(generationTime/1000)}s`
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
