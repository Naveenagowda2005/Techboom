// Shared TypeScript types for Techboom

export type UserRole = 'ADMIN' | 'USER' | 'CUSTOMER'

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED'

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED'

export type TransactionType = 'COMMISSION' | 'WITHDRAWAL' | 'BONUS' | 'REFUND'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  phone?: string
  avatar?: string
  referralCode: string
  walletBalance: number
  isActive: boolean
  isVerified: boolean
  createdAt: string
}

export interface Service {
  id: string
  name: string
  slug: string
  description: string
  price: number
  category: string
  icon?: string
  image?: string
  isActive: boolean
  features: string[]
  deliveryDays: number
  createdAt: string
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  serviceId: string
  status: OrderStatus
  amount: number
  notes?: string
  requirements?: Record<string, unknown>
  referralCode?: string
  createdAt: string
  updatedAt: string
  service?: Partial<Service>
  user?: Partial<User>
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  salePrice?: number
  images: string[]
  category: string
  stock: number
  isActive: boolean
  tags: string[]
  createdAt: string
}

export interface Payment {
  id: string
  orderId: string
  razorpayOrderId: string
  razorpayPaymentId?: string
  amount: number
  currency: string
  status: PaymentStatus
  createdAt: string
}

export interface Referral {
  id: string
  referrerId: string
  orderId?: string
  referralCode: string
  commissionAmount?: number
  isPaid: boolean
  createdAt: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  errors?: Record<string, string[]>
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}
