import { auth } from "./auth"
import { NextResponse } from "next/server"

type UserRole = "owner" | "manager" | "waiter" | "chef" | "cashier"

export async function requireAuth(allowedRoles?: UserRole[]) {
  const session = await auth()

  if (!session?.user) {
    return { error: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }), session: null }
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const role = session.user.role as UserRole
    if (!allowedRoles.includes(role)) {
      return { error: NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 }), session: null }
    }
  }

  return { error: null, session }
}
