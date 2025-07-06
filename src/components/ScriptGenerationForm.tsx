
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wand2 } from 'lucide-react';

interface ScriptGenerationFormProps {
  onGenerate: (inputs: any, tactics: any[]) => Promise<void>;
  isGenerating: boolean;
}

export const ScriptGenerationForm: React.FC<ScriptGenerationFormProps> = ({
  onGenerate,
  isGenerating
}) => {
  const [inputs, setInputs] = useState({
    topic: '',
    audience: '',
    tone: '',
    length: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(inputs, []);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-blue-600" />
          Generate Script
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              placeholder="What's your script about?"
              value={inputs.topic}
              onChange={(e) => setInputs(prev => ({ ...prev, topic: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="audience">Target Audience</Label>
            <Input
              id="audience"
              placeholder="Who is your target audience?"
              value={inputs.audience}
              onChange={(e) => setInputs(prev => ({ ...prev, audience: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="tone">Tone</Label>
            <Input
              id="tone"
              placeholder="Professional, casual, energetic, etc."
              value={inputs.tone}
              onChange={(e) => setInputs(prev => ({ ...prev, tone: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="length">Desired Length</Label>
            <Input
              id="length"
              placeholder="Short, medium, long, or specific duration"
              value={inputs.length}
              onChange={(e) => setInputs(prev => ({ ...prev, length: e.target.value }))}
            />
          </div>
          
          <Button type="submit" disabled={isGenerating} className="w-full">
            <Wand2 className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate Script'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
