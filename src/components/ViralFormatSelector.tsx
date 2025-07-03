import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from 'lucide-react';

interface ViralFormatSelectorProps {
  selectedFormat: string;
  onFormatSelect: (format: string) => void;
}

export const ViralFormatSelector: React.FC<ViralFormatSelectorProps> = ({
  selectedFormat,
  onFormatSelect
}) => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold mb-2">Script Format</h3>
        <p className="text-sm text-gray-600">Choose your preferred script structure</p>
      </div>
      
      <div className="flex justify-center">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md max-w-md ${
            selectedFormat === 'Copy Reference Script Format' ? 'ring-2 ring-primary bg-primary/5' : 'border-gray-200'
          } p-4`}
          onClick={() => onFormatSelect('Copy Reference Script Format')}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-foreground">Copy Reference Script Format</h4>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    92%
                  </Badge>
                  <Badge variant="default" className="bg-primary text-primary-foreground">
                    Recommended
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Use the same structure and style as your provided reference scripts
              </p>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-medium text-foreground">When to Use:</span>
                  <span className="text-muted-foreground ml-1">
                    When you want to replicate the exact format and flow that has already proven successful
                  </span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Best For:</span>
                  <span className="text-muted-foreground ml-1">
                    Script replication, Proven formats
                  </span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Structure:</span>
                  <span className="text-muted-foreground ml-1">
                    Mirror Structure → Copy Hooks → Apply Psychology
                  </span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Examples:</span>
                  <span className="text-muted-foreground ml-1">
                    • Exactly like script #1
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};