import { z } from 'zod';

// ==========================================
// 1. Core Shared Schemas
// ==========================================

const AddressSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(100),
  phone: z.string().regex(/^01[0125][0-9]{8}$/, "Invalid Egyptian phone number"),
  addressLine1: z.string().min(5, "Address is too short").max(255),
  addressLine2: z.string().max(255).optional(),
  city: z.string().min(2).max(50),
});

const CartItemSchema = z.object({
  productId: z.string().uuid("Invalid Product ID"),
  size: z.enum(['S', 'M', 'L', 'XL', 'XXL', '40', '41', '42', '43', '44', '45']),
  color: z.string().optional(),
  quantity: z.number().int().positive().max(10, "Cannot order more than 10 of the same item"),
});

// ==========================================
// 2. Order Input Payload
// ==========================================

export const CreateOrderSchema = z.object({
  shippingAddress: AddressSchema,
  phone: z.string().regex(/^01[0125][0-9]{8}$/, "Invalid Egyptian phone number"),
  paymentMethod: z.enum(['cod', 'card', 'fawry', 'vodafone_cash']),
  shippingMethod: z.enum(['standard', 'fast', 'pickup']),
  notes: z.string().max(500).optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

// ==========================================
// 3. Fawry Webhook Payload
// ==========================================

export const FawryWebhookSchema = z.object({
  requestId: z.string(),
  fawryRefNumber: z.string(),
  merchantRefNumber: z.string(),
  customerMobile: z.string(),
  customerMail: z.string().email().optional(),
  paymentAmount: z.number().positive(),
  orderAmount: z.number().positive(),
  fawryFees: z.number(),
  shippingFees: z.number(),
  orderStatus: z.enum(['NEW', 'PAID', 'CANCELED', 'DELIVERED', 'REFUNDED', 'EXPIRED', 'FAILED']),
  paymentMethod: z.string(),
  messageSignature: z.string(),
  orderExpiryDate: z.number(),
});

export type FawryWebhookPayload = z.infer<typeof FawryWebhookSchema>;
