/**
 * Ticket System Schemas
 *
 * Zod validation schemas for ticket/support system
 */

import { z } from 'zod'

// Ticket creation schema
export const createTicketSchema = z.object({
  clientId: z.string().cuid(),
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  category: z.string().optional(),
})

// Ticket update schema
export const updateTicketSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(10).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_ON_CLIENT', 'WAITING_ON_TEAM', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  category: z.string().optional(),
})

// Ticket assignment schema
export const assignTicketSchema = z.object({
  assignedTo: z.string().cuid().nullable(),
})

// Ticket comment schema
export const createTicketCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
  isInternal: z.boolean().default(false),
})

// Ticket filter schema
export const ticketFilterSchema = z.object({
  clientId: z.string().cuid().optional(),
  assignedTo: z.string().cuid().optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_ON_CLIENT', 'WAITING_ON_TEAM', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  category: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type CreateTicketInput = z.infer<typeof createTicketSchema>
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>
export type AssignTicketInput = z.infer<typeof assignTicketSchema>
export type CreateTicketCommentInput = z.infer<typeof createTicketCommentSchema>
export type TicketFilterInput = z.infer<typeof ticketFilterSchema>
