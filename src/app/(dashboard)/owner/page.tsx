"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IndianRupee, ShoppingCart, Users, Package } from "lucide-react"

const kpis = [
  {
    title: "Today's Revenue",
    value: "₹12,450",
    change: "+12%",
    icon: IndianRupee,
  },
  {
    title: "Active Orders",
    value: "8",
    change: "+3",
    icon: ShoppingCart,
  },
  {
    title: "Tables Occupied",
    value: "12 / 20",
    change: "60%",
    icon: Users,
  },
  {
    title: "Low Stock Items",
    value: "3",
    change: "Alert",
    icon: Package,
  },
]

export default function OwnerDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your restaurant at a glance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">{kpi.change} from yesterday</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              Chart placeholder — will render with recharts
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              Donut chart placeholder
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Best Selling Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              Bar chart placeholder
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hourly Order Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              Bar chart placeholder
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
