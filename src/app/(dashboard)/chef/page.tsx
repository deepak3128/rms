"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, ChefHat } from "lucide-react"

const orders = [
  {
    id: "ORD-001",
    table: 5,
    items: [
      { name: "Butter Chicken", qty: 2, variant: "Half", instructions: "Extra spicy", status: "preparing" },
      { name: "Naan", qty: 4, variant: "", instructions: "", status: "ordered" },
      { name: "Dal Makhani", qty: 1, variant: "Full", instructions: "Less oil", status: "ordered" },
    ],
    elapsed: "12 min",
    priority: "normal",
  },
  {
    id: "ORD-002",
    table: 2,
    items: [
      { name: "Biryani", qty: 1, variant: "Full", instructions: "Extra spicy, no onions", status: "ordered" },
    ],
    elapsed: "8 min",
    priority: "urgent",
  },
  {
    id: "ORD-003",
    table: 8,
    items: [
      { name: "Spring Rolls", qty: 2, variant: "", instructions: "", status: "ordered" },
      { name: "Manchow Soup", qty: 2, variant: "", instructions: "", status: "ordered" },
    ],
    elapsed: "3 min",
    priority: "normal",
  },
]

export default function ChefPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kitchen Display</h1>
        <p className="text-sm text-muted-foreground">Incoming orders — oldest first</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {orders.map((order) => (
          <Card
            key={order.id}
            className={
              order.priority === "urgent"
                ? "border-red-300 ring-1 ring-red-200"
                : ""
            }
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">Table {order.table}</CardTitle>
                </div>
                <Badge
                  variant={order.priority === "urgent" ? "destructive" : "secondary"}
                  className="flex items-center gap-1"
                >
                  <Clock className="h-3 w-3" />
                  {order.elapsed}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="space-y-2">
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-md bg-muted/50 p-2 text-sm"
                  >
                    <div className="flex-1">
                      <div className="font-medium">
                        {item.qty}x {item.name}
                        {item.variant && <span className="text-muted-foreground"> ({item.variant})</span>}
                      </div>
                      {item.instructions && (
                        <p className="text-xs font-bold text-red-500">{item.instructions}</p>
                      )}
                    </div>
                    <Badge
                      variant={item.status === "preparing" ? "default" : "outline"}
                      className="ml-2 text-xs"
                    >
                      {item.status === "preparing" ? "Preparing" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" className="flex-1">
                  Start Preparing
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Mark Ready
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
