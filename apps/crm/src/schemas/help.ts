/**
 * Help Center Schemas
 *
 * Zod validation schemas for help center system
 */

import { z } from 'zod'

// Help category schemas
export const createHelpCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  order: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
})

export const updateHelpCategorySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  order: z.number().int().min(0).optional(),
  isPublished: z.boolean().optional(),
})

// Help article schemas
export const createHelpArticleSchema = z.object({
  categoryId: z.string().cuid(),
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  slug: z.string().min(5).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  excerpt: z.string().max(300).optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
})

export const updateHelpArticleSchema = z.object({
  categoryId: z.string().cuid().optional(),
  title: z.string().min(5).max(200).optional(),
  slug: z.string().min(5).max(200).regex(/^[a-z0-9-]+$/).optional(),
  content: z.string().min(10).optional(),
  excerpt: z.string().max(300).optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
})

// Help article search schema
export const searchHelpArticlesSchema = z.object({
  query: z.string().min(1).optional(),
  categoryId: z.string().cuid().optional(),
  tags: z.string().optional(), // Comma-separated tags
  isPublished: z.coerce.boolean().default(true),
  isFeatured: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'viewCount', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type CreateHelpCategoryInput = z.infer<typeof createHelpCategorySchema>
export type UpdateHelpCategoryInput = z.infer<typeof updateHelpCategorySchema>
export type CreateHelpArticleInput = z.infer<typeof createHelpArticleSchema>
export type UpdateHelpArticleInput = z.infer<typeof updateHelpArticleSchema>
export type SearchHelpArticlesInput = z.infer<typeof searchHelpArticlesSchema>
