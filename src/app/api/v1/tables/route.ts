import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-auth"

export async function GET() {
  try {
    const tables = await prisma.table.findMany({
      where: { restaurantId: "default" },
      orderBy: { number: "asc" },
    })
    return NextResponse.json({ success: true, data: tables })
  } catch (error) {
    console.error("Error fetching tables:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch tables" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { error } = await requireAuth(["owner", "manager"])
    if (error) return error

    const body = await req.json()
    const { number, name, capacity } = body

    if (!number || !name) {
      return NextResponse.json({ success: false, error: "Number and name are required" }, { status: 400 })
    }

    const table = await prisma.table.create({
      data: { number, name, capacity: capacity ?? 4, restaurantId: "default" },
    })

    return NextResponse.json({ success: true, data: table }, { status: 201 })
  } catch (error) {
    console.error("Error creating table:", error)
    return NextResponse.json({ success: false, error: "Failed to create table" }, { status: 500 })
  }
}
