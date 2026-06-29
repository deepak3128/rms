import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-auth"

export async function POST(req: Request) {
  try {
    const { error } = await requireAuth(["owner", "manager", "chef"])
    if (error) return error

    const body = await req.json()
    const { ingredientId, type, quantity, reason, orderId } = body

    if (!ingredientId || !type || quantity === undefined) {
      return NextResponse.json({ success: false, error: "ingredientId, type, and quantity are required" }, { status: 400 })
    }

    const ingredient = await prisma.ingredient.findUnique({ where: { id: ingredientId } })
    if (!ingredient) {
      return NextResponse.json({ success: false, error: "Ingredient not found" }, { status: 404 })
    }

    const newStock = ingredient.currentStock + quantity

    const transaction = await prisma.inventoryTransaction.create({
      data: {
        ingredientId,
        type,
        quantity,
        reason: reason || null,
        orderId: orderId || null,
        restaurantId: "default",
      },
    })

    await prisma.ingredient.update({
      where: { id: ingredientId },
      data: { currentStock: Math.max(0, newStock) },
    })

    return NextResponse.json({ success: true, data: transaction }, { status: 201 })
  } catch (error) {
    console.error("Error adjusting inventory:", error)
    return NextResponse.json({ success: false, error: "Failed to adjust inventory" }, { status: 500 })
  }
}
