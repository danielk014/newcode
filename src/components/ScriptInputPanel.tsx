
import React, { memo } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, AlertTriangle } from 'lucide-react';
// Simple word count functions
const getWordCount = (text: string): number => {
  return text.split(/\s+/).filter(word => word.length > 0).length;
};

const getWordCountStatus = (text: string) => {
  const count = getWordCount(text);
  return {
    count,
    displayText: `${count.toLocaleString()} words`,
    badgeVariant: 'outline',
    badgeClassName: ''
  };
};

interface ScriptInputPanelProps {
  index: number;
  value: string;
  onChange: (value: string) => void;
  onRemove?: () => void;
  canRemove: boolean;
}

export const ScriptInputPanel = memo<ScriptInputPanelProps>(({
  index,
  value,
  onChange,
  onRemove,
  canRemove
}) => {
  const wordStatus = getWordCountStatus(value);
  
  const handleChange = (newValue: string) => {
    if (canProcess(newValue)) {
      onChange(newValue);
    } else {
      // Allow input but warn user
      onChange(newValue);
    }
  };
  
  return (
    <div className={`space-y-2 border rounded-lg p-3 sm:p-4 relative bg-card ${wordStatus.borderClassName}`}>
      {canRemove && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-1 right-1 sm:top-2 sm:right-2 h-6 w-6 p-0 z-10"
          onClick={onRemove}
        >
          <X className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      )}
      <div className="flex items-center justify-between">
        <Label htmlFor={`script${index + 1}`} className="text-xs sm:text-sm font-medium text-foreground">
          Reference Script #{index + 1}
        </Label>
        <div className="flex items-center gap-2">
          {wordStatus.validation.isOverLimit && (
            <AlertTriangle className="w-4 h-4 text-destructive" />
          )}
          <Badge 
            variant={wordStatus.badgeVariant as any}
            className={`text-xs ${wordStatus.badgeClassName}`}
          >
            {wordStatus.displayText}
          </Badge>
        </div>
      </div>
      {wordStatus.validation.errorMessage && (
        <div className="p-2 border border-destructive/20 rounded bg-destructive/5">
          <p className="text-xs text-destructive">
            {wordStatus.validation.errorMessage}
          </p>
        </div>
      )}
      {wordStatus.validation.warningMessage && (
        <div className="p-2 border border-yellow-500/20 rounded bg-yellow-50">
          <p className="text-xs text-yellow-700">
            {wordStatus.validation.warningMessage}
          </p>
        </div>
      )}
      <Textarea
        id={`script${index + 1}`}
        placeholder={`Paste your ${index === 0 ? 'first' : index === 1 ? 'second' : `script #${index + 1}`} high-performing script here...`}
        className={`min-h-[150px] sm:min-h-[200px] resize-none text-xs sm:text-sm ${
          wordStatus.validation.isOverLimit ? 'border-destructive focus:border-destructive' : ''
        }`}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  );
});

ScriptInputPanel.displayName = 'ScriptInputPanel';
