import { NextRequest, NextResponse } from 'next/server';
import { EmailDraftComposer } from '@/lib/services/EmailDraftComposer';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const composer = new EmailDraftComposer({
      fromEmail: 'team@wavelaunch.studio',
      fromName: 'Wavelaunch Studio',
    });

    await composer.sendEmail(params.id, 'system');

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email', success: false },
      { status: 500 }
    );
  }
}
