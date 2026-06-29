"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

type ProtectedProps = {
  children: React.ReactNode
  roles: string[]
}

export default function Protected({ children, roles }: ProtectedProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!session?.user) return null

  const role = session.user.role
  if (!roles.includes(role)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold">Unauthorized</h2>
          <p className="text-sm text-muted-foreground">
            You do not have access to this page.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
