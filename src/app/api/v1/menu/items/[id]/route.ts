import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()

    const item = await prisma.menuItem.update({
      where: { id },
      data: body,
    })

    return NextResponse.json({ success: true, data: item })
  } catch (error) {
    console.error("Error updating menu item:", error)
    return NextResponse.json({ success: false, error: "Failed to update menu item" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.menuItem.update({ where: { id }, data: { isAvailable: false } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting menu item:", error)
    return NextResponse.json({ success: false, error: "Failed to delete menu item" }, { status: 500 })
  }
}
