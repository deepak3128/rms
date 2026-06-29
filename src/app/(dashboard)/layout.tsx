"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "next-auth/react"
import { LayoutDashboard, ShoppingCart, ChefHat, Receipt, LogOut, Bike, Utensils } from "lucide-react"
import Link from "next/link"

const roleLinks: Record<string, { href: string; label: string; icon: React.ReactNode }[]> = {
  owner: [
    { href: "/owner", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/waiter", label: "Orders", icon: <ShoppingCart className="h-4 w-4" /> },
    { href: "/chef", label: "Kitchen", icon: <ChefHat className="h-4 w-4" /> },
    { href: "/cashier", label: "Billing", icon: <Receipt className="h-4 w-4" /> },
  ],
  manager: [
    { href: "/owner", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/waiter", label: "Orders", icon: <ShoppingCart className="h-4 w-4" /> },
    { href: "/chef", label: "Kitchen", icon: <ChefHat className="h-4 w-4" /> },
    { href: "/cashier", label: "Billing", icon: <Receipt className="h-4 w-4" /> },
  ],
  waiter: [
    { href: "/waiter", label: "Orders", icon: <Utensils className="h-4 w-4" /> },
  ],
  chef: [
    { href: "/chef", label: "Kitchen", icon: <ChefHat className="h-4 w-4" /> },
  ],
  cashier: [
    { href: "/cashier", label: "Billing", icon: <Receipt className="h-4 w-4" /> },
  ],
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!session?.user) return null

  const role = session.user.role as string
  const links = roleLinks[role] || []
  const initials = session.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 flex-col border-r bg-card md:flex">
        <div className="flex h-14 items-center border-b px-4 font-semibold">
          <Bike className="mr-2 h-5 w-5" />
          RMS
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{session.user.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{session.user.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{role}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="h-full p-6">{children}</div>
      </main>
    </div>
  )
}
