import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db'

// Column headers matching the application form questions
const CSV_HEADERS = [
    'ID',
    'Full Name',
    'Email',
    'Instagram Handle',
    'TikTok Handle',
    'Country',
    'Industry/Niche',
    'Age',
    'Professional Milestones',
    'Personal Turning Points',
    'Vision for Venture',
    'Hope to Achieve',
    'Target Audience',
    'Demographic Profile',
    'Target Demographic Age',
    'Audience Gender Split',
    'Audience Marital Status',
    'Current Channels',
    'Key Pain Points',
    'Brand Values',
    'Differentiation',
    'Unique Value Props',
    'Emerging Competitors',
    'Ideal Brand Image',
    'Inspiration Brands',
    'Branding Aesthetics',
    'Emotions Brand Evokes',
    'Brand Personality',
    'Preferred Font',
    'Product Categories',
    'Other Product Ideas',
    'Scaling Goals',
    'Growth Strategies',
    'Long-term Vision',
    'Specific Deadlines',
    'Additional Info',
    'Status',
    'Created At',
    'Reviewed At',
]

// Escape CSV values
function escapeCSV(value: unknown): string {
    if (value === null || value === undefined) {
        return ''
    }
    const str = String(value)
    // If contains comma, newline, or quote, wrap in quotes and escape quotes
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`
    }
    return str
}

// GET /api/applications/export - Export applications as CSV
export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const applications = await prisma.application.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        })

        // Build CSV content
        const rows: string[] = []

        // Header row
        rows.push(CSV_HEADERS.join(','))

        // Data rows
        for (const app of applications) {
            const row = [
                escapeCSV(app.id),
                escapeCSV(app.fullName),
                escapeCSV(app.email),
                escapeCSV(app.instagramHandle),
                escapeCSV(app.tiktokHandle),
                escapeCSV(app.country),
                escapeCSV(app.industryNiche),
                escapeCSV(app.age),
                escapeCSV(app.professionalMilestones),
                escapeCSV(app.personalTurningPoints),
                escapeCSV(app.visionForVenture),
                escapeCSV(app.hopeToAchieve),
                escapeCSV(app.targetAudience),
                escapeCSV(app.demographicProfile),
                escapeCSV(app.targetDemographicAge),
                escapeCSV(app.audienceGenderSplit),
                escapeCSV(app.audienceMaritalStatus),
                escapeCSV(app.currentChannels),
                escapeCSV(app.keyPainPoints),
                escapeCSV(app.brandValues),
                escapeCSV(app.differentiation),
                escapeCSV(app.uniqueValueProps),
                escapeCSV(app.emergingCompetitors),
                escapeCSV(app.idealBrandImage),
                escapeCSV(app.inspirationBrands),
                escapeCSV(app.brandingAesthetics),
                escapeCSV(app.emotionsBrandEvokes),
                escapeCSV(app.brandPersonality),
                escapeCSV(app.preferredFont),
                escapeCSV(app.productCategories),
                escapeCSV(app.otherProductIdeas),
                escapeCSV(app.scalingGoals),
                escapeCSV(app.growthStrategies),
                escapeCSV(app.longTermVision),
                escapeCSV(app.specificDeadlines),
                escapeCSV(app.additionalInfo),
                escapeCSV(app.status),
                escapeCSV(app.createdAt?.toISOString()),
                escapeCSV(app.reviewedAt?.toISOString()),
            ]
            rows.push(row.join(','))
        }

        const csvContent = rows.join('\n')

        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="submissions-${new Date().toISOString().split('T')[0]}.csv"`,
            },
        })
    } catch (error) {
        console.error('Failed to export applications:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to export applications' },
            { status: 500 }
        )
    }
}
