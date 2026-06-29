"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { api } from "@/lib/api"
import type { Order, OrderItem } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Bell, Flame, Clock, ChefHat, Loader2 } from "lucide-react"
import { toast } from "sonner"

function mins(date: string) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 60000)
}

function urgency(m: number) {
  if (m >= 30)
    return { border: "border-red-500", text: "text-red-500", pulse: true, label: "OVERDUE" }
  if (m >= 15)
    return { border: "border-yellow-500", text: "text-yellow-500", pulse: false, label: "URGENT" }
  return { border: "border-green-500", text: "text-green-500", pulse: false, label: "ON-TIME" }
}

export default function KDS() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const lastIds = useRef<Set<string>>(new Set())
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      const data = await api.get<Order[]>("/orders?status=pending,preparing,ready")
      const ids = new Set(data.map((o) => o.id))

      if (lastIds.current.size > 0) {
        const fresh = data.filter((o) => !lastIds.current.has(o.id))
        if (fresh.length > 0) {
          audioRef.current?.play()
          toast.info(`${fresh.length} new ticket(s)`)
        }
      }
      lastIds.current = ids

      setOrders(
        data.filter((o) =>
          o.items.some(
            (i) => i.status !== "served" && i.status !== "cancelled"
          )
        )
      )
    } catch (e) {
      console.error("Failed to fetch orders", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    audioRef.current = new Audio(
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="
    )
  }, [])

  useEffect(() => {
    fetchOrders()
    const t = setInterval(fetchOrders, 4000)
    return () => clearInterval(t)
  }, [fetchOrders])

  async function handleItemStatus(orderId: string, itemId: string, status: string) {
    try {
      await api.patch(`/orders/${orderId}`, {
        itemStatus: { itemId, status },
      })
      setOrders((os) =>
        os.map((o) =>
          o.id === orderId
            ? {
                ...o,
                items: o.items.map((i) =>
                  i.menuItemId === itemId ? { ...i, status: status as OrderItem["status"] } : i
                ),
              }
            : o
        )
      )
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Kitchen Display &middot; Live
          </h1>
          <p className="text-sm text-muted-foreground">
            {orders.length} active ticket{orders.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-green-500" />
            on-time &lt; 15m
          </Badge>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-yellow-500" />
            urgent 15-30m
          </Badge>
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-red-500" />
            overdue 30m+
          </Badge>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground">
          <div className="text-center">
            <ChefHat className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p>No active tickets. The kitchen is quiet.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {orders.map((order) => {
            const m = mins(order.createdAt as unknown as string)
            const u = urgency(m)
            const activeItems = order.items.filter((i) => i.status !== "cancelled")
            const allReady =
              activeItems.length > 0 &&
              activeItems.every((i) => i.status === "ready" || i.status === "served")

            return (
              <Card
                key={order.id}
                className={u.pulse ? "animate-pulse" : ""}
                style={{
                  borderLeftColor:
                    m >= 30
                      ? "var(--color-red-500)"
                      : m >= 15
                      ? "var(--color-yellow-500)"
                      : "var(--color-green-500)",
                }}
              >
                <CardContent className="p-0">
                  <div className="flex items-center justify-between border-b p-4">
                    <div>
                      <h3 className="text-lg font-bold">
                        Table {order.tableNumber || order.tableId}
                      </h3>
                      <p className="font-mono text-xs text-muted-foreground">
                        #{order.orderNumber}
                      </p>
                    </div>
                    <div className={`text-right ${u.text}`}>
                      <div className="font-mono font-bold text-2xl flex items-center gap-1">
                        <Clock className="h-5 w-5" />
                        {m}m
                      </div>
                      <p className="text-[10px] font-bold tracking-widest">
                        {u.label}
                      </p>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="px-4 py-2 bg-red-50 text-red-600 text-sm font-bold uppercase tracking-wide">
                      <span className="mr-1">&bull;</span>
                      {order.notes}
                    </div>
                  )}

                  <ul className="p-4 space-y-2">
                    {activeItems.map((item, i) => {
                      const itemId = item.menuItemId
                      const done =
                        item.status === "ready" || item.status === "served"
                      return (
                        <li
                          key={`${itemId}-${i}`}
                          className="flex items-center justify-between gap-2"
                        >
                          <div
                            className={`flex-1 ${done ? "line-through opacity-50" : ""}`}
                          >
                            <span className="font-mono font-bold mr-2">
                              &times;{item.quantity}
                            </span>
                            <span className="font-semibold">{item.name}</span>
                            {item.specialInstructions && (
                              <div className="text-xs text-red-500 font-bold">
                                {item.specialInstructions}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            {item.status === "ordered" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs border-yellow-300 text-yellow-700"
                                onClick={() =>
                                  handleItemStatus(order.id, itemId, "preparing")
                                }
                              >
                                <Flame className="mr-1 h-3 w-3" />
                                Prep
                              </Button>
                            )}
                            {item.status === "preparing" && (
                              <Button
                                size="sm"
                                className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                                onClick={() =>
                                  handleItemStatus(order.id, itemId, "ready")
                                }
                              >
                                <Bell className="mr-1 h-3 w-3" />
                                Ready
                              </Button>
                            )}
                            {item.status === "ready" && (
                              <Button
                                size="sm"
                                className="h-7 text-xs bg-green-600 hover:bg-green-700"
                                onClick={() =>
                                  handleItemStatus(order.id, itemId, "served")
                                }
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Serve
                              </Button>
                            )}
                            {item.status === "served" && (
                              <Badge className="bg-green-100 text-green-700 border-green-200">
                                Done
                              </Badge>
                            )}
                          </div>
                        </li>
                      )
                    })}
                  </ul>

                  {allReady && (
                    <div className="border-t px-4 py-2 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-widest text-center">
                      &check; Ticket complete
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
