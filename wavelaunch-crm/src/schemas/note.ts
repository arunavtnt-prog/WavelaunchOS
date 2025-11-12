import { z } from 'zod'

export const createNoteSchema = z.object({
  clientId: z.string().cuid(),
  content: z.string().min(1, 'Note content is required'),
  isImportant: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
})

export const updateNoteSchema = z.object({
  content: z.string().min(1).optional(),
  isImportant: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
})

export const noteFilterSchema = z.object({
  clientId: z.string().cuid(),
  tag: z.string().optional(),
  category: z.string().optional(),
  isImportant: z.boolean().optional(),
})

export type CreateNoteInput = z.infer<typeof createNoteSchema>
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>
export type NoteFilterInput = z.infer<typeof noteFilterSchema>
