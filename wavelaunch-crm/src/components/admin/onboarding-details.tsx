'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Target,
  Users,
  Trophy,
  Palette,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import type { Client } from '@prisma/client'

interface OnboardingDetailsProps {
  client: Client & {
    portalUser?: {
      completedOnboarding: boolean
      onboardingCompletedAt: Date | null
    } | null
  }
}

export function OnboardingDetails({ client }: OnboardingDetailsProps) {
  // Check if client has completed onboarding
  if (!client.portalUser?.completedOnboarding) {
    return null
  }

  const hasData = Boolean(
    client.industryNiche ||
    client.visionForVenture ||
    client.targetAudience
  )

  if (!hasData) {
    return null
  }

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              Onboarding Information
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Completed
              </Badge>
            </CardTitle>
            <CardDescription>
              Completed on {client.portalUser.onboardingCompletedAt ? new Date(client.portalUser.onboardingCompletedAt).toLocaleDateString() : 'N/A'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basics" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basics">
              <Target className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Basics</span>
            </TabsTrigger>
            <TabsTrigger value="audience">
              <Users className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Audience</span>
            </TabsTrigger>
            <TabsTrigger value="value">
              <Trophy className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Value</span>
            </TabsTrigger>
            <TabsTrigger value="brand">
              <Palette className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Brand</span>
            </TabsTrigger>
            <TabsTrigger value="growth">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Growth</span>
            </TabsTrigger>
            <TabsTrigger value="story">
              <BookOpen className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Story</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Business Basics */}
          <TabsContent value="basics" className="space-y-4 mt-4">
            <div className="space-y-3">
              <DetailField label="Business Niche" value={client.industryNiche} />
              <DetailField label="Vision Statement" value={client.visionForVenture} />
            </div>
          </TabsContent>

          {/* Tab 2: Target Audience */}
          <TabsContent value="audience" className="space-y-4 mt-4">
            <div className="space-y-3">
              <DetailField label="Target Audience" value={client.targetAudience} />
              <DetailField label="Target Demographic Age" value={client.targetDemographicAge} />
              <DetailField label="Demographics" value={client.demographicProfile} />
              <DetailField label="Audience Gender Split" value={client.audienceGenderSplit} />
              <DetailField label="Audience Marital Status" value={client.audienceMaritalStatus} />
            </div>
          </TabsContent>

          {/* Tab 3: Value Proposition */}
          <TabsContent value="value" className="space-y-4 mt-4">
            <div className="space-y-3">
              <DetailField label="Pain Points" value={client.keyPainPoints} />
              <DetailField label="Unique Value Propositions" value={client.uniqueValueProps} />
              <DetailField label="Competitive Differentiation" value={client.differentiation} />
              <DetailField label="Emerging Competitors" value={client.emergingCompetitors} />
            </div>
          </TabsContent>

          {/* Tab 4: Brand Identity */}
          <TabsContent value="brand" className="space-y-4 mt-4">
            <div className="space-y-3">
              <DetailField label="Brand Image" value={client.idealBrandImage} />
              <DetailField label="Brand Personality" value={client.brandPersonality} />
              <DetailField label="Preferred Font" value={client.preferredFont} />
              <DetailField label="Brand Values" value={client.brandValues} />
              <DetailField label="Branding Aesthetics" value={client.brandingAesthetics} />
              <DetailField label="Emotions Brand Evokes" value={client.emotionsBrandEvokes} />
              <DetailField label="Inspiration Brands" value={client.inspirationBrands} />
            </div>
          </TabsContent>

          {/* Tab 5: Growth & Vision */}
          <TabsContent value="growth" className="space-y-4 mt-4">
            <div className="space-y-3">
              <DetailField label="Scaling Goals" value={client.scalingGoals} />
              <DetailField label="Growth Strategies" value={client.growthStrategies} />
              <DetailField label="Long-Term Vision" value={client.longTermVision} />
              <DetailField label="Current Channels" value={client.currentChannels} />
              <DetailField label="Specific Deadlines" value={client.specificDeadlines} />
            </div>
          </TabsContent>

          {/* Tab 6: Your Story */}
          <TabsContent value="story" className="space-y-4 mt-4">
            <div className="space-y-3">
              <DetailField label="Professional Milestones" value={client.professionalMilestones} />
              <DetailField label="Personal Turning Points" value={client.personalTurningPoints} />
              <DetailField label="Additional Information" value={client.additionalInfo} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function DetailField({ label, value }: { label: string; value?: string | null }) {
  if (!value) {
    return (
      <div className="rounded-lg border border-dashed p-3 bg-muted/30">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm italic text-muted-foreground">Not provided</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border p-3 bg-card hover:bg-accent/50 transition-colors">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm whitespace-pre-wrap">{value}</p>
    </div>
  )
}
