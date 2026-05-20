import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const status = searchParams.get('status');
    const intent = searchParams.get('intent');

    const take = limitParam ? Math.min(100, parseInt(limitParam, 10)) : 100;
    const skip = offsetParam ? parseInt(offsetParam, 10) : 0;

    const conversations = await db.instantlyConversation.findMany({
      orderBy: { lastMessageAt: 'desc' },
      take,
      skip,
      include: {
        messages: {
          orderBy: { receivedAt: 'desc' },
          take: 1,
        },
        drafts: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const totalCount = await db.instantlyConversation.count();

    const leadEmails = conversations.map((c) => c.leadEmail).filter(Boolean);
    const contacts = leadEmails.length
      ? await db.contact.findMany({
          where: { email: { in: leadEmails } },
          select: { email: true, kind: true, name: true },
        })
      : [];
    const byEmail = new Map(contacts.map((c) => [c.email, c]));

    const enriched = conversations.map((c) => ({
      ...c,
      contact: byEmail.get(c.leadEmail) || null,
    }));

    // Apply client-side filtering
    let filtered = enriched;
    if (status === 'Unread') {
      filtered = enriched.filter((c) => {
        const latestMessage = c.messages?.[0];
        return latestMessage?.isUnread === true && latestMessage?.direction === 'INBOUND';
      });
    } else if (status === 'NeedsReply') {
      filtered = enriched.filter((c) => c.needsReply === true);
    }
    if (intent) {
      filtered = filtered.filter((c) => c.intent === intent);
    }

    return NextResponse.json({
      success: true,
      data: filtered,
      pagination: {
        page: Math.floor(skip / take) + 1,
        pageSize: take,
        total: totalCount,
        totalPages: Math.ceil(totalCount / take),
      },
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
