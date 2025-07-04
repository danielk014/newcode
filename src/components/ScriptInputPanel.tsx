
import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

interface ScriptInputPanelProps {
  index: number;
  value: string;
  onChange: (value: string) => void;
  onRemove?: () => void;
  canRemove: boolean;
}

export const ScriptInputPanel: React.FC<ScriptInputPanelProps> = ({
  index,
  value,
  onChange,
  onRemove,
  canRemove
}) => {
  return (
    <div className="space-y-2 border border-border rounded-lg p-3 sm:p-4 relative bg-card">
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
      <Label htmlFor={`script${index + 1}`} className="text-xs sm:text-sm font-medium text-foreground">
        Reference Script #{index + 1}
      </Label>
      <Textarea
        id={`script${index + 1}`}
        placeholder={`Paste your ${index === 0 ? 'first' : index === 1 ? 'second' : `script #${index + 1}`} high-performing script here...`}
        className="min-h-[150px] sm:min-h-[200px] resize-none text-xs sm:text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
