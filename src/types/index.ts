export type UserRole = "owner" | "manager" | "waiter" | "chef" | "cashier"

export type User = {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  restaurantId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type TableStatus = "available" | "reserved" | "occupied" | "cleaning"

export type Table = {
  id: string
  number: number
  name: string
  capacity: number
  status: TableStatus
  currentOrderId?: string
  occupancyStartedAt?: Date
  restaurantId: string
}

export type MenuCategory = {
  id: string
  name: string
  description?: string
  sortOrder: number
  isActive: boolean
  restaurantId: string
}

export type MenuVariant = {
  name: string
  price: number
}

export type MenuAddon = {
  name: string
  price: number
  maxSelect?: number
}

export type MenuItem = {
  id: string
  categoryId: string
  name: string
  description?: string
  price: number
  variants?: MenuVariant[]
  addons?: MenuAddon[]
  image?: string
  isAvailable: boolean
  isDailySpecial: boolean
  gstRate: number
  hsnCode: string
  prepTimeMinutes: number
  recipe?: MenuItemRecipe[]
  restaurantId: string
  createdAt: Date
  updatedAt: Date
}

export type MenuItemRecipe = {
  ingredientId: string
  ingredientName: string
  quantity: number
  unit: string
}

export type OrderStatus = "pending" | "preparing" | "ready" | "served" | "billed" | "cancelled"

export type OrderItemStatus = "ordered" | "preparing" | "ready" | "served" | "cancelled"

export type OrderItem = {
  menuItemId: string
  name: string
  variant?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  specialInstructions?: string
  status: OrderItemStatus
  voidReason?: string
  voidedAt?: Date
  voidedBy?: string
}

export type Order = {
  id: string
  orderNumber: number
  tableId: string
  tableNumber: number
  items: OrderItem[]
  status: OrderStatus
  totalAmount: number
  discountAmount: number
  taxAmount: number
  grandTotal: number
  paymentStatus: "pending" | "partial" | "paid"
  paymentMethod?: string
  waiterId: string
  waiterName: string
  notes?: string
  restaurantId: string
  createdAt: Date
  updatedAt: Date
}

export type Payment = {
  id: string
  orderId: string
  amount: number
  method: "cash" | "card" | "upi" | "netbanking" | "wallet"
  status: "pending" | "captured" | "failed" | "refunded"
  gateway?: "razorpay" | "stripe"
  gatewayTransactionId?: string
  gatewayOrderId?: string
  refundReason?: string
  refundedAt?: Date
  restaurantId: string
  createdAt: Date
}

export type Invoice = {
  id: string
  invoiceNumber: string
  orderId: string
  gstin: string
  items: Array<{
    name: string
    hsnCode: string
    quantity: number
    unitPrice: number
    taxableValue: number
    gstRate: number
    cgst: number
    sgst: number
    total: number
  }>
  subtotal: number
  discount: number
  totalTax: number
  grandTotal: number
  restaurantId: string
  createdAt: Date
}

export type Ingredient = {
  id: string
  name: string
  unit: string
  currentStock: number
  minStockLevel: number
  maxStockLevel?: number
  unitPrice: number
  restaurantId: string
  updatedAt: Date
}

export type InventoryTransaction = {
  id: string
  ingredientId: string
  type: "deduction" | "adjustment" | "wastage"
  quantity: number
  reason?: string
  orderId?: string
  restaurantId: string
  createdAt: Date
}

export type DashboardKPI = {
  todayRevenue: number
  yesterdayRevenue: number
  activeOrders: number
  tablesOccupied: number
  totalTables: number
  lowStockItems: number
  staffOnDuty: number
}

export type DashboardChart = {
  revenueTrend: Array<{ date: string; revenue: number }>
  orderStatusBreakdown: Array<{ status: string; count: number }>
  bestSellingItems: Array<{ name: string; quantity: number }>
  hourlyOrderVolume: Array<{ hour: number; orders: number }>
}

export type AuditLog = {
  id: string
  action: string
  userId: string
  userRole: UserRole
  resource: string
  resourceId: string
  details: Record<string, unknown>
  ipAddress: string
  restaurantId: string
  createdAt: Date
}
