import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { action, item } = body

    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    const currentItems = (order.items as Array<Record<string, unknown>>) || []

    if (action === "add") {
      if (!item || !item.menuItemId || !item.name || !item.unitPrice) {
        return NextResponse.json({ success: false, error: "Invalid item data" }, { status: 400 })
      }

      const newItem = {
        menuItemId: item.menuItemId,
        name: item.name,
        variant: item.variant || null,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice,
        totalPrice: (item.unitPrice || 0) * (item.quantity || 1),
        specialInstructions: item.specialInstructions || null,
        status: "ordered",
      }

      currentItems.push(newItem)
    } else if (action === "void") {
      const itemIndex = item.index
      if (itemIndex === undefined || itemIndex < 0 || itemIndex >= currentItems.length) {
        return NextResponse.json({ success: false, error: "Invalid item index" }, { status: 400 })
      }

      currentItems[itemIndex] = {
        ...currentItems[itemIndex],
        status: "cancelled",
        voidReason: item.reason || "Voided",
        voidedAt: new Date().toISOString(),
        voidedBy: session.user.id,
      }
    } else if (action === "update_status") {
      const itemIndex = item.index
      if (itemIndex === undefined || itemIndex < 0 || itemIndex >= currentItems.length) {
        return NextResponse.json({ success: false, error: "Invalid item index" }, { status: 400 })
      }
      currentItems[itemIndex].status = item.status
    } else {
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }

    const totalAmount = currentItems
      .filter((i) => i.status !== "cancelled")
      .reduce((sum, i) => sum + (i.totalPrice as number || 0), 0)

    const taxAmount = totalAmount * 0.12
    const grandTotal = totalAmount + taxAmount

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        items: JSON.parse(JSON.stringify(currentItems)),
        totalAmount,
        taxAmount,
        grandTotal,
      },
    })

    return NextResponse.json({ success: true, data: updatedOrder })
  } catch (error) {
    console.error("Error updating order items:", error)
    return NextResponse.json({ success: false, error: "Failed to update items" }, { status: 500 })
  }
}
