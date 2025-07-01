
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
    
    // Handle YouTube URLs
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
    
    // Method 1: Try to get transcript from YouTube's timedtext API
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
    
    // Method 2: Extract from video page HTML
    console.log('Trying HTML extraction method');
    return await extractFromVideoPage(videoId);
    
  } catch (error) {
    console.error('Error in getYouTubeTranscript:', error);
    throw new Error('Unable to extract transcript from this video. The video may not have captions available.');
  }
}

async function extractFromVideoPage(videoId: string): Promise<string> {
  try {
    console.log('Extracting transcript from video page for:', videoId);
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch video page: ${response.status}`);
    }
    
    const html = await response.text();
    console.log('Got video page HTML, searching for transcript data');
    
    // Look for transcript data in the page HTML
    const transcriptMatch = html.match(/"captions":\s*\{"playerCaptionsTracklistRenderer":\s*\{"captionTracks":\s*\[([^\]]+)\]/);
    
    if (transcriptMatch) {
      console.log('Found caption data in HTML, processing...');
      try {
        // Extract caption track URL
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
            
            console.log('Successfully parsed transcript from XML, length:', transcript.length);
            if (transcript.length > 50) {
              return transcript;
            }
          }
        }
      } catch (parseError) {
        console.error('Error parsing caption data:', parseError);
      }
    }
    
    // Method 3: Try to find transcript button and extract manually available transcripts
    console.log('Looking for transcript button in HTML');
    const transcriptButtonMatch = html.match(/"transcriptCommand":\s*\{[^}]*"clickTrackingParams":"([^"]+)"/);
    
    if (transcriptButtonMatch) {
      console.log('Found transcript button, but manual extraction needed');
      // For now, we'll throw an error to indicate transcript exists but needs manual extraction
      throw new Error('Transcript is available but requires manual extraction. Please check the video\'s transcript manually.');
    }
    
    console.log('No transcript found in video page');
    throw new Error('No transcript found for this video. The video may not have captions enabled.');
  } catch (error) {
    console.error('Error in extractFromVideoPage:', error);
    throw new Error('Unable to extract transcript from video page: ' + error.message);
  }
}
