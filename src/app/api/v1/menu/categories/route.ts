import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-auth"

export async function GET() {
  try {
    const categories = await prisma.menuCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { menuItems: true } } },
    })
    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { error } = await requireAuth(["owner", "manager"])
    if (error) return error

    const body = await req.json()
    const { name, description, sortOrder } = body

    if (!name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 })
    }

    const category = await prisma.menuCategory.create({
      data: { name, description, sortOrder: sortOrder ?? 0, restaurantId: "default" },
    })

    return NextResponse.json({ success: true, data: category }, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ success: false, error: "Failed to create category" }, { status: 500 })
  }
}
