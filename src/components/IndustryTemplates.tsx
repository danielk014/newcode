
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Dumbbell, GraduationCap, Smartphone, Copy, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Template {
  id: string;
  title: string;
  industry: string;
  template_content: string;
  description: string;
  tags: string[];
}

interface IndustryTemplatesProps {
  onTemplateSelect: (content: string, title: string) => void;
}

export const IndustryTemplates: React.FC<IndustryTemplatesProps> = ({ onTemplateSelect }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const { toast } = useToast();

  const industries = [
    { id: 'all', name: 'All Templates', icon: Plus },
    { id: 'business', name: 'Business', icon: Building2 },
    { id: 'fitness', name: 'Fitness', icon: Dumbbell },
    { id: 'education', name: 'Education', icon: GraduationCap },
    { id: 'technology', name: 'Technology', icon: Smartphone },
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('industry_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Loading Error",
        description: "Could not load industry templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = selectedIndustry === 'all' 
    ? templates 
    : templates.filter(t => t.industry === selectedIndustry);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Template copied to clipboard"
    });
  };

  const getIndustryColor = (industry: string) => {
    const colors = {
      business: 'bg-blue-100 text-blue-800',
      fitness: 'bg-green-100 text-green-800',
      education: 'bg-purple-100 text-purple-800',
      technology: 'bg-orange-100 text-orange-800',
    };
    return colors[industry as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading templates...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          Industry-Specific Templates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedIndustry} onValueChange={setSelectedIndustry}>
          <TabsList className="grid w-full grid-cols-5">
            {industries.map((industry) => {
              const Icon = industry.icon;
              return (
                <TabsTrigger key={industry.id} value={industry.id} className="text-xs">
                  <Icon className="w-3 h-3 mr-1" />
                  {industry.name}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="mt-6 space-y-4 max-h-96 overflow-y-auto">
            {filteredTemplates.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No templates found for this industry
              </div>
            ) : (
              filteredTemplates.map((template) => (
                <Card key={template.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-sm">{template.title}</h3>
                          <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                        </div>
                        <Badge className={getIndustryColor(template.industry)}>
                          {template.industry}
                        </Badge>
                      </div>

                      <Textarea
                        value={template.template_content}
                        readOnly
                        className="text-xs h-20 resize-none bg-gray-50"
                      />

                      {template.tags && template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {template.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => onTemplateSelect(template.template_content, template.title)}
                          className="flex-1"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Use Template
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(template.template_content)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};
