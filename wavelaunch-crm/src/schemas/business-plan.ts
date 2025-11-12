import { z } from 'zod'

export const generateBusinessPlanSchema = z.object({
  clientId: z.string().cuid(),
})

export const updateBusinessPlanSchema = z.object({
  contentMarkdown: z.string().min(100, 'Content must be at least 100 characters'),
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'DELIVERED', 'REJECTED']).optional(),
  rejectionReason: z.string().optional(),
})

export const updateBusinessPlanStatusSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'DELIVERED', 'REJECTED']),
  rejectionReason: z.string().optional(),
})

export const generatePDFSchema = z.object({
  quality: z.enum(['draft', 'final']).default('final'),
})

export type GenerateBusinessPlanInput = z.infer<typeof generateBusinessPlanSchema>
export type UpdateBusinessPlanInput = z.infer<typeof updateBusinessPlanSchema>
export type UpdateBusinessPlanStatusInput = z.infer<typeof updateBusinessPlanStatusSchema>
export type GeneratePDFInput = z.infer<typeof generatePDFSchema>
