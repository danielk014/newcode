import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, WifiOff, RefreshCw } from 'lucide-react';

interface OfflineModeProps {
  onRetry: () => void;
}

export const OfflineMode: React.FC<OfflineModeProps> = ({ onRetry }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <WifiOff className="w-8 h-8 text-orange-600" />
          </div>
          <CardTitle>Connection Issue</CardTitle>
          <CardDescription>
            Unable to connect to the server. This might be due to your VPN or network configuration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Try the following:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Disable your VPN temporarily</li>
                  <li>Check your internet connection</li>
                  <li>Clear your browser cache</li>
                  <li>Try a different browser</li>
                </ul>
              </div>
            </div>
          </div>
          <Button onClick={onRetry} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Connection
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};