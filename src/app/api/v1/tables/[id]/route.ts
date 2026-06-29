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

    const table = await prisma.table.update({
      where: { id },
      data: body,
    })

    return NextResponse.json({ success: true, data: table })
  } catch (error) {
    console.error("Error updating table:", error)
    return NextResponse.json({ success: false, error: "Failed to update table" }, { status: 500 })
  }
}
