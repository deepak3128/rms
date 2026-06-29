import { create } from "zustand"

export type OrderItemInput = {
  menuItemId: string
  name: string
  variant?: string
  quantity: number
  unitPrice: number
  specialInstructions?: string
}

export type CartItem = OrderItemInput & {
  totalPrice: number
}

type OrderStore = {
  selectedTableId: string | null
  cart: CartItem[]
  isOrderModalOpen: boolean
  setSelectedTable: (tableId: string | null) => void
  openOrderModal: (tableId: string) => void
  closeOrderModal: () => void
  addToCart: (item: OrderItemInput) => void
  removeFromCart: (index: number) => void
  updateQuantity: (index: number, quantity: number) => void
  clearCart: () => void
  cartTotal: () => number
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  selectedTableId: null,
  cart: [],
  isOrderModalOpen: false,

  setSelectedTable: (tableId) => set({ selectedTableId: tableId }),

  openOrderModal: (tableId) =>
    set({ selectedTableId: tableId, isOrderModalOpen: true }),

  closeOrderModal: () =>
    set({ isOrderModalOpen: false, cart: [], selectedTableId: null }),

  addToCart: (item) =>
    set((state) => {
      const idx = state.cart.findIndex(
        (i) => i.menuItemId === item.menuItemId && i.variant === item.variant
      )
      if (idx >= 0) {
        const updated = [...state.cart]
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + item.quantity,
          totalPrice: (updated[idx].quantity + item.quantity) * updated[idx].unitPrice,
        }
        return { cart: updated }
      }
      return {
        cart: [
          ...state.cart,
          { ...item, totalPrice: item.quantity * item.unitPrice },
        ],
      }
    }),

  removeFromCart: (index) =>
    set((state) => ({
      cart: state.cart.filter((_, i) => i !== index),
    })),

  updateQuantity: (index, quantity) =>
    set((state) => {
      const updated = [...state.cart]
      updated[index] = {
        ...updated[index],
        quantity,
        totalPrice: quantity * updated[index].unitPrice,
      }
      return { cart: updated }
    }),

  clearCart: () => set({ cart: [] }),

  cartTotal: () => get().cart.reduce((sum, i) => sum + i.totalPrice, 0),
}))
