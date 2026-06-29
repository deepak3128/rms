import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-black">
      <main className="flex flex-col items-center gap-8 text-center px-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Restaurant Management System
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Complete operations platform for small and medium restaurants in India
          </p>
        </div>

        <div className="flex gap-4">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-8 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Get Started
          </Link>
        </div>
      </main>
    </div>
  )
}
