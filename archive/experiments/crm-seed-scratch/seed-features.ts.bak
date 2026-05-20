/**
 * Comprehensive Seed Data for New Features
 *
 * This seed file creates dummy data for:
 * - Feature 1: Client Portal Users
 * - Feature 2: AI Business Coach Conversations
 * - Feature 3: Automated Client Journey Schedules
 * - Feature 4: Social Media Connections & Analytics
 * - Feature 5: Community Platform (Posts, Events, DMs)
 */

import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { addDays, subDays, addHours } from 'date-fns'

const prisma = new PrismaClient()

// Helper to generate random dates
function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Helper to get random item from array
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function main() {
  console.log('🌱 Seeding new features data...')

  // Get existing clients (assuming some exist from previous seed)
  const clients = await prisma.client.findMany({ take: 10 })

  if (clients.length === 0) {
    console.log('⚠️  No clients found. Please run the main seed first.')
    return
  }

  // ============================================================================
  // FEATURE 1: CLIENT PORTAL
  // ============================================================================
  console.log('📱 Seeding Client Portal Users...')

  for (const client of clients.slice(0, 8)) {
    const portalUser = await prisma.clientPortalUser.create({
      data: {
        clientId: client.id,
        email: client.email,
        passwordHash: await hash('password123', 12),
        isActive: true,
        activatedAt: subDays(new Date(), Math.floor(Math.random() * 30)),
        lastLoginAt: subDays(new Date(), Math.floor(Math.random() * 7)),
        emailVerified: true,
        notifyNewDeliverable: true,
        notifyNewMessage: true,
        notifyMilestoneReminder: Math.random() > 0.5,
        notifyWeeklySummary: Math.random() > 0.3,
      }
    })

    // Create some portal messages
    for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
      const threadId = `thread_${client.id}_${i}`

      // Admin message
      await prisma.portalMessage.create({
        data: {
          threadId,
          clientId: client.id,
          subject: randomItem([
            'Your M2 deliverable is ready!',
            'Quick check-in',
            'Answer to your question',
            'Exciting update!'
          ]),
          body: randomItem([
            'Hi! Your deliverable is now available. Let me know if you have any questions!',
            'Just checking in on your progress. How are things going?',
            'Great question! Here\'s what I recommend...',
            'We just added a new feature you might find useful!'
          ]),
          isFromAdmin: true,
          isRead: Math.random() > 0.3,
          createdAt: subDays(new Date(), Math.floor(Math.random() * 14)),
        }
      })

      // Client reply
      if (Math.random() > 0.4) {
        await prisma.portalMessage.create({
          data: {
            threadId,
            clientUserId: portalUser.id,
            clientId: client.id,
            subject: 'Re: ' + randomItem(['Your M2 deliverable is ready!', 'Quick check-in']),
            body: randomItem([
              'Thank you! I\'ll review it today.',
              'Things are going well, thank you for asking!',
              'This is super helpful, thanks!',
              'Love it! This will help a lot.'
            ]),
            isFromAdmin: false,
            isRead: true,
            createdAt: subDays(new Date(), Math.floor(Math.random() * 10)),
          }
        })
      }
    }

    // Create notifications
    for (let i = 0; i < Math.floor(Math.random() * 8) + 2; i++) {
      await prisma.portalNotification.create({
        data: {
          clientUserId: portalUser.id,
          type: randomItem(['NEW_DELIVERABLE', 'NEW_MESSAGE', 'MILESTONE_REMINDER', 'ACCOUNT_UPDATE']),
          title: randomItem([
            'New deliverable available',
            'New message from admin',
            'Your M3 deliverable is due in 3 days',
            'Profile updated successfully'
          ]),
          message: randomItem([
            'Your Month 2 deliverable is now ready for review.',
            'Admin has sent you a new message.',
            'Don\'t forget: Your Month 3 deliverable is coming up!',
            'Your contact information has been updated.'
          ]),
          actionUrl: randomItem([
            '/portal/documents',
            '/portal/messages',
            '/portal/progress',
            '/portal/profile'
          ]),
          isRead: Math.random() > 0.4,
          createdAt: subDays(new Date(), Math.floor(Math.random() * 20)),
        }
      })
    }
  }

  console.log(`✅ Created ${clients.slice(0, 8).length} portal users with messages and notifications`)

  // ============================================================================
  // FEATURE 2: AI BUSINESS COACH CHAT
  // ============================================================================
  console.log('🤖 Seeding AI Coach Conversations...')

  // Create coach config
  await prisma.coachConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      systemPrompt: `You are an expert business coach for Wavelaunch Studio.
Your role is to help creators build sustainable online businesses.
Always be encouraging, actionable, and specific to their niche and stage.`,
      maxTokensPerMessage: 500,
      maxTokensPerDay: 5000,
      enabledCapabilities: [
        'business_advice',
        'content_ideation',
        'pricing_strategy',
        'marketing_guidance'
      ],
      escalationKeywords: [
        'lawyer', 'legal', 'sue', 'accountant', 'tax', 'medical', 'doctor'
      ],
      isActive: true,
    }
  })

  for (const client of clients.slice(0, 6)) {
    const conversationCount = Math.floor(Math.random() * 3) + 1

    for (let c = 0; c < conversationCount; c++) {
      const conversation = await prisma.coachConversation.create({
        data: {
          clientId: client.id,
          title: randomItem([
            'Pricing my course',
            'Content ideas for this week',
            'How to get more followers',
            'Dealing with imposter syndrome',
            'Launch strategy advice'
          ]),
          isActive: Math.random() > 0.3,
          lastMessageAt: subDays(new Date(), Math.floor(Math.random() * 7)),
          messageCount: 0,
          totalTokens: 0,
        }
      })

      // Create conversation messages
      const messageCount = Math.floor(Math.random() * 10) + 2
      let totalTokens = 0
      let ratings: number[] = []

      for (let m = 0; m < messageCount; m++) {
        const isUserMessage = m % 2 === 0

        if (isUserMessage) {
          const content = randomItem([
            'I\'m struggling with pricing my online course. Any tips?',
            'How can I increase engagement on my Instagram posts?',
            'What should I focus on this month?',
            'I feel like I\'m not making progress. Help!',
            'Can you help me brainstorm content ideas?',
            'How do I know if I\'m ready to launch?'
          ])

          await prisma.coachMessage.create({
            data: {
              conversationId: conversation.id,
              role: 'user',
              content,
              tokensUsed: Math.floor(content.length / 4),
              createdAt: subDays(new Date(), (messageCount - m) * 2),
            }
          })

          totalTokens += Math.floor(content.length / 4)
        } else {
          const content = randomItem([
            `Great question! Based on your niche (${client.businessName || 'your business'}), here are 3 pricing strategies:\n\n1. Tiered pricing ($97/$197/$497)\n2. Payment plans ($67/mo for 3 months)\n3. Early bird special ($147 → $197)\n\nWhich approach resonates with your audience?`,
            `To boost Instagram engagement:\n\n1. Post at peak times (6-8 AM or 7-9 PM)\n2. Use 5-10 relevant hashtags\n3. Ask questions in captions\n4. Reply to comments within 1 hour\n5. Use Reels (they get 3x more reach)\n\nTry these for a week and track your results!`,
            `Focus on these 3 things this month:\n\n1. Publish 12 pieces of content (3/week)\n2. Engage with 50+ accounts daily\n3. Finalize your offer and pricing\n\nSmall, consistent actions lead to big results!`,
            `I hear you. Every creator feels this way sometimes. Here's the truth: progress isn't always visible.\n\nYou're building foundations now that will pay off later. Keep going—you're exactly where you need to be.`,
            `Let's brainstorm! Based on your niche, here are 10 content ideas:\n\n1. "5 mistakes [niche] beginners make"\n2. Your morning routine\n3. Before & after transformation\n4. Myth-busting common beliefs\n5. Behind-the-scenes of your process\n\nWhich one excites you most?`,
            `You're ready to launch when:\n\n✅ You have a clear offer\n✅ You've validated demand (pre-sales or surveys)\n✅ You can deliver value consistently\n✅ You're willing to learn and iterate\n\nPerfection is the enemy of progress. Ship it!`
          ])

          const rating = Math.random() > 0.3 ? (Math.random() > 0.2 ? 2 : 1) : null

          await prisma.coachMessage.create({
            data: {
              conversationId: conversation.id,
              role: 'assistant',
              content,
              tokensUsed: Math.floor(content.length / 4),
              rating: rating,
              ratingFeedback: rating === 1 ? randomItem([
                'Not quite what I needed',
                'A bit too generic',
                null
              ]) : null,
              createdAt: subDays(new Date(), (messageCount - m) * 2 - 1),
            }
          })

          totalTokens += Math.floor(content.length / 4)
          if (rating) ratings.push(rating)
        }
      }

      // Update conversation stats
      await prisma.coachConversation.update({
        where: { id: conversation.id },
        data: {
          messageCount,
          totalTokens,
          averageRating: ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : null,
        }
      })
    }
  }

  console.log(`✅ Created coach conversations for ${clients.slice(0, 6).length} clients`)

  // ============================================================================
  // FEATURE 3: AUTOMATED CLIENT JOURNEY ENGINE
  // ============================================================================
  console.log('🚀 Seeding Client Journey Automations...')

  for (const client of clients.slice(0, 7)) {
    const programStartDate = subDays(new Date(), Math.floor(Math.random() * 90))
    const currentMonth = Math.floor((new Date().getTime() - programStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30)) + 1

    // Update client with journey data
    await prisma.client.update({
      where: { id: client.id },
      data: {
        programStartDate,
        currentMonth: Math.min(currentMonth, 8),
        isPaused: Math.random() > 0.9,
      }
    })

    // Schedule automations for all 8 months
    for (let month = 1; month <= 8; month++) {
      const monthStartDate = addDays(programStartDate, (month - 1) * 30)
      const isPast = monthStartDate < new Date()

      // Deliverable generation
      await prisma.automationSchedule.create({
        data: {
          clientId: client.id,
          type: 'GENERATE_DELIVERABLE',
          triggerDate: monthStartDate,
          status: isPast ? 'COMPLETED' : 'SCHEDULED',
          payload: { month },
          executedAt: isPast ? monthStartDate : null,
        }
      })

      // Reminder: 3 days before
      await prisma.automationSchedule.create({
        data: {
          clientId: client.id,
          type: 'SEND_REMINDER',
          triggerDate: subDays(monthStartDate, 3),
          status: isPast ? 'COMPLETED' : 'SCHEDULED',
          payload: { month, template: 'UPCOMING' },
          executedAt: isPast ? subDays(monthStartDate, 3) : null,
        }
      })

      // Reminder: Deliverable ready
      await prisma.automationSchedule.create({
        data: {
          clientId: client.id,
          type: 'SEND_REMINDER',
          triggerDate: addHours(monthStartDate, 2),
          status: isPast ? 'COMPLETED' : 'SCHEDULED',
          payload: { month, template: 'READY' },
          executedAt: isPast ? addHours(monthStartDate, 2) : null,
        }
      })

      // Overdue reminder
      await prisma.automationSchedule.create({
        data: {
          clientId: client.id,
          type: 'SEND_REMINDER',
          triggerDate: addDays(monthStartDate, 3),
          status: isPast ? (Math.random() > 0.7 ? 'COMPLETED' : 'CANCELLED') : 'SCHEDULED',
          payload: { month, template: 'OVERDUE' },
          executedAt: isPast && Math.random() > 0.7 ? addDays(monthStartDate, 3) : null,
        }
      })

      // Celebration on month complete
      if (month < currentMonth) {
        await prisma.automationSchedule.create({
          data: {
            clientId: client.id,
            type: 'SEND_CELEBRATION',
            triggerDate: addDays(monthStartDate, 5),
            status: 'COMPLETED',
            payload: { month, type: 'MONTH_COMPLETE' },
            executedAt: addDays(monthStartDate, 5),
          }
        })
      }
    }

    // Create automation logs
    const completedAutomations = await prisma.automationSchedule.findMany({
      where: {
        clientId: client.id,
        status: 'COMPLETED',
      },
      take: 10,
    })

    for (const automation of completedAutomations) {
      await prisma.automationLog.create({
        data: {
          clientId: client.id,
          automationId: automation.id,
          type: automation.type,
          action: `Executed ${automation.type} for month ${automation.payload['month']}`,
          status: 'SUCCESS',
          metadata: automation.payload,
        }
      })
    }
  }

  console.log(`✅ Created journey automations for ${clients.slice(0, 7).length} clients`)

  // ============================================================================
  // FEATURE 4: SOCIAL MEDIA ANALYTICS
  // ============================================================================
  console.log('📊 Seeding Social Media Connections...')

  const platforms = ['INSTAGRAM', 'TIKTOK', 'YOUTUBE']
  const usernames = [
    'sarahfitmom', 'miketechguru', 'lisafinance', 'johnparentcoach',
    'janeartist', 'alexbusiness', 'emilyhealth', 'davidcreator'
  ]

  for (let i = 0; i < clients.length && i < 8; i++) {
    const client = clients[i]
    const numPlatforms = Math.floor(Math.random() * 3) + 1
    const selectedPlatforms = platforms.sort(() => 0.5 - Math.random()).slice(0, numPlatforms)

    for (const platform of selectedPlatforms) {
      const connection = await prisma.socialConnection.create({
        data: {
          clientId: client.id,
          platform,
          platformUserId: `${platform.toLowerCase()}_${client.id}`,
          platformUsername: usernames[i] || `user${i}`,
          accessToken: `encrypted_token_${Math.random().toString(36)}`,
          refreshToken: `encrypted_refresh_${Math.random().toString(36)}`,
          tokenExpiresAt: addDays(new Date(), 60),
          isActive: true,
          lastSyncAt: subDays(new Date(), Math.floor(Math.random() * 3)),
          connectedAt: subDays(new Date(), Math.floor(Math.random() * 60) + 30),
        }
      })

      // Create historical snapshots (daily for last 90 days)
      const baseFollowers = Math.floor(Math.random() * 10000) + 1000
      for (let day = 90; day >= 0; day--) {
        const growthRate = (Math.random() * 0.02) + 0.005 // 0.5-2.5% daily growth
        const followers = Math.floor(baseFollowers * Math.pow(1 + growthRate, 90 - day))
        const engagement = 2 + (Math.random() * 3) // 2-5% engagement

        await prisma.socialSnapshot.create({
          data: {
            connectionId: connection.id,
            date: subDays(new Date(), day),
            followers,
            following: Math.floor(followers * (Math.random() * 0.3 + 0.1)), // 10-40% of followers
            postsCount: Math.floor(90 - day) * Math.floor(Math.random() * 2 + 1),
            engagement,
            reach: Math.floor(followers * (Math.random() * 0.5 + 0.3)),
            impressions: Math.floor(followers * (Math.random() * 1.5 + 0.5)),
            metrics: {
              profileViews: Math.floor(Math.random() * 500) + 100,
              websiteClicks: Math.floor(Math.random() * 50) + 10,
              topPostLikes: Math.floor(Math.random() * 1000) + 100,
            }
          }
        })
      }

      // Create some alerts
      if (Math.random() > 0.6) {
        const alertType = randomItem(['MILESTONE', 'GROWTH_SURGE', 'GROWTH_DECLINE', 'LOW_ENGAGEMENT'])

        await prisma.socialAlert.create({
          data: {
            clientId: client.id,
            connectionId: connection.id,
            type: alertType,
            severity: alertType === 'GROWTH_DECLINE' ? 'WARNING' : 'INFO',
            title: alertType === 'MILESTONE' ? '🎉 10K Followers Milestone!' :
                   alertType === 'GROWTH_SURGE' ? '🚀 Growth Surge Detected!' :
                   alertType === 'GROWTH_DECLINE' ? '⚠️ Growth Slowdown' :
                   '📊 Low Engagement Alert',
            message: alertType === 'MILESTONE' ? `${usernames[i]} just hit 10,000 followers on ${platform}!` :
                     alertType === 'GROWTH_SURGE' ? `Follower growth up 150% this week!` :
                     alertType === 'GROWTH_DECLINE' ? `Follower growth down 30% compared to last month.` :
                     `Engagement rate dropped to 1.8% (below 2.5% average).`,
            isRead: Math.random() > 0.4,
            isSent: true,
            createdAt: subDays(new Date(), Math.floor(Math.random() * 14)),
          }
        })
      }
    }
  }

  console.log(`✅ Created social connections with historical data for ${Math.min(clients.length, 8)} clients`)

  // ============================================================================
  // FEATURE 5: COMMUNITY PLATFORM
  // ============================================================================
  console.log('👥 Seeding Community Platform...')

  // Create community channels
  const channels = [
    { name: 'Announcements', slug: 'announcements', icon: '📣', type: 'ANNOUNCEMENT' },
    { name: 'Wins & Celebrations', slug: 'wins', icon: '🏆', type: 'GENERAL' },
    { name: 'General Discussion', slug: 'general', icon: '💬', type: 'GENERAL' },
    { name: 'Fitness & Wellness', slug: 'fitness', icon: '💪', type: 'NICHE' },
    { name: 'Finance & Investing', slug: 'finance', icon: '💰', type: 'NICHE' },
    { name: 'Tech & Productivity', slug: 'tech', icon: '💻', type: 'NICHE' },
    { name: 'M1: Foundation Excellence', slug: 'm1', icon: '1️⃣', type: 'MONTH' },
    { name: 'M2: Brand Readiness', slug: 'm2', icon: '2️⃣', type: 'MONTH' },
    { name: 'M3: Market Entry', slug: 'm3', icon: '3️⃣', type: 'MONTH' },
    { name: 'Ask the Community', slug: 'questions', icon: '❓', type: 'QA' },
    { name: 'Resources & Tools', slug: 'resources', icon: '📚', type: 'RESOURCES' },
  ]

  const createdChannels = []
  for (const channelData of channels) {
    const channel = await prisma.communityChannel.create({ data: channelData })
    createdChannels.push(channel)
  }

  // Create community member profiles
  for (const client of clients.slice(0, 8)) {
    await prisma.communityMemberProfile.create({
      data: {
        clientId: client.id,
        username: usernames[clients.indexOf(client)] || `user${clients.indexOf(client)}`,
        bio: randomItem([
          'Fitness coach helping busy moms get healthy 💪',
          'Teaching creators how to monetize their passion 💰',
          'Tech productivity tips for entrepreneurs 💻',
          'Helping parents navigate the digital age 👨‍👩‍👧',
          'Artist sharing the creative journey 🎨',
          'Building a business empire, one step at a time 🚀',
        ]),
        location: randomItem(['Austin, TX', 'Los Angeles, CA', 'New York, NY', 'Miami, FL', 'Seattle, WA']),
        socialLinks: {
          instagram: `instagram.com/${usernames[clients.indexOf(client)]}`,
          tiktok: Math.random() > 0.5 ? `tiktok.com/@${usernames[clients.indexOf(client)]}` : null,
        },
        allowDMs: true,
        emailNotifications: Math.random() > 0.3,
        points: Math.floor(Math.random() * 500) + 50,
        badges: [
          'welcome',
          Math.random() > 0.5 ? 'first_win' : null,
          Math.random() > 0.7 ? '10_helpful_replies' : null,
        ].filter(Boolean),
      }
    })
  }

  // Create community posts
  const postTemplates = [
    { type: 'WIN', title: 'Just hit 10K followers! 🎉', content: 'I can\'t believe it! After 3 months of consistent posting, I finally hit 10,000 followers on Instagram. Thank you all for the support!' },
    { type: 'QUESTION', title: 'Best time to post on TikTok?', content: 'What time do you all find works best for posting TikToks? I\'m in the fitness niche and trying to optimize my posting schedule.' },
    { type: 'TEXT', title: 'Struggling with imposter syndrome', content: 'Does anyone else feel like they\'re not qualified to be teaching/coaching? I know I have value to offer but the doubt creeps in...' },
    { type: 'RESOURCE', title: 'Free Canva templates', content: 'I created 10 Instagram post templates for fitness creators. DM me if you want them! Happy to share.' },
    { type: 'WIN', title: 'First paid client! 💰', content: 'I just landed my first paying client for $500! This program works. Keep going everyone!' },
    { type: 'QUESTION', title: 'How do you price your services?', content: 'I\'m launching my coaching program next month. How did you determine your pricing? I\'m torn between $97 and $197/month.' },
  ]

  for (const channel of createdChannels.slice(0, 8)) {
    const numPosts = Math.floor(Math.random() * 5) + 3

    for (let p = 0; p < numPosts; p++) {
      const author = randomItem(clients.slice(0, 8))
      const template = randomItem(postTemplates)

      const post = await prisma.communityPost.create({
        data: {
          authorId: author.id,
          channelId: channel.id,
          type: template.type,
          title: template.title,
          content: template.content,
          isPinned: channel.type === 'ANNOUNCEMENT' && Math.random() > 0.7,
          isSolved: template.type === 'QUESTION' && Math.random() > 0.6,
          likeCount: Math.floor(Math.random() * 50),
          replyCount: Math.floor(Math.random() * 15),
          viewCount: Math.floor(Math.random() * 200) + 20,
          createdAt: subDays(new Date(), Math.floor(Math.random() * 30)),
        }
      })

      // Create replies
      const numReplies = Math.floor(Math.random() * 8) + 1
      for (let r = 0; r < numReplies; r++) {
        const replyAuthor = randomItem(clients.slice(0, 8).filter(c => c.id !== author.id))

        await prisma.communityReply.create({
          data: {
            postId: post.id,
            authorId: replyAuthor.id,
            content: randomItem([
              'Congratulations! That\'s amazing! 🎉',
              'I\'ve found 7-9 PM works best for me!',
              'You\'re not alone. We all feel this sometimes. Keep going! 💪',
              'These templates are awesome! Thank you for sharing!',
              'This is so inspiring! Congrats on the first client!',
              'I started at $97 and raised it to $197 after 3 months. Start lower and increase as you get testimonials.',
              'Great question! Following this thread.',
            ]),
            likeCount: Math.floor(Math.random() * 20),
            isHelpful: template.type === 'QUESTION' && Math.random() > 0.7,
            createdAt: addDays(post.createdAt, Math.floor(Math.random() * 5)),
          }
        })
      }

      // Create likes
      const likers = clients.slice(0, 8).sort(() => 0.5 - Math.random()).slice(0, post.likeCount)
      for (const liker of likers) {
        await prisma.communityLike.create({
          data: {
            userId: liker.id,
            postId: post.id,
          }
        }).catch(() => {}) // Ignore duplicate errors
      }
    }
  }

  // Create events
  const eventTypes = ['COACHING', 'COWORKING', 'HOTSEAT', 'MEETUP', 'PANEL']
  for (let e = 0; e < 5; e++) {
    const startTime = addDays(new Date(), Math.floor(Math.random() * 30) + 1)

    const event = await prisma.communityEvent.create({
      data: {
        title: randomItem([
          'Monthly Group Coaching Call',
          'Co-Working Power Hour',
          'Hot Seat: Get Feedback on Your Strategy',
          'Fitness Creators Meetup',
          'Success Stories Panel'
        ]),
        description: randomItem([
          'Join us for our monthly group coaching session. Bring your questions!',
          'Work alongside fellow creators. Camera on, mic muted. Let\'s be productive together!',
          'Share your challenge and get real-time feedback from the group.',
          'All fitness creators welcome! Let\'s connect and collaborate.',
          'Hear from 3 creators who\'ve completed the program and found success.'
        ]),
        type: randomItem(eventTypes),
        startTime,
        endTime: addHours(startTime, 1),
        timezone: 'America/New_York',
        meetingUrl: `https://zoom.us/j/${Math.floor(Math.random() * 1000000000)}`,
        maxAttendees: 50,
      }
    })

    // Create attendees
    const attendeeCount = Math.floor(Math.random() * 20) + 5
    const attendees = clients.slice(0, 8).sort(() => 0.5 - Math.random()).slice(0, attendeeCount)

    for (const attendee of attendees) {
      await prisma.communityEventAttendee.create({
        data: {
          eventId: event.id,
          clientId: attendee.id,
          rsvpStatus: randomItem(['GOING', 'GOING', 'GOING', 'MAYBE']), // Higher chance of GOING
        }
      }).catch(() => {}) // Ignore duplicates
    }
  }

  // Create some direct messages
  for (let i = 0; i < 5; i++) {
    const sender = randomItem(clients.slice(0, 8))
    const receiver = randomItem(clients.slice(0, 8).filter(c => c.id !== sender.id))
    const conversationId = [sender.id, receiver.id].sort().join('_')

    // Back and forth messages
    for (let m = 0; m < Math.floor(Math.random() * 6) + 2; m++) {
      const isFromSender = m % 2 === 0

      await prisma.communityDirectMessage.create({
        data: {
          conversationId,
          senderId: isFromSender ? sender.id : receiver.id,
          receiverId: isFromSender ? receiver.id : sender.id,
          content: randomItem([
            'Hey! I saw your post about hitting 10K. Any tips?',
            'Thanks for asking! Consistency was key. I posted 5x/week for 3 months straight.',
            'That\'s amazing. What time of day did you post?',
            'Usually 7 AM and 7 PM. Those got the most engagement.',
            'Awesome, I\'ll try that. Thanks!',
            'No problem! Let me know how it goes! 😊',
          ]),
          isRead: Math.random() > 0.3 || m < (Math.floor(Math.random() * 6) + 2) - 1,
          createdAt: subDays(new Date(), Math.floor(Math.random() * 10)),
        }
      })
    }
  }

  console.log('✅ Created community channels, posts, events, and direct messages')

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n🎉 Feature seeding complete!\n')
  console.log('Summary:')
  console.log(`  📱 Portal Users: ${await prisma.clientPortalUser.count()}`)
  console.log(`  💬 Portal Messages: ${await prisma.portalMessage.count()}`)
  console.log(`  🔔 Portal Notifications: ${await prisma.portalNotification.count()}`)
  console.log(`  🤖 Coach Conversations: ${await prisma.coachConversation.count()}`)
  console.log(`  💬 Coach Messages: ${await prisma.coachMessage.count()}`)
  console.log(`  🚀 Automation Schedules: ${await prisma.automationSchedule.count()}`)
  console.log(`  📊 Automation Logs: ${await prisma.automationLog.count()}`)
  console.log(`  📱 Social Connections: ${await prisma.socialConnection.count()}`)
  console.log(`  📈 Social Snapshots: ${await prisma.socialSnapshot.count()}`)
  console.log(`  🚨 Social Alerts: ${await prisma.socialAlert.count()}`)
  console.log(`  📝 Community Posts: ${await prisma.communityPost.count()}`)
  console.log(`  💬 Community Replies: ${await prisma.communityReply.count()}`)
  console.log(`  📅 Community Events: ${await prisma.communityEvent.count()}`)
  console.log(`  💌 Direct Messages: ${await prisma.communityDirectMessage.count()}`)
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
