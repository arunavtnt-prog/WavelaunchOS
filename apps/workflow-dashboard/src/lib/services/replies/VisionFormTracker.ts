import { db } from '@/lib/db/prisma';
import type { ConversationStage } from '@prisma/client';
import { CONVERSATION_STAGES } from './ReplyTypes';

export type VisionFormQuality = 'COMPLETE' | 'VAGUE' | 'INCOMPLETE';

export class VisionFormTracker {
  /**
   * Mark vision form as sent for a conversation
   * Updates conversation stage to VISION_FORM_SENT
   */
  static async markFormSent(conversationId: string, visionFormUrl: string = 'https://apply.wavelaunch.org'): Promise<void> {
    await db.instantlyConversation.update({
      where: { id: conversationId },
      data: {
        conversationStage: 'VISION_FORM_SENT',
        stageUpdatedAt: new Date(),
      },
    });
  }

  /**
   * Mark vision form as complete for a conversation
   * Updates conversation stage to VISION_FORM_COMPLETE
   */
  static async markFormComplete(conversationId: string, formData?: Record<string, any>): Promise<void> {
    await db.instantlyConversation.update({
      where: { id: conversationId },
      data: {
        conversationStage: 'VISION_FORM_COMPLETE',
        stageUpdatedAt: new Date(),
        summaryText: formData ? this.summarizeFormData(formData) : undefined,
      },
    });
  }

  /**
   * Update conversation stage for roadmap delivery
   */
  static async markRoadmapDelivered(conversationId: string): Promise<void> {
    await db.instantlyConversation.update({
      where: { id: conversationId },
      data: {
        conversationStage: 'ROADMAP_DELIVERED',
        stageUpdatedAt: new Date(),
      },
    });
  }

  /**
   * Update conversation stage for VC submission
   */
  static async markVcSubmitted(conversationId: string): Promise<void> {
    await db.instantlyConversation.update({
      where: { id: conversationId },
      data: {
        conversationStage: 'VC_SUBMITTED',
        stageUpdatedAt: new Date(),
      },
    });
  }

  /**
   * Update conversation stage for VC approval
   */
  static async markVcApproved(conversationId: string): Promise<void> {
    await db.instantlyConversation.update({
      where: { id: conversationId },
      data: {
        conversationStage: 'VC_APPROVED',
        stageUpdatedAt: new Date(),
      },
    });
  }

  /**
   * Update conversation stage for onboarding start
   */
  static async markOnboardingStarted(conversationId: string): Promise<void> {
    await db.instantlyConversation.update({
      where: { id: conversationId },
      data: {
        conversationStage: 'ONBOARDING_STARTED',
        stageUpdatedAt: new Date(),
      },
    });
  }

  /**
   * Update conversation stage for onboarding completion
   */
  static async markOnboardingComplete(conversationId: string): Promise<void> {
    await db.instantlyConversation.update({
      where: { id: conversationId },
      data: {
        conversationStage: 'ONBOARDING_COMPLETE',
        stageUpdatedAt: new Date(),
      },
    });
  }

  /**
   * Analyze vision form responses for quality
   * Returns COMPLETE, VAGUE, or INCOMPLETE based on content analysis
   */
  static analyzeFormQuality(formData: Record<string, any>): VisionFormQuality {
    const requiredFields = [
      'fullName',
      'email',
      'industryNiche',
      'targetAudience',
      'productCategories',
      'visionForVenture',
    ];

    // Check for incomplete required fields
    const incompleteFields = requiredFields.filter(field => {
      const value = formData[field];
      return !value || (typeof value === 'string' && value.trim().length < 10);
    });

    if (incompleteFields.length > 0) {
      return 'INCOMPLETE';
    }

    // Check for vague/short responses in key fields
    const keyFieldsToCheck = [
      'visionForVenture',
      'targetAudience',
      'uniqueValueProps',
      'differentiation',
    ];

    let vagueCount = 0;
    for (const field of keyFieldsToCheck) {
      const value = formData[field];
      if (!value || (typeof value === 'string' && value.trim().length < 50)) {
        vagueCount++;
      }
    }

    if (vagueCount > keyFieldsToCheck.length / 2) {
      return 'VAGUE';
    }

    return 'COMPLETE';
  }

  /**
   * Summarize form data for storage in conversation summary
   */
  private static summarizeFormData(formData: Record<string, any>): string {
    const summary: string[] = [];

    if (formData.fullName) {
      summary.push(`Name: ${formData.fullName}`);
    }
    if (formData.industryNiche) {
      summary.push(`Industry: ${formData.industryNiche}`);
    }
    if (formData.targetAudience) {
      summary.push(`Target Audience: ${formData.targetAudience.substring(0, 100)}${formData.targetAudience.length > 100 ? '...' : ''}`);
    }
    if (formData.productCategories && Array.isArray(formData.productCategories)) {
      summary.push(`Products: ${formData.productCategories.join(', ')}`);
    }
    if (formData.visionForVenture) {
      summary.push(`Vision: ${formData.visionForVenture.substring(0, 150)}${formData.visionForVenture.length > 150 ? '...' : ''}`);
    }

    return summary.join('\n');
  }

  /**
   * Get conversation stage with metadata
   */
  static async getConversationStage(conversationId: string): Promise<{
    stage: ConversationStage | null;
    updatedAt: Date | null;
    timeInStage: number; // hours
  }> {
    const conversation = await db.instantlyConversation.findUnique({
      where: { id: conversationId },
      select: {
        conversationStage: true,
        stageUpdatedAt: true,
      },
    });

    if (!conversation) {
      return { stage: null, updatedAt: null, timeInStage: 0 };
    }

    const timeInStage = conversation.stageUpdatedAt
      ? Math.floor((Date.now() - conversation.stageUpdatedAt.getTime()) / (1000 * 60 * 60))
      : 0;

    return {
      stage: conversation.conversationStage,
      updatedAt: conversation.stageUpdatedAt,
      timeInStage,
    };
  }

  /**
   * Get all conversations that have been in a stage too long
   * Useful for follow-up automation
   */
  static async getStaleConversations(maxHoursInStage: number = 168): Promise<Array<{
    id: string;
    leadEmail: string;
    leadName: string | null;
    stage: ConversationStage;
    hoursInStage: number;
  }>> {
    const staleDate = new Date(Date.now() - maxHoursInStage * 60 * 60 * 1000);

    const conversations = await db.instantlyConversation.findMany({
      where: {
        stageUpdatedAt: {
          lt: staleDate,
        },
        NOT: {
          conversationStage: 'INITIAL_CONTACT',
        },
      },
      select: {
        id: true,
        leadEmail: true,
        leadName: true,
        conversationStage: true,
        stageUpdatedAt: true,
      },
    });

    return conversations.map(conv => ({
      id: conv.id,
      leadEmail: conv.leadEmail,
      leadName: conv.leadName,
      stage: conv.conversationStage,
      hoursInStage: Math.floor((Date.now() - conv.stageUpdatedAt.getTime()) / (1000 * 60 * 60)),
    }));
  }

  /**
   * Get stage description for display
   */
  static getStageDescription(stage: ConversationStage): string {
    const descriptions: Record<string, string> = {
      INITIAL_CONTACT: 'First contact with the lead',
      VISION_FORM_SENT: 'Vision form link has been sent',
      VISION_FORM_COMPLETE: 'Vision form has been completed',
      ROADMAP_DELIVERED: 'Brand roadmap has been delivered',
      VC_SUBMITTED: 'Application submitted to VC for approval',
      VC_APPROVED: 'VC has approved the application',
      ONBOARDING_STARTED: 'Onboarding process has begun',
      ONBOARDING_COMPLETE: 'Onboarding process complete',
    };

    return descriptions[stage] || stage;
  }

  /**
   * Check if stage transition is valid
   */
  static isValidTransition(from: ConversationStage | null, to: ConversationStage): boolean {
    if (!from) return true;

    const validTransitions: Record<string, ConversationStage[]> = {
      INITIAL_CONTACT: ['VISION_FORM_SENT'],
      VISION_FORM_SENT: ['VISION_FORM_COMPLETE', 'INITIAL_CONTACT'],
      VISION_FORM_COMPLETE: ['ROADMAP_DELIVERED', 'VISION_FORM_SENT'],
      ROADMAP_DELIVERED: ['VC_SUBMITTED', 'VISION_FORM_COMPLETE'],
      VC_SUBMITTED: ['VC_APPROVED', 'ROADMAP_DELIVERED'],
      VC_APPROVED: ['ONBOARDING_STARTED', 'VC_SUBMITTED'],
      ONBOARDING_STARTED: ['ONBOARDING_COMPLETE', 'VC_APPROVED'],
      ONBOARDING_COMPLETE: [],
    };

    return validTransitions[from]?.includes(to) ?? false;
  }
}
