import { z } from 'zod'

export const uploadFileSchema = z.object({
  clientId: z.string().cuid().optional(),
  category: z.enum(['BUSINESS_PLAN', 'DELIVERABLE', 'UPLOAD', 'MISC']).default('UPLOAD'),
})

export const fileFilterSchema = z.object({
  clientId: z.string().cuid().optional(),
  category: z.enum(['BUSINESS_PLAN', 'DELIVERABLE', 'UPLOAD', 'MISC']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
})

export type UploadFileInput = z.infer<typeof uploadFileSchema>
export type FileFilterInput = z.infer<typeof fileFilterSchema>
