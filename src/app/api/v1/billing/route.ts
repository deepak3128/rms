import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

function generateInvoiceNumber(): string {
  const date = new Date()
  const y = date.getFullYear().toString().slice(-2)
  const m = (date.getMonth() + 1).toString().padStart(2, "0")
  const d = date.getDate().toString().padStart(2, "0")
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `INV-${y}${m}${d}-${rand}`
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { orderId, discountType, discountValue, discountReason, manualItems } = body

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    const orderItems = (order.items as Array<Record<string, unknown>>) || []
    const activeItems = orderItems.filter((i) => i.status !== "cancelled")

    let subtotal = activeItems.reduce((sum, i) => sum + (i.totalPrice as number || 0), 0)

    if (manualItems) {
      for (const item of manualItems) {
        subtotal += item.price || 0
      }
    }

    let discountAmount = 0
    if (discountType === "percentage" && discountValue) {
      discountAmount = (subtotal * discountValue) / 100
    } else if (discountType === "flat" && discountValue) {
      discountAmount = Math.min(discountValue, subtotal)
    }

    const taxableAmount = subtotal - discountAmount
    const totalTax = Math.round(taxableAmount * 0.12 * 100) / 100
    const grandTotal = Math.round((taxableAmount + totalTax) * 100) / 100

    const invoiceItems = activeItems.map((i) => ({
      name: i.name as string,
      hsnCode: "00000000",
      quantity: i.quantity as number,
      unitPrice: i.unitPrice as number,
      taxableValue: (i.totalPrice as number) - ((i.totalPrice as number) / subtotal) * discountAmount,
      gstRate: 12,
      cgst: ((i.totalPrice as number) * 0.06),
      sgst: ((i.totalPrice as number) * 0.06),
      total: i.totalPrice as number,
    }))

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: generateInvoiceNumber(),
        orderId,
        gstin: "DEFAULTGSTIN001",
        items: invoiceItems,
        subtotal,
        discount: discountAmount,
        totalTax,
        grandTotal,
        restaurantId: "default",
      },
    })

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "billed",
        discountAmount,
        discountReason: discountReason || null,
        taxAmount: totalTax,
        grandTotal,
      },
    })

    return NextResponse.json({ success: true, data: invoice }, { status: 201 })
  } catch (error) {
    console.error("Error generating bill:", error)
    return NextResponse.json({ success: false, error: "Failed to generate bill" }, { status: 500 })
  }
}
