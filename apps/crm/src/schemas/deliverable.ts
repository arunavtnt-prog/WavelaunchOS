import { z } from 'zod'

export const generateDeliverableSchema = z.object({
  clientId: z.string().cuid(),
  month: z.number().int().min(1).max(8),
  type: z.enum(['MAIN', 'SUBDOCUMENT']).default('MAIN'),
  parentId: z.string().cuid().optional(),
  title: z.string().optional(), // Auto-generated if not provided
})

export const updateDeliverableSchema = z.object({
  contentMarkdown: z.string().min(100, 'Content must be at least 100 characters'),
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'DELIVERED', 'REJECTED']).optional(),
  rejectionReason: z.string().optional(),
})

export const updateDeliverableStatusSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'DELIVERED', 'REJECTED']),
  rejectionReason: z.string().optional(),
})

export type GenerateDeliverableInput = z.infer<typeof generateDeliverableSchema>
export type UpdateDeliverableInput = z.infer<typeof updateDeliverableSchema>
export type UpdateDeliverableStatusInput = z.infer<typeof updateDeliverableStatusSchema>
