import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  referralCode: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const orderSchema = z.object({
  serviceId: z.string().uuid('Invalid service ID'),
  notes: z.string().optional(),
  requirements: z.record(z.string(), z.unknown()).optional(),
  referralCode: z.string().optional(),
})

export const serviceSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200),
  description: z.string().min(10),
  price: z.number().positive(),
  category: z.string().min(2),
  icon: z.string().optional(),
  image: z.string().optional(),
  features: z.array(z.string()).default([]),
  deliveryDays: z.number().int().positive().default(7),
})

export const productSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200),
  description: z.string().min(10),
  price: z.number().positive(),
  salePrice: z.number().positive().optional(),
  images: z.array(z.string()).default([]),
  category: z.string().min(2),
  stock: z.number().int().min(0).default(0),
  tags: z.array(z.string()).default([]),
})

export const withdrawalSchema = z.object({
  amount: z.number().positive().min(100, 'Minimum withdrawal is ₹100'),
  bankAccount: z.string().min(5),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'),
})

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
})

export function parsePagination(searchParams: URLSearchParams) {
  return paginationSchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    search: searchParams.get('search') ?? undefined,
  })
}
