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
    const { paymentId, reason } = body

    if (!paymentId || !reason) {
      return NextResponse.json({ success: false, error: "paymentId and reason are required" }, { status: 400 })
    }

    const payment = await prisma.payment.findUnique({ where: { id: paymentId } })
    if (!payment) {
      return NextResponse.json({ success: false, error: "Payment not found" }, { status: 404 })
    }

    const refunded = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "refunded",
        refundReason: reason,
        refundedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, data: refunded })
  } catch (error) {
    console.error("Error processing refund:", error)
    return NextResponse.json({ success: false, error: "Failed to process refund" }, { status: 500 })
  }
}
