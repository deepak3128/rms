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

    const ingredient = await prisma.ingredient.update({
      where: { id },
      data: body,
    })

    return NextResponse.json({ success: true, data: ingredient })
  } catch (error) {
    console.error("Error updating ingredient:", error)
    return NextResponse.json({ success: false, error: "Failed to update ingredient" }, { status: 500 })
  }
}
