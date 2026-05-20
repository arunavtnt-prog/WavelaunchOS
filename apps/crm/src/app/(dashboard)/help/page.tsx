'use client'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Book, Video, MessageCircle, FileQuestion } from 'lucide-react'
import Link from 'next/link'

const HELP_SECTIONS = [
  {
    title: 'Getting Started',
    icon: Book,
    articles: [
      'How to onboard a new client',
      'Understanding the 8-month program',
      'Managing deliverables',
    ],
  },
  {
    title: 'Features Guide',
    icon: FileQuestion,
    articles: [
      'Using prompt templates',
      'File management and uploads',
      'Business plan generation',
    ],
  },
  {
    title: 'Video Tutorials',
    icon: Video,
    articles: [
      'CRM overview walkthrough',
      'Creating your first deliverable',
      'Analytics and reporting',
    ],
  },
  {
    title: 'Support',
    icon: MessageCircle,
    articles: [
      'Contact support team',
      'Report a bug',
      'Request a feature',
    ],
  },
]

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Help Center</h1>
        <p className="text-muted-foreground">
          Documentation, tutorials, and support resources
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search documentation..."
          className="pl-10"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {HELP_SECTIONS.map((section) => (
          <Card key={section.title} className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <section.icon className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">{section.title}</h3>
            </div>
            <ul className="space-y-2">
              {section.articles.map((article) => (
                <li key={article}>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    • {article}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-primary/5">
        <h3 className="font-semibold mb-2">Can't find what you're looking for?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Contact our support team and we'll be happy to help.
        </p>
        <Link href="/tickets">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
            Create Support Ticket
          </button>
        </Link>
      </Card>
    </div>
  )
}
