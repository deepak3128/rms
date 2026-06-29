import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[\d\s-]{10,15}$/),
  password: z.string().min(8),
  role: z.enum(["owner", "manager", "waiter", "chef", "cashier"]),
})

export const menuItemSchema = z.object({
  categoryId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  price: z.number().positive(),
  variants: z.array(z.object({
    name: z.string(),
    price: z.number().positive(),
  })).optional(),
  addons: z.array(z.object({
    name: z.string(),
    price: z.number().positive(),
    maxSelect: z.number().int().positive().optional(),
  })).optional(),
  image: z.string().url().optional(),
  isAvailable: z.boolean().default(true),
  isDailySpecial: z.boolean().default(false),
  gstRate: z.number().refine(v => [0, 5, 12, 18, 28].includes(v)),
  hsnCode: z.string().length(8),
  prepTimeMinutes: z.number().int().positive(),
})

export const orderItemSchema = z.object({
  menuItemId: z.string(),
  name: z.string(),
  variant: z.string().optional(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  specialInstructions: z.string().max(500).optional(),
})

export const createOrderSchema = z.object({
  tableId: z.string(),
  items: z.array(orderItemSchema).min(1),
  notes: z.string().max(500).optional(),
})

export const voidItemSchema = z.object({
  orderId: z.string(),
  itemIndex: z.number().int().min(0),
  reason: z.string().min(1).max(500),
  requiresApproval: z.boolean().default(false),
})

export const billingSchema = z.object({
  orderId: z.string(),
  discountType: z.enum(["percentage", "flat"]).optional(),
  discountValue: z.number().min(0).optional(),
  discountReason: z.string().optional(),
  manualItems: z.array(z.object({
    name: z.string(),
    price: z.number().positive(),
  })).optional(),
  splitType: z.enum(["equal", "by_item"]).optional(),
  splitCount: z.number().int().positive().optional(),
})

export const paymentSchema = z.object({
  orderId: z.string(),
  amount: z.number().positive(),
  method: z.enum(["cash", "card", "upi", "netbanking", "wallet"]),
  gateway: z.enum(["razorpay", "stripe"]).optional(),
  gatewayOrderId: z.string().optional(),
  isOffline: z.boolean().default(false),
  referenceNote: z.string().optional(),
})

export const inventoryAdjustmentSchema = z.object({
  ingredientId: z.string(),
  type: z.enum(["deduction", "adjustment", "wastage"]),
  quantity: z.number(),
  reason: z.string().min(1),
})

export const ingredientSchema = z.object({
  name: z.string().min(1),
  unit: z.string().min(1),
  currentStock: z.number().min(0),
  minStockLevel: z.number().min(0),
  maxStockLevel: z.number().positive().optional(),
  unitPrice: z.number().min(0),
})
