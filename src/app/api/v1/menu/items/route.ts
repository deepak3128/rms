import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-auth"

export async function GET() {
  try {
    const items = await prisma.menuItem.findMany({
      where: { isAvailable: true },
      include: { category: true },
      orderBy: [{ categoryId: "asc" }, { name: "asc" }],
    })
    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    console.error("Error fetching menu items:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch menu items" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { error } = await requireAuth(["owner", "manager"])
    if (error) return error

    const body = await req.json()
    const { categoryId, name, description, price, variants, addons, image, gstRate, hsnCode, prepTimeMinutes, recipe, isDailySpecial } = body

    if (!categoryId || !name || !price) {
      return NextResponse.json({ success: false, error: "categoryId, name, and price are required" }, { status: 400 })
    }

    const item = await prisma.menuItem.create({
      data: {
        categoryId,
        name,
        description,
        price,
        variants: variants || undefined,
        addons: addons || undefined,
        image,
        gstRate: gstRate ?? 5,
        hsnCode: hsnCode || "00000000",
        prepTimeMinutes: prepTimeMinutes ?? 10,
        recipe: recipe || undefined,
        isDailySpecial: isDailySpecial ?? false,
        restaurantId: "default",
      },
    })

    return NextResponse.json({ success: true, data: item }, { status: 201 })
  } catch (error) {
    console.error("Error creating menu item:", error)
    return NextResponse.json({ success: false, error: "Failed to create menu item" }, { status: 500 })
  }
}
