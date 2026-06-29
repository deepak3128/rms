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
