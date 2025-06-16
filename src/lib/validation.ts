import { z, ZodError, ZodIssue, ZodSchema } from 'zod';
import { ValidationError } from './error-handling';

// Common validation schemas
export const urlSchema = z.string().url('Please enter a valid URL');
export const emailSchema = z.string().email('Please enter a valid email address');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

// Article validation schemas
export const articleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  summary: z.string().min(1, 'Summary is required'),
  url: urlSchema,
  source: z.string().min(1, 'Source is required'),
  category: z.string().min(1, 'Category is required'),
  is_published: z.boolean().optional(),
  is_pinned: z.boolean().optional(),
  is_breaking: z.boolean().optional(),
  is_sponsored: z.boolean().optional(),
  moderation_status: z.enum(['pending', 'approved', 'rejected']).optional(),
  moderation_notes: z.string().optional()
});

// Sponsor card validation schemas
export const sponsorCardSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  link: urlSchema,
  partner: z.string().min(1, 'Partner name is required'),
  image_url: z.string().url().optional().nullable(),
  active: z.boolean().optional()
});

// Auth validation schemas
export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

// Helper function to validate data against a schema
export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError(error.errors.map((e: ZodIssue) => e.message).join(', '));
    }
    throw error;
  }
}

// Helper function to validate request body
export async function validateRequest<T>(schema: ZodSchema<T>, request: Request): Promise<T> {
  try {
    const body = await request.json();
    return validate(schema, body);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ValidationError('Invalid JSON in request body');
    }
    throw error;
  }
} 