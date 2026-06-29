"use client"

import { useEffect, useState, useCallback } from "react"
import { api } from "@/lib/api"
import type { DashboardKPI, DashboardChart } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IndianRupee, ShoppingCart, Users, Package, Loader2, TrendingUp, TrendingDown } from "lucide-react"

export default function OwnerDashboard() {
  const [kpis, setKpis] = useState<DashboardKPI | null>(null)
  const [charts, setCharts] = useState<DashboardChart | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = useCallback(async () => {
    try {
      const data = await api.get<{ kpis: DashboardKPI; charts: DashboardChart }>("/analytics")
      setKpis(data.kpis)
      setCharts(data.charts)
    } catch (e) {
      console.error("Failed to fetch analytics", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
  }, [fetchAnalytics])

  if (loading || !kpis) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const revenueChange = kpis.yesterdayRevenue > 0
    ? ((kpis.todayRevenue - kpis.yesterdayRevenue) / kpis.yesterdayRevenue * 100).toFixed(1)
    : "0"

  const kpiCards = [
    {
      title: "Today's Revenue",
      value: `₹${kpis.todayRevenue.toLocaleString("en-IN")}`,
      change: `${revenueChange}%`,
      icon: IndianRupee,
      positive: Number(revenueChange) >= 0,
    },
    {
      title: "Active Orders",
      value: String(kpis.activeOrders),
      change: "In progress",
      icon: ShoppingCart,
      positive: true,
    },
    {
      title: "Tables Occupied",
      value: `${kpis.tablesOccupied} / ${kpis.totalTables}`,
      change: `${kpis.totalTables > 0 ? Math.round((kpis.tablesOccupied / kpis.totalTables) * 100) : 0}%`,
      icon: Users,
      positive: kpis.tablesOccupied > 0,
    },
    {
      title: "Low Stock Items",
      value: String(kpis.lowStockItems),
      change: kpis.lowStockItems > 0 ? "Needs attention" : "All stocked",
      icon: Package,
      positive: kpis.lowStockItems === 0,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {kpis.staffOnDuty} staff on duty today
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {kpi.positive ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                {kpi.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Revenue Trend (7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            {charts?.revenueTrend && charts.revenueTrend.length > 0 ? (
              <div className="space-y-2">
                {charts.revenueTrend.map((d) => (
                  <div key={d.date} className="flex items-center gap-3">
                    <span className="w-20 text-xs text-muted-foreground">
                      {new Date(d.date).toLocaleDateString("en-IN", { weekday: "short" })}
                    </span>
                    <div className="flex-1 h-6 rounded-md bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-md transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            (d.revenue / Math.max(...charts.revenueTrend.map((x) => x.revenue), 1)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="w-20 text-xs text-right font-medium">
                      ₹{d.revenue.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                No data yet
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            {charts?.orderStatusBreakdown && charts.orderStatusBreakdown.length > 0 ? (
              <div className="space-y-3">
                {charts.orderStatusBreakdown.map((s) => (
                  <div key={s.status} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{s.status}</span>
                    <span className="text-sm font-bold">{s.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                No orders today
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Staff on Duty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis.staffOnDuty}</div>
            <p className="text-sm text-muted-foreground">Active staff members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {kpis.lowStockItems > 0 ? (
              <div className="space-y-2">
                <div className="text-3xl font-bold text-red-500">{kpis.lowStockItems}</div>
                <p className="text-sm text-muted-foreground">
                  ingredients below minimum threshold
                </p>
              </div>
            ) : (
              <div className="flex h-20 items-center justify-center text-sm text-muted-foreground">
                All ingredients well-stocked
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
