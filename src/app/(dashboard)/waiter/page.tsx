"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, UtensilsCrossed } from "lucide-react"

const tables = [
  { id: "1", number: 1, name: "Table 1", capacity: 4, status: "available" },
  { id: "2", number: 2, name: "Table 2", capacity: 2, status: "occupied" },
  { id: "3", number: 3, name: "Table 3", capacity: 6, status: "available" },
  { id: "4", number: 4, name: "Table 4", capacity: 4, status: "reserved" },
  { id: "5", number: 5, name: "Table 5", capacity: 4, status: "occupied" },
  { id: "6", number: 6, name: "Table 6", capacity: 2, status: "available" },
  { id: "7", number: 7, name: "Table 7", capacity: 8, status: "available" },
  { id: "8", number: 8, name: "Table 8", capacity: 4, status: "occupied" },
  { id: "9", number: 9, name: "Table 9", capacity: 4, status: "cleaning" },
  { id: "10", number: 10, name: "Table 10", capacity: 6, status: "available" },
]

const statusStyles: Record<string, string> = {
  available: "border-green-200 bg-green-50 hover:bg-green-100 dark:border-green-900 dark:bg-green-950",
  occupied: "border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-900 dark:bg-red-950",
  reserved: "border-yellow-200 bg-yellow-50 hover:bg-yellow-100 dark:border-yellow-900 dark:bg-yellow-950",
  cleaning: "border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950",
}

const statusLabels: Record<string, string> = {
  available: "Available",
  occupied: "Occupied",
  reserved: "Reserved",
  cleaning: "Cleaning",
}

export default function WaiterPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Floor Layout</h1>
          <p className="text-sm text-muted-foreground">Tap a table to take or view an order</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {tables.map((table) => (
          <Card
            key={table.id}
            className={`cursor-pointer transition-colors ${statusStyles[table.status]}`}
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
    </div>
  )
}
