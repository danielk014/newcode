
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, Calendar, Hash } from 'lucide-react';

interface RecentScript {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  wordCount: number;
}

interface RecentScriptsProps {
  onLoadScript?: (script: string, title: string) => void;
}

export const RecentScripts: React.FC<RecentScriptsProps> = ({ onLoadScript }) => {
  const [recentScripts, setRecentScripts] = useState<RecentScript[]>([]);

  useEffect(() => {
    loadRecentScripts();
    // Clean up expired scripts every minute
    const interval = setInterval(cleanupExpiredScripts, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadRecentScripts = () => {
    try {
      const stored = localStorage.getItem('recentScripts');
      if (stored) {
        const scripts = JSON.parse(stored) as RecentScript[];
        // Filter out expired scripts (older than 24 hours)
        const validScripts = scripts.filter(script => 
          Date.now() - script.timestamp < 24 * 60 * 60 * 1000
        );
        setRecentScripts(validScripts);
        
        // Update localStorage if we filtered out expired scripts
        if (validScripts.length !== scripts.length) {
          localStorage.setItem('recentScripts', JSON.stringify(validScripts));
        }
      }
    } catch (error) {
      console.error('Error loading recent scripts:', error);
    }
  };

  const cleanupExpiredScripts = () => {
    const now = Date.now();
    const validScripts = recentScripts.filter(script => 
      now - script.timestamp < 24 * 60 * 60 * 1000
    );
    
    if (validScripts.length !== recentScripts.length) {
      setRecentScripts(validScripts);
      localStorage.setItem('recentScripts', JSON.stringify(validScripts));
    }
  };

  const getTimeRemaining = (timestamp: number) => {
    const elapsed = Date.now() - timestamp;
    const remaining = 24 * 60 * 60 * 1000 - elapsed;
    
    if (remaining <= 0) return 'Expired';
    
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }
    return `${minutes}m left`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-600" />
          Recent Scripts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {recentScripts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No recent scripts</p>
              <p className="text-xs mt-1">Generated scripts appear here for 24 hours</p>
            </div>
          ) : (
            recentScripts.map((script) => (
              <Card key={script.id} className="border border-gray-200">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{script.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatTimestamp(script.timestamp)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Hash className="w-3 h-3 mr-1" />
                            {script.wordCount} words
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {getTimeRemaining(script.timestamp)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {onLoadScript && (
                      <Button
                        size="sm"
                        onClick={() => onLoadScript(script.content, script.title)}
                        className="w-full"
                      >
                        Load Script
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Utility function to add script to recent scripts
export const addToRecentScripts = (title: string, content: string) => {
  try {
    const script: RecentScript = {
      id: Date.now().toString(),
      title,
      content,
      timestamp: Date.now(),
      wordCount: content.split(' ').length
    };

    const stored = localStorage.getItem('recentScripts');
    const existing = stored ? JSON.parse(stored) as RecentScript[] : [];
    
    // Add new script to beginning and limit to 10 scripts
    const updated = [script, ...existing].slice(0, 10);
    
    localStorage.setItem('recentScripts', JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving recent script:', error);
  }
};
