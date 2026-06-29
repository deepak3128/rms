import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const ingredients = await prisma.ingredient.findMany({
      where: { restaurantId: "default" },
      orderBy: { name: "asc" },
    })
    return NextResponse.json({ success: true, data: ingredients })
  } catch (error) {
    console.error("Error fetching ingredients:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch ingredients" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, unit, currentStock, minStockLevel, maxStockLevel, unitPrice } = body

    if (!name || !unit) {
      return NextResponse.json({ success: false, error: "Name and unit are required" }, { status: 400 })
    }

    const ingredient = await prisma.ingredient.create({
      data: {
        name,
        unit,
        currentStock: currentStock ?? 0,
        minStockLevel: minStockLevel ?? 10,
        maxStockLevel: maxStockLevel || undefined,
        unitPrice: unitPrice ?? 0,
        restaurantId: "default",
      },
    })

    return NextResponse.json({ success: true, data: ingredient }, { status: 201 })
  } catch (error) {
    console.error("Error creating ingredient:", error)
    return NextResponse.json({ success: false, error: "Failed to create ingredient" }, { status: 500 })
  }
}
