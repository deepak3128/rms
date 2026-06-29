import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const tableId = searchParams.get("tableId")

    const where: Record<string, unknown> = { restaurantId: "default" }
    if (status) where.status = status
    if (tableId) where.tableId = tableId

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json({ success: true, data: orders })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { tableId, items, notes } = body

    if (!tableId || !items || items.length === 0) {
      return NextResponse.json({ success: false, error: "tableId and items are required" }, { status: 400 })
    }

    const table = await prisma.table.findUnique({ where: { id: tableId } })
    if (!table) {
      return NextResponse.json({ success: false, error: "Table not found" }, { status: 404 })
    }

    const lastOrder = await prisma.order.findFirst({
      where: { restaurantId: "default" },
      orderBy: { orderNumber: "desc" },
    })

    const orderNumber = (lastOrder?.orderNumber ?? 0) + 1

    let totalAmount = 0
    for (const item of items) {
      totalAmount += (item.unitPrice || 0) * (item.quantity || 1)
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        tableId,
        tableNumber: table.number,
        items: JSON.parse(JSON.stringify(items)),
        totalAmount,
        grandTotal: totalAmount,
        waiterId: session.user.id,
        waiterName: session.user.name || "Unknown",
        notes,
        restaurantId: "default",
      },
    })

    await prisma.table.update({
      where: { id: tableId },
      data: { status: "occupied", currentOrderId: order.id, occupancyStartedAt: new Date() },
    })

    return NextResponse.json({ success: true, data: order }, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 })
  }
}
