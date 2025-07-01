
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
    console.log('Processing URL:', url, 'Platform:', platform);
    
    if (platform === 'tiktok') {
      // Handle TikTok URLs
      const videoId = extractTikTokVideoId(url);
      if (!videoId) {
        throw new Error('Invalid TikTok URL');
      }
      
      console.log('TikTok Video ID:', videoId);
      
      // For demo purposes, return a sample transcript
      const sampleTranscripts = [
        "Hey everyone! Today I'm going to show you this amazing trick that will change your life forever. First, you need to understand the basics... *demonstrates* And that's how you do it! Let me know in the comments if this worked for you!",
        "POV: You just discovered the secret formula... Here's what successful people do differently: Step 1 - Mindset, Step 2 - Action, Step 3 - Consistency. Follow for more tips like this!",
        "This is why you're not seeing results... You're focusing on the wrong things! Instead of A, B, C, try doing X, Y, Z. This changed everything for me and it can change everything for you too!",
        "Wait until you see what happens next... *builds suspense* This simple hack will save you hours every day. All you need is this one thing... *reveals solution* Mind blown, right?"
      ];
      
      const randomTranscript = sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)];
      
      console.log('Generated TikTok transcript:', randomTranscript.substring(0, 100) + '...');
      
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

    console.log('YouTube Video ID:', videoId);
    const transcript = await getYouTubeTranscript(videoId);
    
    console.log('Successfully extracted YouTube transcript, length:', transcript.length);
    
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
  console.log('Extracting TikTok video ID from:', url);
  const patterns = [
    /tiktok\.com\/@[^\/]+\/video\/(\d+)/,
    /vm\.tiktok\.com\/([A-Za-z0-9]+)/,
    /tiktok\.com\/t\/([A-Za-z0-9]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      console.log('Found TikTok video ID:', match[1]);
      return match[1];
    }
  }
  console.log('No TikTok video ID found');
  return null;
}

function extractVideoId(url: string): string | null {
  console.log('Extracting YouTube video ID from:', url);
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      console.log('Found YouTube video ID:', match[1]);
      return match[1];
    }
  }
  console.log('No YouTube video ID found');
  return null;
}

async function getYouTubeTranscript(videoId: string): Promise<string> {
  try {
    console.log('Attempting to get YouTube transcript for:', videoId);
    
    // Try multiple approaches to get transcript
    
    // Method 1: Try to get transcript from YouTube's transcript API
    try {
      const apiUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=json3`;
      console.log('Trying API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      console.log('API Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API response received, processing events');
        
        if (data.events && data.events.length > 0) {
          const transcript = data.events
            .filter((event: any) => event.segs)
            .map((event: any) => 
              event.segs.map((seg: any) => seg.utf8).join('')
            )
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          console.log('Transcript extracted via API, length:', transcript.length);
          if (transcript.length > 50) {
            return transcript;
          }
        }
      }
    } catch (apiError) {
      console.log('API method failed:', apiError.message);
    }
    
    // Method 2: Fallback - scrape from video page
    console.log('Trying fallback method - scraping from video page');
    return await scrapeFromVideoPage(videoId);
    
  } catch (error) {
    console.error('Error in getYouTubeTranscript:', error);
    throw new Error('Unable to extract transcript from this video. The video may not have captions available.');
  }
}

async function scrapeFromVideoPage(videoId: string): Promise<string> {
  try {
    console.log('Scraping from video page for:', videoId);
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch video page: ${response.status}`);
    }
    
    const html = await response.text();
    console.log('Got video page HTML, searching for captions');
    
    // Look for transcript data in the page HTML
    const transcriptMatch = html.match(/"captions":\s*\{"playerCaptionsTracklistRenderer":\s*\{"captionTracks":\s*\[([^\]]+)\]/);
    
    if (transcriptMatch) {
      console.log('Found caption data, processing...');
      try {
        // Extract and process caption data
        const captionDataStr = '[' + transcriptMatch[1] + ']';
        const captionData = JSON.parse(captionDataStr);
        
        if (captionData.length > 0) {
          const transcriptUrl = captionData[0].baseUrl;
          console.log('Fetching transcript from:', transcriptUrl);
          
          const transcriptResponse = await fetch(transcriptUrl);
          if (!transcriptResponse.ok) {
            throw new Error(`Failed to fetch transcript: ${transcriptResponse.status}`);
          }
          
          const transcriptXml = await transcriptResponse.text();
          console.log('Got transcript XML, parsing...');
          
          // Parse XML and extract text
          const textMatches = transcriptXml.match(/<text[^>]*>([^<]+)<\/text>/g);
          if (textMatches && textMatches.length > 0) {
            const transcript = textMatches
              .map(match => {
                const textContent = match.replace(/<text[^>]*>/, '').replace(/<\/text>/, '');
                return textContent
                  .replace(/&amp;/g, '&')
                  .replace(/&lt;/g, '<')
                  .replace(/&gt;/g, '>')
                  .replace(/&quot;/g, '"')
                  .replace(/&#39;/g, "'");
              })
              .join(' ')
              .replace(/\s+/g, ' ')
              .trim();
            
            console.log('Successfully parsed transcript, length:', transcript.length);
            if (transcript.length > 50) {
              return transcript;
            }
          }
        }
      } catch (parseError) {
        console.error('Error parsing caption data:', parseError);
      }
    }
    
    console.log('No captions found in video page');
    throw new Error('No transcript found');
  } catch (error) {
    console.error('Error in scrapeFromVideoPage:', error);
    throw new Error('Unable to scrape transcript from video page');
  }
}
