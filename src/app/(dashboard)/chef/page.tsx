"use client"

import { useEffect, useState, useCallback } from "react"
import { api } from "@/lib/api"
import type { Order } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, ChefHat, Loader2 } from "lucide-react"
import { toast } from "sonner"

function elapsed(start: string): { label: string; minutes: number } {
  const diff = Date.now() - new Date(start).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return { label: "< 1 min", minutes: 0 }
  return { label: `${min} min`, minutes: min }
}

function getPriority(items: Array<Record<string, unknown>>, orderTime: string): "urgent" | "normal" {
  const elapsedMin = elapsed(orderTime).minutes
  const hasUrgent = items.some((i) => i.status === "ordered") && elapsedMin >= 10
  return hasUrgent ? "urgent" : "normal"
}

export default function ChefPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    try {
      const data = await api.get<Order[]>("/orders?status=pending,preparing")
      setOrders(data)
    } catch (e) {
      console.error("Failed to fetch orders", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  async function handleStatus(orderId: string, itemIndex: number, status: string) {
    try {
      await api.patch(`/orders/${orderId}/items`, {
        action: "update_status",
        item: { index: itemIndex, status },
      })
      fetchOrders()
      toast.success(`Item marked as ${status}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update")
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kitchen Display</h1>
          <p className="text-sm text-muted-foreground">Incoming orders will appear here</p>
        </div>
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground">
          <div className="text-center">
            <ChefHat className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p>No pending orders</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kitchen Display</h1>
        <p className="text-sm text-muted-foreground">
          {orders.length} order{orders.length !== 1 ? "s" : ""} pending
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {orders.map((order) => {
          const items = (order.items as Array<Record<string, unknown>>) || []
          const priority = getPriority(items, order.createdAt as unknown as string)
          return (
            <Card
              key={order.id}
              className={
                priority === "urgent"
                  ? "border-red-300 ring-1 ring-red-200"
                  : ""
              }
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ChefHat className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">Table {order.tableNumber}</CardTitle>
                  </div>
                  <Badge
                    variant={priority === "urgent" ? "destructive" : "secondary"}
                    className="flex items-center gap-1"
                  >
                    <Clock className="h-3 w-3" />
                    {elapsed(order.createdAt as unknown as string).label}
                  </Badge>
                </div>
                {order.notes && (
                  <p className="mt-1 text-xs text-muted-foreground">Note: {order.notes}</p>
                )}
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between rounded-md p-2 text-sm ${
                        item.status === "preparing"
                          ? "bg-yellow-50 dark:bg-yellow-950/30"
                          : item.status === "ready"
                          ? "bg-green-50 dark:bg-green-950/30"
                          : "bg-muted/50"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {String(item.quantity)}x {String(item.name)}
                          {(item as Record<string, string>).variant && (
                            <span className="text-muted-foreground"> ({(item as Record<string, string>).variant})</span>
                          )}
                        </div>
                        {(item as Record<string, string>).specialInstructions && (
                          <p className="text-xs font-bold text-red-500">
                            {(item as Record<string, string>).specialInstructions}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {item.status === "ordered" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => handleStatus(order.id, i, "preparing")}
                          >
                            Start
                          </Button>
                        )}
                        {item.status === "preparing" && (
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-green-600 hover:bg-green-700"
                            onClick={() => handleStatus(order.id, i, "ready")}
                          >
                            Ready
                          </Button>
                        )}
                        {item.status === "ready" && (
                          <Badge variant="default" className="text-xs bg-green-600">
                            Done
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
