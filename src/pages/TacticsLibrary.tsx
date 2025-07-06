
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ArrowLeft, Brain, Target, Heart, Crown, Clock, Users, MessageSquare } from 'lucide-react';
import { Link, useSearchParams, useLocation, useNavigate } from 'react-router-dom';

interface Tactic {
  name: string;
  category: string;
  description: string;
  explanation: string;
  whenToUse: string;
  examples: string[];
  psychology: string;
}

const tacticData: Tactic[] = [
  {
    name: "Information Gap Hook",
    category: "Hook",
    description: "Creates curiosity by revealing partial information that viewers must stay to learn",
    explanation: "This tactic leverages the human brain's natural desire to close information gaps. When we're presented with incomplete information, our brains create tension that can only be resolved by learning the missing piece.",
    whenToUse: "Use at the beginning of videos or before revealing important information. Perfect for intros, before case studies, or when transitioning to key points.",
    examples: [
      "What I'm about to show you will change everything...",
      "The secret that 99% of people don't know...",
      "By the end of this video, you'll understand why..."
    ],
    psychology: "Based on the 'curiosity gap' principle from psychology - humans have an innate drive to seek information and close knowledge gaps."
  },
  {
    name: "Pattern Interrupt",
    category: "Retention",
    description: "Sudden changes in tone, pace, or topic to reset viewer attention",
    explanation: "Our brains are prediction machines. When patterns are suddenly broken, it forces the brain to refocus and pay attention. This prevents viewers from zoning out or clicking away.",
    whenToUse: "Use every 30-60 seconds when you notice energy dropping, during long explanations, or when transitioning between topics.",
    examples: [
      "But wait, it gets worse...",
      "Now here's the crazy part...",
      "Actually, forget everything I just said..."
    ],
    psychology: "Exploits the brain's pattern recognition system and attention mechanisms to maintain focus and engagement."
  },
  {
    name: "Bold Statement Hook",
    category: "Hook", 
    description: "Make a controversial or surprising statement that demands attention",
    explanation: "Bold statements trigger our brain's threat detection system and social curiosity. They create immediate emotional arousal and force viewers to evaluate the claim.",
    whenToUse: "Use as video openers, when making counterintuitive points, or to challenge common beliefs in your niche.",
    examples: [
      "Everything you know about [topic] is wrong",
      "I'm about to destroy a $10 billion industry",
      "This will be illegal in 6 months"
    ],
    psychology: "Activates the amygdala (emotional center) and creates cognitive dissonance that must be resolved through continued viewing."
  },
  {
    name: "Micro-Hook Escalation",
    category: "Retention",
    description: "Use escalating phrases every 15-30 seconds to maintain attention",
    explanation: "Constant micro-hooks prevent attention decay by continuously promising that something even better is coming next.",
    whenToUse: "Throughout the entire video, especially during explanations or when presenting multiple points.",
    examples: [
      "But that's not even the best part...",
      "It gets even crazier...",
      "You won't believe what happened next..."
    ],
    psychology: "Exploits variable ratio reinforcement schedules - the same principle that makes gambling addictive."
  },
  {
    name: "Promise Reinforcement",
    category: "Retention",
    description: "Remind viewers of the payoff they'll receive if they keep watching",
    explanation: "Regular reminders of the promised value help viewers justify their time investment and resist the urge to leave.",
    whenToUse: "Every 60-90 seconds, before long explanations, and when transitioning between sections.",
    examples: [
      "Remember, by the end you'll know exactly how to...",
      "This next part is crucial for your success...",
      "Pay attention because this could change your life..."
    ],
    psychology: "Uses commitment and consistency principles - people want to follow through on their initial decision to watch."
  },
  {
    name: "Dream Selling",
    category: "Emotional",
    description: "Paint a picture of the desired outcome to motivate continued watching",
    explanation: "Vivid descriptions of desired futures activate the brain's reward system and create emotional investment in the content.",
    whenToUse: "When presenting solutions, during motivational sections, or before calls-to-action.",
    examples: [
      "Imagine waking up to $1000 in your bank account...",
      "Picture yourself finally being free from...",
      "Visualize having the confidence to..."
    ],
    psychology: "Activates the prefrontal cortex's planning centers and dopamine reward pathways."
  },
  {
    name: "Financial Freedom Appeal",
    category: "Emotional",
    description: "Tap into desires for financial independence and wealth",
    explanation: "Financial security is a fundamental human need. This tactic triggers deep survival instincts and aspirational desires.",
    whenToUse: "In business/entrepreneurship content, when discussing money-making opportunities, or addressing financial stress.",
    examples: [
      "Never worry about money again...",
      "Fire your boss and work for yourself...",
      "Build passive income streams that work while you sleep..."
    ],
    psychology: "Targets Maslow's hierarchy of needs - security and self-actualization levels."
  },
  {
    name: "Authority Establishment",
    category: "Authority",
    description: "Demonstrate expertise and credibility to build trust",
    explanation: "Humans naturally follow authority figures. Establishing expertise makes viewers more likely to accept information and take action.",
    whenToUse: "Early in videos, before making claims, when giving advice, or before calls-to-action.",
    examples: [
      "After helping 10,000+ students...",
      "In my 15 years of experience...",
      "This strategy made me $2 million..."
    ],
    psychology: "Leverages the authority principle from Cialdini's influence psychology."
  },
  {
    name: "Social Proof",
    category: "Social",
    description: "Show that others have succeeded or taken the same action",
    explanation: "Humans are social creatures who look to others for behavioral cues. Social proof reduces risk perception and increases action likelihood.",
    whenToUse: "Before calls-to-action, when presenting strategies, or to overcome objections.",
    examples: [
      "Over 50,000 people have used this method...",
      "My student Sarah made $10k using this...",
      "Thousands of comments say this changed their lives..."
    ],
    psychology: "Based on social proof principle - we determine correct behavior by looking at what others do."
  },
  {
    name: "Scarcity Creation",
    category: "Scarcity",
    description: "Create urgency through limited time or availability",
    explanation: "Scarcity triggers loss aversion - the fear of missing out is stronger than the desire to gain. This creates immediate action pressure.",
    whenToUse: "In calls-to-action, when presenting offers, or to encourage immediate engagement.",
    examples: [
      "Only available for the next 24 hours...",
      "I'm only sharing this with 100 people...",
      "This opportunity won't last forever..."
    ],
    psychology: "Exploits loss aversion bias - losses feel twice as powerful as equivalent gains."
  },
  {
    name: "Future Pacing",
    category: "Retention",
    description: "Create anticipation for upcoming valuable content",
    explanation: "Future pacing maintains engagement by continuously building anticipation for what's coming next in the video.",
    whenToUse: "Throughout videos to maintain retention, before breaks, and when setting up multiple points.",
    examples: [
      "In 3 minutes, I'll show you...",
      "Coming up next, the secret to...",
      "Stick around because at the end..."
    ],
    psychology: "Uses anticipation and dopamine release cycles to maintain attention and interest."
  },
  {
    name: "Pain Point Amplification",
    category: "Emotional",
    description: "Intensify awareness of problems to increase solution desire",
    explanation: "By making problems feel more urgent and painful, viewers become more motivated to seek and accept solutions.",
    whenToUse: "Before presenting solutions, in problem-focused content, or when addressing common struggles.",
    examples: [
      "Every day you wait, you're losing money...",
      "This problem is only getting worse...",
      "Most people suffer with this their entire lives..."
    ],
    psychology: "Leverages loss aversion and pain avoidance motivations that drive human behavior."
  },
  {
    name: "Story Loop Opening",
    category: "Hook",
    description: "Start a compelling story but don't finish it until later in the content",
    explanation: "Open story loops create psychological tension that keeps viewers engaged until the story is resolved. The brain craves closure and will stay engaged to get it.",
    whenToUse: "At the beginning of content, when introducing case studies, or when you need to maintain attention across long sections.",
    examples: [
      "Three months ago, I was broke. By the end of this video, I'll show you exactly how I changed that...",
      "My client was about to lose everything until she discovered this one thing...",
      "I almost gave up on my business until this happened..."
    ],
    psychology: "Exploits the Zeigarnik Effect - our tendency to remember uncompleted tasks better than completed ones."
  },
  {
    name: "Controversy Creation",
    category: "Hook",
    description: "Present an opposing or unpopular viewpoint to generate strong reactions",
    explanation: "Controversial statements trigger emotional responses and force engagement. Even negative emotions can increase retention and sharing.",
    whenToUse: "When your audience holds strong conventional beliefs, to differentiate from competitors, or to create viral potential.",
    examples: [
      "Everyone tells you to follow your passion - that's terrible advice",
      "The fitness industry has been lying to you about weight loss",
      "College is the biggest scam in America"
    ],
    psychology: "Activates fight-or-flight responses and cognitive dissonance, making content memorable and shareable."
  },
  {
    name: "Reciprocity Trigger",
    category: "Persuasion",
    description: "Give value first to create an obligation for the viewer to reciprocate",
    explanation: "When someone receives something of value, they feel psychologically obligated to give something back. This increases compliance with requests.",
    whenToUse: "Before asking for engagement, subscriptions, or purchases. Also effective in building long-term loyalty.",
    examples: [
      "I'm giving you my $500 course for free because I want to help you succeed",
      "Here's my personal phone number - text me if you need help",
      "I'll personally review your business plan if you comment below"
    ],
    psychology: "Based on the reciprocity principle - one of the most powerful psychological drivers of human behavior."
  },
  {
    name: "Bandwagon Effect",
    category: "Social",
    description: "Show that a large group is already taking the desired action",
    explanation: "People naturally want to be part of the winning team or popular choice. This reduces perceived risk and increases action probability.",
    whenToUse: "When you have significant user numbers, trending topics, or when launching new initiatives.",
    examples: [
      "Join 100,000+ entrepreneurs who've already transformed their business",
      "This method is going viral - everyone's talking about it",
      "Be part of the movement that's changing the industry"
    ],
    psychology: "Leverages herding behavior and social validation needs inherent in human psychology."
  },
  {
    name: "Urgency Stacking",
    category: "Scarcity",
    description: "Layer multiple time-sensitive elements to maximize immediate action",
    explanation: "Multiple urgent factors create compounding pressure that makes inaction feel increasingly costly with each passing moment.",
    whenToUse: "In sales situations, limited-time offers, or when you need immediate engagement rather than delayed action.",
    examples: [
      "Price goes up in 24 hours, only 50 spots left, and registration closes Friday",
      "Market conditions are changing fast, and my calendar is filling up this week",
      "This opportunity expires soon, and I can only help the first 100 people"
    ],
    psychology: "Combines multiple scarcity triggers to overwhelm analytical thinking and promote emotional decision-making."
  },
  {
    name: "Vulnerability Sharing",
    category: "Emotional",
    description: "Share personal struggles or failures to build trust and connection",
    explanation: "Vulnerability creates authentic connection and makes the speaker more relatable. It lowers psychological barriers and increases trust.",
    whenToUse: "When building rapport, before making big claims, or when your audience seems skeptical or distant.",
    examples: [
      "I failed at this 7 times before I figured it out",
      "I was embarrassed to admit I was struggling with this",
      "Here's the mistake that cost me $50,000..."
    ],
    psychology: "Triggers empathy responses and the fundamental attribution error - we relate more to vulnerable people."
  },
  {
    name: "Curiosity Gap Widening",
    category: "Hook",
    description: "Progressively reveal information while maintaining mystery about the core revelation",
    explanation: "By giving partial information and then pausing, you create an information gap that the brain desperately wants to fill.",
    whenToUse: "Throughout content to maintain engagement, especially during transitions or before breaks in longer content.",
    examples: [
      "The third secret is the most powerful, but first you need to understand...",
      "What happened next shocked even me, but let me set the stage...",
      "This single word changed everything, and I'll reveal it in just a moment..."
    ],
    psychology: "Exploits the brain's prediction error system and our natural drive to complete patterns and fill knowledge gaps."
  },
  {
    name: "Step-by-Step Blueprint",
    category: "Retention",
    description: "Presents actionable frameworks for predictable outcomes",
    explanation: "Breaking down complex processes into clear, sequential steps makes content feel more valuable and actionable. This tactic keeps viewers engaged by providing a clear roadmap they can follow, creating a sense of progress and achievement.",
    whenToUse: "When teaching complex concepts, presenting strategies, or guiding viewers through processes. Perfect for educational content and how-to videos.",
    examples: [
      "Here's my exact 5-step framework that generated $100k...",
      "Follow this blueprint and you'll see results in 30 days...",
      "Step 1: Do this first, Step 2: Then this, Step 3: Finally this..."
    ],
    psychology: "Leverages the brain's preference for structured information and the satisfaction derived from completing sequential tasks. Reduces cognitive load by breaking complexity into manageable chunks."
  },
  {
    name: "Call to Action",
    category: "Monetization",
    description: "Directs viewers to newsletters, software, or submission forms promising further secrets or access",
    explanation: "Strategic calls-to-action that create a bridge between your content and deeper engagement. This tactic transforms passive viewers into active participants by offering exclusive value in exchange for their commitment.",
    whenToUse: "At the end of videos, during natural transition points, or when introducing premium content. Most effective when the CTA directly relates to the value just provided.",
    examples: [
      "Join my newsletter for the advanced strategies I can't share on YouTube...",
      "Download my free checklist that breaks this down step-by-step...",
      "Apply for my program if you're ready to take this seriously..."
    ],
    psychology: "Leverages the principle of reciprocity and the desire for exclusive access. Creates a sense of progression and community membership."
  },
  
  // Additional Synthesized Tactics
  {
    name: "Climax First",
    category: "Hook",
    description: "Start with the most interesting moment or end result to grab immediate attention",
    explanation: "This tactic immediately captures attention by presenting the most compelling outcome upfront, creating instant investment in the story or process that led to that result.",
    whenToUse: "At the very beginning of content, especially for case studies, transformation stories, or dramatic reveals.",
    examples: [
      "This is the moment everything changed",
      "Look at this result first - then I'll show you how I got here",
      "Here's what happened after I made this one decision..."
    ],
    psychology: "Exploits the brain's reward prediction system by immediately showing the payoff, creating curiosity about the journey."
  },
  {
    name: "Status Improvement",
    category: "Emotional",
    description: "Appeal to desires for social status and recognition",
    explanation: "This tactic targets the fundamental human desire to improve social standing and gain recognition from peers, motivating action through status enhancement.",
    whenToUse: "When targeting ambitious individuals, entrepreneurs, or anyone seeking professional advancement.",
    examples: [
      "Become the expert everyone turns to",
      "Build your influence and command respect",
      "Get the recognition you deserve in your field"
    ],
    psychology: "Targets status-seeking behavior rooted in evolutionary psychology and social hierarchy needs."
  },
  {
    name: "Engagement Bait",
    category: "Algorithm",
    description: "Strategically request specific engagement actions to boost algorithm performance",
    explanation: "Carefully crafted requests for specific viewer actions that signal engagement to platform algorithms while providing genuine value to the audience.",
    whenToUse: "Throughout content and especially at the end to maximize algorithm visibility and reach.",
    examples: [
      "Comment your biggest takeaway below",
      "Share this with someone who needs to see it",
      "Save this for later - you'll thank me"
    ],
    psychology: "Leverages reciprocity and community participation while gaming platform algorithms."
  },
  {
    name: "Watch Time Optimization",
    category: "Algorithm",
    description: "Structure content to maximize average view duration",
    explanation: "Strategic content structuring that keeps viewers engaged longer, satisfying platform algorithms that reward higher watch time percentages.",
    whenToUse: "Throughout content structure planning, especially for longer-form content.",
    examples: [
      "More on that in just a minute",
      "Before I reveal this secret, you need to understand...",
      "First, let me show you why this matters"
    ],
    psychology: "Uses anticipation loops and information sequencing to maintain engagement and prevent drop-off."
  },
  {
    name: "Platform Collaboration",
    category: "Algorithm",
    description: "Create content that aligns with platform algorithm preferences",
    explanation: "Tailoring content format, timing, and style to work with rather than against platform algorithms, maximizing organic reach and engagement.",
    whenToUse: "During content planning and creation phases, adapting to current platform trends and algorithm changes.",
    examples: [
      "Incorporating trending audio or hashtags",
      "Using platform-specific formatting and features",
      "Timing content release for optimal algorithm performance"
    ],
    psychology: "Works with platform psychology and user behavior patterns rather than fighting against them."
  },
  {
    name: "Soft-Sell Integration",
    category: "Monetization",
    description: "Naturally integrate paid offerings without being salesy",
    explanation: "Seamlessly weaving promotional content into valuable information, making sales feel like natural recommendations rather than pushy advertising.",
    whenToUse: "When transitioning from free value to paid offerings, maintaining trust while monetizing content.",
    examples: [
      "Like my student Sarah who used this exact method...",
      "In my advanced course, I dive deeper into this strategy...",
      "I created a free checklist to help you implement this"
    ],
    psychology: "Maintains trust and rapport while introducing commercial elements through social proof and value-first approaches."
  },
  {
    name: "Success Story Leverage",
    category: "Monetization",
    description: "Use student/client success stories to demonstrate value and credibility",
    explanation: "Strategic use of real success stories from clients or students to build credibility and demonstrate the effectiveness of methods or products being promoted.",
    whenToUse: "Before making offers, when establishing credibility, or when overcoming objections about effectiveness.",
    examples: [
      "Sarah made $10k in her first month using this method",
      "My student went from zero to six figures in 12 months",
      "Here's what happened when Tom applied this strategy"
    ],
    psychology: "Combines social proof with aspirational modeling, making success feel achievable and real."
  },
  {
    name: "Competition Format",
    category: "Narrative",
    description: "Use competition-based structures proven since ancient times",
    explanation: "Leveraging humanity's deep fascination with competition and contests, creating engaging content around challenges, battles, or competitive scenarios.",
    whenToUse: "For comparison content, challenge videos, or any situation where you can create a 'versus' dynamic.",
    examples: [
      "Who will win this ultimate challenge?",
      "The battle between these two methods",
      "I'm putting these strategies head-to-head"
    ],
    psychology: "Taps into primal competitive instincts and the human love of games and contests that dates back to ancient civilizations."
  },
  {
    name: "Transformation Arc",
    category: "Narrative",
    description: "Show clear before/after journey that viewers can relate to",
    explanation: "Present a complete transformation story with clear beginning, struggle, breakthrough, and end state that viewers can see themselves achieving.",
    whenToUse: "For case studies, personal stories, or when demonstrating the potential outcomes of following your advice.",
    examples: [
      "From broke college student to millionaire entrepreneur",
      "How I went from anxious introvert to confident speaker",
      "The complete transformation from zero to hero"
    ],
    psychology: "Leverages the hero's journey narrative structure deeply embedded in human storytelling and psychology."
  },
  {
    name: "Problem-Solution Bridge",
    category: "Narrative",
    description: "Create relatable problems then provide clear solutions",
    explanation: "Systematically identify problems your audience faces, amplify their significance, then present your solution as the bridge to their desired outcome.",
    whenToUse: "When introducing new concepts, selling products, or establishing your expertise in solving specific problems.",
    examples: [
      "Here's the problem everyone faces but nobody talks about",
      "The solution is simpler than you think",
      "This one thing fixes everything"
    ],
    psychology: "Uses problem-solution cognitive frameworks that mirror how humans naturally process challenges and seek resolution."
  },
  {
    name: "Open Loops",
    category: "Narrative",
    description: "Start stories without immediate resolution to maintain attention",
    explanation: "Creating narrative tension by beginning stories, making promises, or raising questions without immediate resolution, keeping viewers engaged until the loop is closed.",
    whenToUse: "Throughout longer content to maintain retention, especially when transitioning between topics or taking breaks.",
    examples: [
      "I'll tell you how I discovered this secret in just a moment",
      "More on that incredible result later",
      "The shocking twist comes at the end of this story"
    ],
    psychology: "Exploits the Zeigarnik Effect - the brain's tendency to remember incomplete tasks better than completed ones."
  },
  {
    name: "Direct Address",
    category: "Engagement",
    description: "Speak directly to viewer creating personal connection",
    explanation: "Using direct, personal language that makes each viewer feel like you're speaking specifically to them, creating intimacy and personal investment in the content.",
    whenToUse: "Throughout content to maintain connection, especially when giving advice or making important points.",
    examples: [
      "You've probably experienced this exact situation",
      "Here's what you need to know right now",
      "I'm talking directly to you if you've ever felt..."
    ],
    psychology: "Creates parasocial relationships and personal investment by breaking down the barrier between creator and viewer."
  },
  
  // Advanced Psychological Tactics
  {
    name: "Loss Aversion",
    category: "Emotional",
    description: "Emphasize what viewers will lose by not taking action",
    explanation: "This tactic leverages the psychological principle that losses feel twice as powerful as equivalent gains. By focusing on what people will lose rather than what they'll gain, it creates stronger motivation to act.",
    whenToUse: "Before calls-to-action, when overcoming hesitation, or when creating urgency around decision-making.",
    examples: [
      "Every day you wait, you're losing money to competitors",
      "While you hesitate, opportunities are passing you by",
      "Don't let this chance slip away - you'll regret it later"
    ],
    psychology: "Exploits loss aversion bias - the tendency for losses to feel psychologically more significant than equivalent gains."
  },
  {
    name: "Anchoring Bias",
    category: "Persuasion",
    description: "Set a high reference point to make your offer seem reasonable",
    explanation: "By presenting a high initial value or price point, you anchor expectations high, making your actual offer appear more reasonable and valuable by comparison.",
    whenToUse: "Before revealing prices, when presenting value propositions, or when comparing options.",
    examples: [
      "This normally costs $2000, but today only $297",
      "Most consultants charge $500/hour, I'm giving this away free",
      "While others spend years learning this, you'll master it in weeks"
    ],
    psychology: "Leverages anchoring bias - the tendency to rely heavily on the first piece of information encountered when making decisions."
  },
  {
    name: "Commitment Consistency",
    category: "Persuasion",
    description: "Get small commitments that lead to bigger ones",
    explanation: "People have a strong desire to appear consistent with their previous commitments. By securing small agreements first, you make larger commitments more likely.",
    whenToUse: "When building toward a major request, getting buy-in for concepts, or creating progressive engagement.",
    examples: [
      "If you agree that success requires action, then you'll love this next part",
      "Since you've already invested time watching this, why not take the next step?",
      "You said you wanted to change your life - here's how to start"
    ],
    psychology: "Based on commitment and consistency principle - people strive to be consistent with their previous commitments and stated beliefs."
  },
  {
    name: "Fear of Missing Out (FOMO)",
    category: "Emotional",
    description: "Tap into fear of being left behind socially or professionally",
    explanation: "FOMO creates anxiety about missing rewarding experiences others are having, driving people to take action to avoid being excluded or left behind.",
    whenToUse: "When highlighting trends, showing social proof, or creating urgency around opportunities.",
    examples: [
      "Everyone in your industry is already doing this",
      "Don't be the last person to discover this breakthrough",
      "While you're thinking about it, others are already succeeding"
    ],
    psychology: "Exploits social comparison theory and the fear of regret, particularly strong in social media age."
  },
  {
    name: "Nostalgia Hook",
    category: "Emotional",
    description: "Connect with positive memories to create emotional investment",
    explanation: "Nostalgia creates positive emotions and makes people more open to messaging. It builds connection through shared cultural references and fond memories.",
    whenToUse: "When building rapport, creating emotional connection, or contrasting past with present solutions.",
    examples: [
      "Remember when business was simpler? Here's how to get back to that",
      "This takes me back to when I first started - full of hope and dreams",
      "Just like the good old days, but with modern advantages"
    ],
    psychology: "Triggers positive emotional states associated with memory, making people more receptive and connected."
  },
  {
    name: "Contrast Principle",
    category: "Hook",
    description: "Show dramatic before/after differences to highlight transformation",
    explanation: "Dramatic contrasts make changes appear more significant and desirable. The human brain is wired to notice differences, making contrasts particularly compelling.",
    whenToUse: "When presenting transformations, showing results, or highlighting the gap between current and desired states.",
    examples: [
      "From zero to millionaire in 12 months - here's exactly how",
      "The stark difference between struggling entrepreneurs and thriving ones",
      "What separates those who succeed from those who never make it"
    ],
    psychology: "Leverages the brain's pattern recognition and contrast detection systems to make differences appear more dramatic."
  },
  {
    name: "Halo Effect",
    category: "Authority",
    description: "Use one impressive achievement to elevate everything else",
    explanation: "When people perceive you as excellent in one area, they tend to assume you're excellent in related areas. One strong credential can enhance your entire reputation.",
    whenToUse: "When establishing credibility, introducing yourself, or before making expert claims.",
    examples: [
      "As someone who built a $10M company, let me share what I've learned about marketing",
      "After being featured in Forbes, I discovered this secret most people miss",
      "Having spoken at Harvard Business School, here's my take on leadership"
    ],
    psychology: "Exploits the halo effect - the tendency for positive impressions in one area to influence opinions in other areas."
  },
  {
    name: "Repetition Effect",
    category: "Retention",
    description: "Repeat key messages to increase believability and memory",
    explanation: "Repetition increases both recall and believability. The more people hear something, the more likely they are to remember it and believe it's true.",
    whenToUse: "For key messages, important concepts, or when you need to reinforce critical points throughout content.",
    examples: [
      "This is important - really, really important - so I'm going to say it again",
      "Remember this principle, because this principle changes everything",
      "I'll repeat this because it bears repeating: consistency beats perfection"
    ],
    psychology: "Based on the mere exposure effect and repetition bias - repeated exposure increases both familiarity and perceived truth."
  },
  {
    name: "Exclusive Access",
    category: "Persuasion",
    description: "Make viewers feel specially chosen or privileged",
    explanation: "Exclusivity creates a sense of special status and privilege. People value things more when they feel they have unique access to them.",
    whenToUse: "When delivering valuable content, making offers, or building loyalty with your audience.",
    examples: [
      "I'm only sharing this insider information with my subscribers",
      "This is behind-the-scenes access most people never get",
      "You're getting VIP treatment with this exclusive reveal"
    ],
    psychology: "Leverages the need for uniqueness and status, making people feel special and valued."
  },
  {
    name: "Behind the Scenes",
    category: "Engagement",
    description: "Show the process, struggles, and journey behind success",
    explanation: "Behind-the-scenes content satisfies curiosity and creates authenticity. People are naturally drawn to seeing how things really work and the real story behind success.",
    whenToUse: "When building authenticity, showing your process, or making your success more relatable and achievable.",
    examples: [
      "Here's what really happened behind closed doors during my biggest deal",
      "Let me pull back the curtain on how this industry actually works",
      "The untold story of the failures that led to this breakthrough"
    ],
    psychology: "Satisfies natural curiosity and creates authenticity through transparency, building trust and connection."
  },
  {
    name: "Trend Riding",
    category: "Algorithm",
    description: "Capitalize on current trends and viral topics for increased reach",
    explanation: "Connecting your content to trending topics leverages existing interest and algorithm preferences, dramatically increasing potential reach and engagement.",
    whenToUse: "When current events relate to your message, during viral moments, or when trending topics align with your expertise.",
    examples: [
      "Everyone's talking about this AI trend, but here's what they're missing about business",
      "This viral TikTok dance teaches us something important about marketing",
      "Why this trending news story matters for your financial future"
    ],
    psychology: "Leverages recency bias and social proof - people are more interested in current, trending topics that others are discussing."
  },
  {
    name: "Community Building",
    category: "Engagement",
    description: "Create sense of belonging and shared identity among viewers",
    explanation: "Humans have a fundamental need to belong. By creating a sense of community and shared identity, you increase loyalty and engagement while making people feel part of something bigger.",
    whenToUse: "When building long-term relationships, creating loyal followings, or encouraging ongoing engagement.",
    examples: [
      "Welcome to our community of ambitious entrepreneurs who refuse to settle",
      "You're now part of an exclusive group of people who understand this secret",
      "Join thousands of action-takers who are already transforming their lives"
    ],
    psychology: "Fulfills the fundamental human need for belonging and social connection, creating stronger emotional bonds."
  },
  {
    name: "Expert Endorsement",
    category: "Authority",
    description: "Leverage third-party credibility and expert recommendations",
    explanation: "Third-party endorsements are more credible than self-promotion. When recognized experts vouch for you or your methods, it dramatically increases trust and authority.",
    whenToUse: "When establishing credibility, overcoming skepticism, or when you have legitimate expert backing.",
    examples: [
      "As recommended by three Nobel Prize winners in economics",
      "Top industry leaders agree this is the future of marketing",
      "Even my biggest competitors admit this strategy works"
    ],
    psychology: "Leverages authority principle and social proof - people trust expert opinions more than personal claims."
  },
  {
    name: "Reverse Psychology",
    category: "Hook",
    description: "Tell people NOT to do something to increase their desire to do it",
    explanation: "When you tell someone not to do something, it can trigger psychological reactance - the desire to do the opposite of what they're told, especially if they feel their freedom is being restricted.",
    whenToUse: "When you want to increase desire, create intrigue, or filter for serious prospects only.",
    examples: [
      "Don't try this strategy unless you're 100% committed to success",
      "This isn't for everyone - please don't share this video",
      "I almost don't want to tell you this because it's so powerful"
    ],
    psychology: "Triggers psychological reactance - the tendency to want something more when told you can't or shouldn't have it."
  },
  {
    name: "Cliffhanger Technique",
    category: "Retention",
    description: "End sections on suspense to maintain engagement across breaks",
    explanation: "Cliffhangers create open loops that the brain desperately wants to close. This technique maintains attention across transitions and keeps people engaged longer.",
    whenToUse: "Before breaks, when transitioning between topics, or at the end of content to encourage return visits.",
    examples: [
      "But then something completely unexpected happened - I'll tell you what in just a moment",
      "The shocking twist in this story comes right after I explain this key concept",
      "What I discovered next will completely change how you see this industry"
    ],
    psychology: "Exploits the Zeigarnik Effect and creates psychological tension that can only be resolved by continued engagement."
  },
  {
    name: "Metaphor Power",
    category: "Engagement",
    description: "Use powerful comparisons to make complex ideas instantly understandable",
    explanation: "Metaphors help people understand new concepts by relating them to familiar experiences. They make abstract ideas concrete and memorable.",
    whenToUse: "When explaining complex concepts, making ideas stick, or helping people visualize abstract processes.",
    examples: [
      "Building a business is like constructing a house - you need a solid foundation",
      "This marketing strategy is your secret weapon in the battle for attention",
      "Think of your email list as a garden that needs daily nurturing"
    ],
    psychology: "Leverages analogical reasoning and makes new information easier to process by connecting to existing knowledge."
  },
  {
    name: "Personal Revelation",
    category: "Emotional",
    description: "Share intimate details to create deep emotional connection",
    explanation: "Personal revelations create intimacy and trust by showing vulnerability. When you share something deeply personal, people feel closer to you and more invested in your story.",
    whenToUse: "When building deep connection, establishing trust, or making yourself more relatable and human.",
    examples: [
      "I've never told anyone this before, but I was actually homeless when I started",
      "This is deeply personal, but I struggled with depression during my biggest success",
      "Here's my most embarrassing business failure that no one knows about"
    ],
    psychology: "Creates intimacy through vulnerability and self-disclosure, triggering reciprocal trust and emotional investment."
  },
  {
    name: "Challenge Framework",
    category: "Engagement",
    description: "Dare the audience to take action or prove something",
    explanation: "Challenges tap into competitive instincts and the desire to prove oneself. They transform passive consumption into active participation.",
    whenToUse: "When encouraging action, creating engagement, or when you want to separate serious people from casual viewers.",
    examples: [
      "I challenge you to implement this strategy for 30 days and prove me wrong",
      "Here's my dare: try to find a flaw in this logic",
      "Most people won't do this simple exercise - will you be different?"
    ],
    psychology: "Appeals to competitive instincts and the need to prove competence, creating stronger motivation than simple requests."
  },
  {
    name: "Newsjacking",
    category: "Hook",
    description: "Comment on current events to gain immediate relevance and attention",
    explanation: "By connecting your message to current events, you tap into existing attention and interest. This makes your content immediately relevant and timely.",
    whenToUse: "When current events relate to your expertise, during major news cycles, or when you can add unique perspective to trending topics.",
    examples: [
      "With everything happening in the economy right now, here's what smart investors are doing",
      "This recent corporate scandal perfectly illustrates the leadership principle I teach",
      "While everyone's focused on this political drama, here's what's really affecting your business"
    ],
    psychology: "Leverages recency bias and current interest, making content feel urgent and immediately relevant."
  }
];

const categoryIcons = {
  Hook: Target,
  Retention: Clock,
  Emotional: Heart,
  Authority: Crown,
  Social: Users,
  Scarcity: Clock,
  Persuasion: Brain,
  Algorithm: Target,
  Monetization: Crown,
  Narrative: MessageSquare,
  Engagement: Users
};

const categoryColors = {
  Hook: "bg-blue-100 text-blue-800",
  Retention: "bg-green-100 text-green-800", 
  Emotional: "bg-red-100 text-red-800",
  Authority: "bg-purple-100 text-purple-800",
  Social: "bg-orange-100 text-orange-800",
  Scarcity: "bg-yellow-100 text-yellow-800",
  Persuasion: "bg-indigo-100 text-indigo-800",
  Algorithm: "bg-cyan-100 text-cyan-800",
  Monetization: "bg-emerald-100 text-emerald-800",
  Narrative: "bg-violet-100 text-violet-800",
  Engagement: "bg-rose-100 text-rose-800"
};

export default function TacticsLibrary() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const focusTactic = searchParams.get('tactic');
  const [openTactics, setOpenTactics] = useState<string[]>([]);
  const tacticRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // Get the origin path and state from navigation state
  const originPath = (location.state as any)?.from || '/';
  const navigationState = location.state as any;

  // Create mapping for common AI-generated tactic names to our library names
  const tacticNameMapping: Record<string, string> = {
    'Expert Authority': 'Authority Establishment', 
    'Social Validation': 'Social Proof',
    'Time Sensitivity': 'Scarcity Creation',
    'Success Stories': 'Social Proof',
    'Problem Agitation': 'Pain Point Amplification',
    'Benefit Stacking': 'Dream Selling',
    'Curiosity Gap': 'Information Gap Hook',
    'Pattern Breaking': 'Pattern Interrupt',
    'Cliffhanger': 'Story Loop Opening',
    'Controversy Hook': 'Controversy Creation',
    'Value First': 'Reciprocity Trigger',
    'Urgency Creation': 'Urgency Stacking',
    'Vulnerable Moment': 'Vulnerability Sharing',
    'Information Withholding': 'Curiosity Gap Widening'
  };

  // Automatically open the focused tactic when the component mounts or when focusTactic changes
  useEffect(() => {
    if (focusTactic) {
      // Decode the URL-encoded tactic name and find matching tactic
      const decodedTacticName = decodeURIComponent(focusTactic);
      console.log('Looking for tactic:', decodedTacticName);
      
      // Try direct match first
      let matchingTactic = tacticData.find(tactic => tactic.name === decodedTacticName);
      
      // If not found, try the mapping
      if (!matchingTactic && tacticNameMapping[decodedTacticName]) {
        const mappedName = tacticNameMapping[decodedTacticName];
        matchingTactic = tacticData.find(tactic => tactic.name === mappedName);
        console.log(`Mapped "${decodedTacticName}" to "${mappedName}"`);
      }
      
      // If still not found, try partial matching
      if (!matchingTactic) {
        matchingTactic = tacticData.find(tactic => 
          tactic.name.toLowerCase().includes(decodedTacticName.toLowerCase()) ||
          decodedTacticName.toLowerCase().includes(tactic.name.toLowerCase()) ||
          // Check if any word in the tactic name matches
          tactic.name.toLowerCase().split(' ').some(word => 
            decodedTacticName.toLowerCase().includes(word) && word.length > 2
          )
        );
      }
      
      if (matchingTactic) {
        console.log('Found matching tactic:', matchingTactic.name);
        setOpenTactics([matchingTactic.name]);
        
        // Scroll to the tactic after it's been opened and rendered
        setTimeout(() => {
          const tacticElement = tacticRefs.current[matchingTactic.name];
          if (tacticElement) {
            console.log('Scrolling to tactic:', matchingTactic.name);
            tacticElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'nearest'
            });
          }
        }, 600); // Wait longer for the collapsible content to fully expand
      } else {
        console.log('No matching tactic found. Available tactics:', tacticData.map(t => t.name));
        console.log('Tried mapping for:', decodedTacticName);
      }
    }
  }, [focusTactic]);

  const toggleTactic = (tacticName: string) => {
    const isCurrentlyOpen = openTactics.includes(tacticName);
    
    setOpenTactics(prev => 
      isCurrentlyOpen 
        ? prev.filter(name => name !== tacticName)
        : [...prev, tacticName]
    );

    // Scroll to tactic after allowing time for opening animation to complete
    if (!isCurrentlyOpen) {
      // Wait for the collapsible animation to fully complete (typically 200ms)
      setTimeout(() => {
        const tacticElement = tacticRefs.current[tacticName];
        if (tacticElement) {
          console.log('Scrolling to clicked tactic:', tacticName);
          tacticElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 500); // Increased delay to ensure collapsible content is fully expanded
    }
  };

  const handleReturn = () => {
    // If we have preserved state (currentStep and analysis), navigate back with full state restoration
    if (navigationState?.currentStep !== undefined && navigationState?.analysis) {
      navigate(originPath, { 
        state: { 
          currentStep: navigationState.currentStep, 
          analysis: navigationState.analysis,
          preserveState: true
        },
        replace: true
      });
    } else {
      // Fallback to simple navigation
      navigate(originPath);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button 
            variant="outline" 
            className="mb-4"
            onClick={handleReturn}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return
          </Button>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Viral Tactics Library
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Deep dive into the psychological tactics that make content viral and persuasive
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {tacticData.map((tactic) => {
            const Icon = categoryIcons[tactic.category as keyof typeof categoryIcons] || Target;
            const isOpen = openTactics.includes(tactic.name);
            const isFocused = focusTactic && decodeURIComponent(focusTactic) === tactic.name;
            
            return (
              <Card 
                key={tactic.name} 
                ref={(el) => tacticRefs.current[tactic.name] = el}
                className={`shadow-lg ${isFocused ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
              >
                <Collapsible open={isOpen} onOpenChange={() => toggleTactic(tactic.name)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="w-6 h-6 text-blue-600" />
                          <div className="text-left">
                            <CardTitle className="text-xl">{tactic.name}</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">{tactic.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={categoryColors[tactic.category as keyof typeof categoryColors]}>
                            {tactic.category}
                          </Badge>
                          <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-2 text-blue-700">Why It Works (Psychology)</h4>
                        <p className="text-gray-700">{tactic.psychology}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2 text-green-700">Full Explanation</h4>
                        <p className="text-gray-700">{tactic.explanation}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2 text-purple-700">When to Use</h4>
                        <p className="text-gray-700">{tactic.whenToUse}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2 text-orange-700">Examples</h4>
                        <ul className="space-y-1">
                          {tactic.examples.map((example, index) => (
                            <li key={index} className="text-gray-700">
                              • "{example}"
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
