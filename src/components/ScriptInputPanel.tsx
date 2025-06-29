
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
    <div className="space-y-2 border rounded-lg p-4 relative">
      {canRemove && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-6 w-6 p-0"
          onClick={onRemove}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
      <Label htmlFor={`script${index + 1}`} className="text-sm font-medium">
        Reference Script #{index + 1}
      </Label>
      <Textarea
        id={`script${index + 1}`}
        placeholder={`Paste your ${index === 0 ? 'first' : index === 1 ? 'second' : `script #${index + 1}`} high-performing script here...`}
        className="min-h-[200px] resize-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
