import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { orderId, amount, method, gateway, gatewayOrderId, isOffline, referenceNote } = body

    if (!orderId || !amount || !method) {
      return NextResponse.json({ success: false, error: "orderId, amount, and method are required" }, { status: 400 })
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount,
        method,
        status: isOffline ? "captured" : "pending",
        gateway: gateway || null,
        gatewayOrderId: gatewayOrderId || null,
        isOffline: isOffline ?? false,
        referenceNote: referenceNote || null,
        restaurantId: "default",
      },
    })

    const totalPaid = order.paymentStatus === "paid"
      ? amount
      : amount

    const isFullyPaid = Math.abs(totalPaid - order.grandTotal) < 0.01
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: isFullyPaid ? "paid" : "partial",
        paymentMethod: method,
        status: isFullyPaid ? "billed" : order.status,
      },
    })

    if (isFullyPaid) {
      await prisma.table.updateMany({
        where: { currentOrderId: orderId },
        data: { status: "available", currentOrderId: null, occupancyStartedAt: null },
      })
    }

    return NextResponse.json({ success: true, data: payment }, { status: 201 })
  } catch (error) {
    console.error("Error processing payment:", error)
    return NextResponse.json({ success: false, error: "Failed to process payment" }, { status: 500 })
  }
}
