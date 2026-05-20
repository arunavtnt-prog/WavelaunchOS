import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversation = await db.instantlyConversation.findUnique({
      where: { id: params.id },
      include: {
        messages: {
          orderBy: { receivedAt: 'asc' },
        },
        drafts: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const contact = await db.contact.findUnique({
      where: { email: conversation.leadEmail },
      select: { email: true, kind: true, name: true },
    });

    return NextResponse.json({ success: true, data: { ...conversation, contact } });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}
