
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced session tracking with better uniqueness detection
const sessionHistory = new Map<string, Array<{
  contentHash: string;
  wordCount: number;
  timestamp: number;
  prompt: string;
}>>();

// Generate content hash for uniqueness checking
const generateContentHash = (content: string): string => {
  const normalized = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const words = normalized.split(' ').filter(word => 
    word.length > 3 && 
    !['this', 'that', 'will', 'have', 'been', 'they', 'them', 'your', 'with', 'from', 'into', 'like', 'when', 'what', 'where', 'here', 'there'].includes(word)
  );
  
  const signature = words.slice(0, 50).sort().join('|');
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
      wordCount: content.split(/\s+/).length,
      timestamp: Date.now(),
      prompt: 'generated'
    });
    sessionHistory.set(sessionId, sessionData);
  }
  
  return !isDuplicate;
};

// Generate truly dynamic prompts
const generateDynamicPrompt = (data: any, attemptNumber: number): string => {
  const timestamp = Date.now();
  const seed = (timestamp + attemptNumber * 1000) % 10000;
  
  const perspectives = [
    "Take a contrarian stance and challenge conventional wisdom",
    "Focus on psychological triggers and emotional responses",
    "Use storytelling with unexpected plot twists",
    "Emphasize urgency and time-sensitive opportunities",
    "Create mystery and curiosity gaps throughout",
    "Build authority through specific examples and data",
    "Address hidden fears and secret desires",
    "Reveal insider secrets and behind-the-scenes truth",
    "Use pattern interrupts and surprising statements",
    "Focus on transformation and before/after scenarios"
  ];
  
  const structures = [
    "Hook → Problem → Agitation → Solution → Proof → Call to Action",
    "Pattern Interrupt → Curiosity → Story → Teaching → Application → CTA",
    "Shocking Statement → Why It Matters → How to Fix → What Changes → Action",
    "Question → Investigation → Discovery → Implementation → Results → Next Steps",
    "Mistake → Consequence → Better Way → How To → Success Story → Your Turn",
    "Secret → Why Hidden → What It Means → How to Use → Transformation → Action",
    "Challenge → Stakes → Strategy → Execution → Victory → Your Path",
    "Confusion → Clarity → Method → Practice → Mastery → Implementation"
  ];
  
  const tones = [
    "urgent and direct", "conversational and relatable", "authoritative and confident",
    "mysterious and intriguing", "passionate and energetic", "calm and systematic",
    "bold and provocative", "empathetic and supportive", "analytical and precise"
  ];
  
  const selectedPerspective = perspectives[seed % perspectives.length];
  const selectedStructure = structures[(seed + attemptNumber) % structures.length];
  const selectedTone = tones[(seed * 2 + attemptNumber) % tones.length];
  
  return `${selectedPerspective}. Use this structure: ${selectedStructure}. Tone: ${selectedTone}. Topic: ${data.topic}. Make this completely unique and different from typical content about this subject.`;
};

// Call Claude API
const callClaudeAPI = async (prompt: string, systemPrompt: string): Promise<string> => {
  const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');
  if (!claudeApiKey) {
    throw new Error('Claude API key not configured');
  }

  console.log('Calling Claude API...');
  
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
      temperature: 0.9,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Claude API error:', response.status, error);
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
};

// Call OpenAI API as fallback
const callOpenAIAPI = async (prompt: string, systemPrompt: string): Promise<string> => {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  console.log('Calling OpenAI API as fallback...');
  
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
      max_tokens: 4000,
      temperature: 0.9,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI API error:', response.status, error);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

// Generate script with AI
const generateWithAI = async (prompt: string, systemPrompt: string): Promise<string> => {
  try {
    // Try Claude first
    return await callClaudeAPI(prompt, systemPrompt);
  } catch (claudeError) {
    console.log('Claude failed, trying OpenAI:', claudeError.message);
    try {
      // Fallback to OpenAI
      return await callOpenAIAPI(prompt, systemPrompt);
    } catch (openaiError) {
      console.error('Both AI services failed:', { claude: claudeError.message, openai: openaiError.message });
      throw new Error('All AI services failed. Please check your API keys.');
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
    
    console.log('=== SCRIPT GENERATION REQUEST ===');
    console.log('Topic:', topic);
    console.log('Target Word Count:', targetWordCount);
    console.log('Scripts provided:', scripts?.length || 0);
    
    if (!topic) {
      throw new Error('Topic is required');
    }

    const sessionId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    let generatedScript = '';
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`\n--- ATTEMPT ${attempts} ---`);
      
      // Generate dynamic approach for this attempt
      const dynamicPrompt = generateDynamicPrompt(requestData, attempts);
      console.log('Dynamic approach:', dynamicPrompt.substring(0, 100) + '...');
      
      const systemPrompt = `You are an expert YouTube script writer. Create a compelling, unique script that meets these requirements:

CRITICAL REQUIREMENTS:
- Write EXACTLY ${targetWordCount} words (count every word precisely)
- Create completely original content - no templates or generic phrases
- Use the specific approach provided in the user prompt
- Make it engaging from the first sentence
- Include actionable value for viewers
- End with the specified call-to-action: "${callToAction}"

STYLE REQUIREMENTS:
- Hook viewers in the first 10 seconds
- Use conversational, engaging language
- Include specific examples and details
- Create curiosity and maintain attention
- Structure for YouTube audience retention

OUTPUT FORMAT:
Return ONLY the script content, exactly ${targetWordCount} words. No metadata, no explanations, just the script.`;

      const userPrompt = `Create a YouTube script about: ${topic}

${description ? `Context: ${description}` : ''}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}

APPROACH FOR THIS SCRIPT:
${dynamicPrompt}

${scripts && scripts.length > 0 ? `
REFERENCE STYLE (analyze these for tone and structure, but create completely different content):
${scripts.map((script: string, i: number) => `\nExample ${i+1}:\n${script.substring(0, 500)}...`).join('')}
` : ''}

Call to Action: "${callToAction}"

Create a ${targetWordCount}-word script that is completely unique and follows the specified approach.`;

      try {
        console.log('Generating script with AI...');
        generatedScript = await generateWithAI(userPrompt, systemPrompt);
        
        const actualWordCount = generatedScript.trim().split(/\s+/).length;
        console.log(`Generated ${actualWordCount} words (target: ${targetWordCount})`);
        
        // Check word count
        const wordCountMet = actualWordCount >= targetWordCount * 0.85; // Allow 15% tolerance
        
        // Check uniqueness
        const isUnique = isContentUnique(generatedScript, sessionId);
        
        console.log(`Word count met: ${wordCountMet}, Unique: ${isUnique}`);
        
        if (wordCountMet && isUnique) {
          console.log('✅ Script generation successful!');
          break;
        } else {
          console.log(`❌ Attempt ${attempts} failed - regenerating...`);
          if (attempts === maxAttempts) {
            console.log('⚠️ Max attempts reached, using last generated script');
          }
        }
        
      } catch (error) {
        console.error(`Attempt ${attempts} failed:`, error.message);
        if (attempts === maxAttempts) {
          throw error;
        }
      }
    }

    if (!generatedScript) {
      throw new Error('Failed to generate script after maximum attempts');
    }

    const finalWordCount = generatedScript.trim().split(/\s+/).length;
    const success = finalWordCount >= targetWordCount * 0.85;

    console.log('=== GENERATION COMPLETE ===');
    console.log(`Final word count: ${finalWordCount}`);
    console.log(`Success: ${success}`);
    console.log(`Attempts used: ${attempts}`);

    return new Response(
      JSON.stringify({ 
        script: generatedScript,
        success: true,
        metrics: {
          wordCount: finalWordCount,
          targetWordCount,
          meetsRequirement: success,
          attemptsNeeded: attempts,
          sessionId
        },
        message: `Script generated successfully: ${finalWordCount} words`
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
