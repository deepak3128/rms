"use client"

import { useEffect, useState, useCallback } from "react"
import { api } from "@/lib/api"
import type { Table, MenuCategory, MenuItem } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useOrderStore } from "@/store/order-store"
import { Plus, Minus, UtensilsCrossed, Loader2, ShoppingCart, Send } from "lucide-react"
import { toast } from "sonner"

const statusStyles: Record<string, string> = {
  available: "border-green-200 bg-green-50 hover:bg-green-100 dark:border-green-900 dark:bg-green-950/50",
  occupied: "border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/50",
  reserved: "border-yellow-200 bg-yellow-50 hover:bg-yellow-100 dark:border-yellow-900 dark:bg-yellow-950/50",
  cleaning: "border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/50",
}

const statusLabels: Record<string, string> = {
  available: "Available",
  occupied: "Occupied",
  reserved: "Reserved",
  cleaning: "Cleaning",
}

export default function WaiterPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("")

  const {
    selectedTableId,
    cart,
    isOrderModalOpen,
    openOrderModal,
    closeOrderModal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useOrderStore()

  const fetchData = useCallback(async () => {
    try {
      const [tablesData, cats, items] = await Promise.all([
        api.get<Table[]>("/tables"),
        api.get<MenuCategory[]>("/menu/categories"),
        api.get<MenuItem[]>("/menu/items"),
      ])
      setTables(tablesData)
      setCategories(cats)
      setMenuItems(items)
      if (cats.length > 0 && !activeTab) setActiveTab(cats[0].id)
    } catch (e) {
      console.error("Failed to load data", e)
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [fetchData])

  const selectedTable = tables.find((t) => t.id === selectedTableId)

  async function handlePlaceOrder() {
    if (!selectedTableId || cart.length === 0) return
    setSubmitting(true)
    try {
      await api.post("/orders", {
        tableId: selectedTableId,
        items: cart.map((i) => ({
          menuItemId: i.menuItemId,
          name: i.name,
          variant: i.variant,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          specialInstructions: i.specialInstructions,
        })),
      })
      toast.success("Order placed successfully")
      clearCart()
      closeOrderModal()
      fetchData()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to place order")
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = (categoryId: string) =>
    menuItems.filter((i) => i.categoryId === categoryId && i.isAvailable)

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Floor Layout</h1>
          <p className="text-sm text-muted-foreground">Tap a table to take an order</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {tables.map((table) => (
          <Card
            key={table.id}
            className={`cursor-pointer transition-colors ${statusStyles[table.status]}`}
            onClick={() => openOrderModal(table.id)}
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{table.name}</CardTitle>
                <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Badge variant="outline" className="text-xs">
                {statusLabels[table.status]}
              </Badge>
              <p className="mt-1 text-xs text-muted-foreground">Cap: {table.capacity}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isOrderModalOpen} onOpenChange={(open) => !open && closeOrderModal()}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>{selectedTable?.name || "New Order"}</DialogTitle>
            <DialogDescription>
              Select items to add to the order
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full flex-wrap h-auto">
                  {categories.map((cat) => (
                    <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
                      {cat.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {categories.map((cat) => (
                  <TabsContent key={cat.id} value={cat.id}>
                    <ScrollArea className="h-72 pr-4">
                      <div className="space-y-2">
                        {filtered(cat.id).map((item) => (
                          <Card
                            key={item.id}
                            className="cursor-pointer hover:bg-accent transition-colors"
                            onClick={() =>
                              addToCart({
                                menuItemId: item.id,
                                name: item.name,
                                quantity: 1,
                                unitPrice: item.price,
                              })
                            }
                          >
                            <CardContent className="p-3 flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">{item.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  ₹{item.price}
                                </p>
                              </div>
                              <Button size="icon" variant="ghost" className="h-7 w-7">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingCart className="h-4 w-4" />
                <h3 className="font-semibold text-sm">Cart ({cart.length})</h3>
              </div>
              <ScrollArea className="h-64">
                {cart.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Tap items from the menu to add
                  </p>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-md bg-muted/50 p-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">₹{item.unitPrice} each</p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => {
                              if (item.quantity <= 1) removeFromCart(idx)
                              else updateQuantity(idx, item.quantity - 1)
                            }}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(idx, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              <Separator className="my-3" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Total</span>
                <span className="text-lg font-bold">₹{useOrderStore.getState().cartTotal()}</span>
              </div>
              <Button
                className="w-full"
                disabled={cart.length === 0 || submitting}
                onClick={handlePlaceOrder}
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Send to Kitchen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
