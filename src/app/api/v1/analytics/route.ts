import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const whereToday = { restaurantId: "default", createdAt: { gte: today } }
    const whereYesterday = { restaurantId: "default", createdAt: { gte: yesterday, lt: today } }

    const [todayOrders, yesterdayOrders, activeOrders, tables, lowStockIngredients, staffCount, revenueTrend, statusBreakdown] =
      await Promise.all([
        prisma.order.findMany({ where: whereToday }),
        prisma.order.findMany({ where: whereYesterday }),
        prisma.order.findMany({ where: { restaurantId: "default", status: { in: ["pending", "preparing", "ready"] } } }),
        prisma.table.findMany({ where: { restaurantId: "default" } }),
        prisma.ingredient.findMany({ where: { restaurantId: "default" } }).then((ingredients) =>
          ingredients.filter((i) => i.currentStock <= i.minStockLevel)
        ),
        prisma.user.count({ where: { restaurantId: "default", isActive: true } }),
        prisma.order.groupBy({
          by: ["createdAt"],
          where: { restaurantId: "default", createdAt: { gte: sevenDaysAgo } },
          _sum: { grandTotal: true },
        }),
        prisma.order.groupBy({
          by: ["status"],
          where: { restaurantId: "default", createdAt: { gte: today } },
          _count: { status: true },
        }),
      ])

    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0)
    const yesterdayRevenue = yesterdayOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0)
    const tablesOccupied = tables.filter((t) => t.status === "occupied").length

    const dailyRevenueMap = new Map<string, number>()
    for (const order of todayOrders) {
      const day = order.createdAt.toISOString().split("T")[0]
      dailyRevenueMap.set(day, (dailyRevenueMap.get(day) || 0) + (order.grandTotal || 0))
    }

    const revenueTrendData = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split("T")[0]
      revenueTrendData.push({ date: key, revenue: dailyRevenueMap.get(key) || 0 })
    }

    const kpis = {
      todayRevenue,
      yesterdayRevenue,
      activeOrders: activeOrders.length,
      tablesOccupied,
      totalTables: tables.length,
      lowStockItems: lowStockIngredients.length,
      staffOnDuty: staffCount,
    }

    const charts = {
      revenueTrend: revenueTrendData,
      orderStatusBreakdown: statusBreakdown.map((s) => ({ status: s.status, count: s._count.status })),
      bestSellingItems: [],
      hourlyOrderVolume: [],
    }

    return NextResponse.json({ success: true, data: { kpis, charts } })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch analytics" }, { status: 500 })
  }
}
