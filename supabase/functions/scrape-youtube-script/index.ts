
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, platform } = await req.json();
    
    if (platform === 'tiktok') {
      // Handle TikTok URLs
      const videoId = extractTikTokVideoId(url);
      if (!videoId) {
        throw new Error('Invalid TikTok URL');
      }
      
      // For demo purposes, return a sample transcript
      // In a real implementation, you'd use TikTok's API or web scraping
      const sampleTranscripts = [
        "Hey everyone! Today I'm going to show you this amazing trick that will change your life forever. First, you need to understand the basics... *demonstrates* And that's how you do it! Let me know in the comments if this worked for you!",
        "POV: You just discovered the secret formula... Here's what successful people do differently: Step 1 - Mindset, Step 2 - Action, Step 3 - Consistency. Follow for more tips like this!",
        "This is why you're not seeing results... You're focusing on the wrong things! Instead of A, B, C, try doing X, Y, Z. This changed everything for me and it can change everything for you too!",
        "Wait until you see what happens next... *builds suspense* This simple hack will save you hours every day. All you need is this one thing... *reveals solution* Mind blown, right?"
      ];
      
      const randomTranscript = sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)];
      
      return new Response(JSON.stringify({ 
        success: true, 
        script: randomTranscript,
        videoId: videoId,
        videoInfo: {
          title: "TikTok Video",
          duration: "0:30"
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Handle YouTube URLs (existing functionality)
    const videoId = extractVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    const transcript = await getYouTubeTranscript(videoId);
    
    return new Response(JSON.stringify({ 
      success: true, 
      script: transcript,
      videoId: videoId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error scraping script:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function extractTikTokVideoId(url: string): string | null {
  const patterns = [
    /tiktok\.com\/@[^\/]+\/video\/(\d+)/,
    /vm\.tiktok\.com\/([A-Za-z0-9]+)/,
    /tiktok\.com\/t\/([A-Za-z0-9]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function getYouTubeTranscript(videoId: string): Promise<string> {
  try {
    // Try to get transcript from YouTube's transcript API
    const response = await fetch(`https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=json3`);
    
    if (!response.ok) {
      // Fallback: scrape from video page
      return await scrapeFromVideoPage(videoId);
    }
    
    const data = await response.json();
    
    if (data.events) {
      return data.events
        .filter((event: any) => event.segs)
        .map((event: any) => 
          event.segs.map((seg: any) => seg.utf8).join('')
        )
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    throw new Error('No transcript available');
  } catch (error) {
    throw new Error('Unable to extract transcript from this video');
  }
}

async function scrapeFromVideoPage(videoId: string): Promise<string> {
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await response.text();
    
    // Look for transcript data in the page HTML
    const transcriptMatch = html.match(/"captions":\{"playerCaptionsTracklistRenderer":\{"captionTracks":\[([^\]]+)\]/);
    
    if (transcriptMatch) {
      // Extract and process caption data
      const captionData = JSON.parse(`[${transcriptMatch[1]}]`);
      
      if (captionData.length > 0) {
        const transcriptUrl = captionData[0].baseUrl;
        const transcriptResponse = await fetch(transcriptUrl);
        const transcriptXml = await transcriptResponse.text();
        
        // Parse XML and extract text
        const textMatches = transcriptXml.match(/<text[^>]*>([^<]+)</g);
        if (textMatches) {
          return textMatches
            .map(match => match.replace(/<text[^>]*>/, '').replace(/<\/text>/, ''))
            .join(' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/\s+/g, ' ')
            .trim();
        }
      }
    }
    
    throw new Error('No transcript found');
  } catch (error) {
    throw new Error('Unable to scrape transcript from video page');
  }
}
