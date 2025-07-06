
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target, Brain, Heart, Users, MessageSquare, Clock, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { psychologicalTactics } from '@/utils/tacticAnalyzer';

const Tactics = () => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Hook': return <Target className="w-5 h-5" />;
      case 'Narrative': return <MessageSquare className="w-5 h-5" />;
      case 'Persuasion': return <Brain className="w-5 h-5" />;
      case 'Engagement': return <Users className="w-5 h-5" />;
      case 'Emotional': return <Heart className="w-5 h-5" />;
      case 'Retention': return <Clock className="w-5 h-5" />;
      case 'Algorithm': return <Target className="w-5 h-5" />;
      case 'Monetization': return <Brain className="w-5 h-5" />;
      case 'Authority': return <Crown className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Hook': return 'bg-red-100 text-red-800';
      case 'Narrative': return 'bg-blue-100 text-blue-800';
      case 'Persuasion': return 'bg-purple-100 text-purple-800';
      case 'Engagement': return 'bg-green-100 text-green-800';
      case 'Emotional': return 'bg-orange-100 text-orange-800';
      case 'Retention': return 'bg-indigo-100 text-indigo-800';
      case 'Algorithm': return 'bg-cyan-100 text-cyan-800';
      case 'Monetization': return 'bg-emerald-100 text-emerald-800';
      case 'Authority': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedTactics = psychologicalTactics.reduce((acc, tactic) => {
    if (!acc[tactic.category]) {
      acc[tactic.category] = [];
    }
    acc[tactic.category].push(tactic);
    return acc;
  }, {} as Record<string, typeof psychologicalTactics>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link to="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Script Generator
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Psychological Tactics Library</h1>
          <p className="text-lg text-gray-600">
            Explore the {psychologicalTactics.length} psychological tactics our AI can detect and incorporate into your scripts.
          </p>
        </div>

        <div className="space-y-8">
          {Object.entries(groupedTactics).map(([category, tactics]) => (
            <Card key={category} className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  {getCategoryIcon(category)}
                  {category} Tactics
                  <Badge variant="secondary">{tactics.length} tactics</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tactics.map((tactic, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{tactic.name}</h3>
                          <Badge className={getCategoryColor(tactic.category)}>
                            {tactic.effectiveness}% effective
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-gray-600 mb-4 text-sm">{tactic.description}</p>
                        <div>
                          <h4 className="font-medium text-sm mb-2">Examples:</h4>
                          <ul className="space-y-1">
                            {tactic.examples.map((example, idx) => (
                              <li key={idx} className="text-xs text-gray-500 italic">
                                "{example}"
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Ready to Create Your Script?</h2>
            <p className="mb-4">
              Now that you understand the tactics, let's put them to work in your next viral video script.
            </p>
            <Link to="/">
              <Button variant="secondary" size="lg">
                Start Script Generation
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Tactics;
