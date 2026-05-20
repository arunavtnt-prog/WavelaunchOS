'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Search, Save, RefreshCw, FileText, Settings } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface PromptCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  prompts: PromptItem[];
}

interface PromptItem {
  key: string;
  name: string;
  description: string;
  content: string;
  isReadonly?: boolean;
}

const CATEGORIES: PromptCategory[] = [
  {
    id: 'base',
    name: 'Base Configuration',
    description: 'Core prompts used across all blueprint stages',
    color: 'bg-blue-500',
    prompts: [
      { key: 'BASE_PROMPT', name: 'Base Prompt', description: 'Primary context for all stages', content: '' },
      { key: 'DATA_INTEGRITY', name: 'Data Integrity Standards', description: 'Research protocol and labeling requirements', content: '' },
      { key: 'OUTPUT_FORMAT', name: 'Output Format', description: 'Standard formatting guidelines', content: '' },
    ],
  },
  {
    id: 'batch1',
    name: 'Batch 1: Market & Competitive',
    description: 'Market sizing, competitive intelligence, and industry trends',
    color: 'bg-purple-500',
    prompts: [
      { key: 'MARKET_SIZING', name: 'Market Sizing (TAM-SAM-SOM)', description: 'Total addressable market analysis', content: '' },
      { key: 'COMPETITIVE_INTELLIGENCE', name: 'Competitive Intelligence', description: 'Competitor landscape analysis', content: '' },
      { key: 'INDUSTRY_TRENDS', name: 'Industry Trends', description: 'Market trends and dynamics', content: '' },
    ],
  },
  {
    id: 'batch2',
    name: 'Batch 2: Audience & Brand',
    description: 'Audience analysis and brand positioning',
    color: 'bg-green-500',
    prompts: [
      { key: 'AUDIENCE_DEEP_DIVE', name: 'Audience Deep Dive', description: 'Target audience persona and psychographics', content: '' },
      { key: 'BRAND_POSITIONING', name: 'Brand Positioning', description: 'Brand identity and differentiation strategy', content: '' },
    ],
  },
  {
    id: 'batch3',
    name: 'Batch 3: Product & Financial',
    description: 'Product architecture and financial projections',
    color: 'bg-orange-500',
    prompts: [
      { key: 'PRODUCT_ARCHITECTURE', name: 'Product Architecture', description: 'Product line and unit economics', content: '' },
      { key: 'FINANCIAL_PROJECTIONS', name: 'Financial Projections', description: '3-year revenue and growth model', content: '' },
    ],
  },
  {
    id: 'batch4',
    name: 'Batch 4: Go-to-Market & Ops',
    description: 'Launch strategy and operational framework',
    color: 'bg-pink-500',
    prompts: [
      { key: 'GO_TO_MARKET', name: 'Go-to-Market Strategy', description: '90-day launch plan and channel strategy', content: '' },
      { key: 'OPERATIONAL_FRAMEWORK', name: 'Operational Framework', description: '8-stage launch process and team structure', content: '' },
      { key: 'IMPLEMENTATION_ROADMAP', name: 'Implementation Roadmap', description: 'Critical path and milestones', content: '' },
    ],
  },
  {
    id: 'batch5',
    name: 'Batch 5: Synthesis & Evaluation',
    description: 'Strategic synthesis and final assessment',
    color: 'bg-cyan-500',
    prompts: [
      { key: 'FOUR_PILLARS_EVALUATION', name: 'Four Pillars Evaluation', description: 'D26 Cohort selection criteria assessment', content: '' },
      { key: 'INVESTMENT_ALLOCATION', name: 'Investment Allocation', description: '$100K-$250K investment breakdown', content: '' },
      { key: 'EXECUTIVE_SUMMARY', name: 'Executive Summary', description: '1-2 page strategic overview', content: '' },
      { key: 'SUCCESS_METRICS', name: 'Success Metrics & KPIs', description: 'Measurable indicators and reporting', content: '' },
    ],
  },
];

export default function PromptsPage() {
  const [categories, setCategories] = useState<PromptCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['base', 'batch1']));
  const [editingPrompt, setEditingPrompt] = useState<{ categoryKey: string; promptKey: string; content: string } | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const fetchPrompts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/workflow/prompts');
      const result = await response.json();

      if (result.success) {
        // Merge prompts into categories
        const updatedCategories = CATEGORIES.map(category => ({
          ...category,
          prompts: category.prompts.map(prompt => ({
            ...prompt,
            content: result.data[prompt.key] || '',
          })),
        }));
        setCategories(updatedCategories);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load prompts',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load prompts',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const savePrompt = async (categoryKey: string, promptKey: string, content: string) => {
    setSavingKey(promptKey);
    try {
      const response = await fetch('/api/workflow/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          key: promptKey,
          content,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Saved',
          description: `${promptKey} updated successfully`,
        });
        await fetchPrompts();
        setEditingPrompt(null);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to save prompt',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save prompt',
        variant: 'destructive',
      });
    } finally {
      setSavingKey(null);
    }
  };

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryKey)) {
        newSet.delete(categoryKey);
      } else {
        newSet.add(categoryKey);
      }
      return newSet;
    });
  };

  const startEditing = (categoryKey: string, promptKey: string, content: string) => {
    setEditingPrompt({ categoryKey, promptKey, content });
  };

  const cancelEditing = () => {
    setEditingPrompt(null);
  };

  const filteredCategories = categories.map(category => ({
    ...category,
    prompts: category.prompts.filter(prompt =>
      prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.key.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.prompts.length > 0);

  useEffect(() => {
    fetchPrompts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Settings className="h-8 w-8" />
            Blueprint Prompts
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage and customize the AI prompts used for blueprint generation
          </p>
        </div>
        <Button onClick={fetchPrompts} variant="outline" size="sm" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Reload
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prompts by name, description, or key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Prompt Categories */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredCategories.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No prompts found matching "{searchQuery}"</p>
            </CardContent>
          </Card>
        ) : (
          filteredCategories.map((category) => (
            <Collapsible
              key={category.id}
              open={expandedCategories.has(category.id)}
              onOpenChange={() => toggleCategory(category.id)}
            >
              <Card>
                <CollapsibleTrigger className="w-full">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-lg ${category.color} flex items-center justify-center`}>
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <CardTitle className="flex items-center gap-3">
                          {category.name}
                          <Badge variant="outline" className="text-xs">
                            {category.prompts.length} prompts
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-1">{category.description}</CardDescription>
                      </div>
                      {expandedCategories.has(category.id) ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-0">
                    {category.prompts.map((prompt) => {
                      const isEditing = editingPrompt?.promptKey === prompt.key;
                      return (
                        <Card key={prompt.key} className="bg-muted/50">
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <CardTitle className="text-base">{prompt.name}</CardTitle>
                                                                  <Badge variant="secondary" className="text-xs font-mono">
                                    {prompt.key}
                                  </Badge>
                                </div>
                                <CardDescription>{prompt.description}</CardDescription>
                              </div>
                              {!isEditing && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => startEditing(category.id, prompt.key, prompt.content)}
                                >
                                  Edit
                                </Button>
                              )}
                            </div>
                          </CardHeader>

                          {isEditing ? (
                            <CardContent className="space-y-3">
                              <Textarea
                                value={editingPrompt.content}
                                onChange={(e) => setEditingPrompt({ ...editingPrompt, content: e.target.value })}
                                className="min-h-[300px] font-mono text-sm"
                                placeholder="Enter prompt content..."
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={cancelEditing}
                                  disabled={savingKey === prompt.key}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => savePrompt(editingPrompt.categoryKey, editingPrompt.promptKey, editingPrompt.content)}
                                  disabled={savingKey === prompt.key}
                                >
                                  {savingKey === prompt.key ? (
                                    <>
                                                                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                      Saving...
                                                                    </>
                                  ) : (
                                    <>
                                      <Save className="h-4 w-4 mr-2" />
                                      Save Changes
                                                                    </>
                                  )}
                                </Button>
                              </div>
                            </CardContent>
                          ) : (
                            <CardContent>
                              <div className="bg-background rounded-lg p-4 max-h-[200px] overflow-auto">
                                <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">
                                  {prompt.content || <span className="italic">No content set</span>}
                                </pre>
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      );
                    })}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))
        )}
      </div>

      {/* Placeholder Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Placeholder Reference</CardTitle>
          <CardDescription>Available placeholders for prompt interpolation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            {[
              { code: '{{fullName}}', desc: 'Applicant full name' },
              { code: '{{industryNiche}}', desc: 'Industry/Niche' },
              { code: '{{email}}', desc: 'Email address' },
              { code: '{{targetAudience}}', desc: 'Target audience' },
              { code: '{{productCategories}}', desc: 'Product categories' },
              { code: '{{currentChannels}}', desc: 'Current channels' },
              { code: '{{keyPainPoints}}', desc: 'Key pain points' },
              { code: '{{brandValues}}', desc: 'Brand values' },
              { code: '{{differentiation}}', desc: 'Differentiation' },
              { code: '{{uniqueValueProps}}', desc: 'Unique value props' },
              { code: '{{scalingGoals}}', desc: 'Scaling goals' },
              { code: '{{emergingCompetitors}}', desc: 'Emerging competitors' },
            ].map((item) => (
              <div key={item.code} className="flex items-start gap-2 p-2 rounded bg-muted">
                <code className="text-xs font-mono bg-background px-2 py-1 rounded">{item.code}</code>
                <span className="text-muted-foreground text-xs">{item.desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
