import Link from "next/link"
import {
  UtensilsCrossed, ChefHat, Receipt, QrCode, BarChart3,
  Package, Table2, Bolt, ArrowRight, CheckCircle2,
  Users, Clock, IndianRupee, LayoutDashboard, Smartphone,
  Printer, Wifi, ShieldCheck, ArrowUpRight, Sparkles,
} from "lucide-react"

const features = [
  {
    icon: LayoutDashboard,
    title: "Live Dashboard",
    desc: "Real-time KPIs — revenue today, active orders, table occupancy, low-stock alerts. Everything your manager needs at a glance.",
  },
  {
    icon: Table2,
    title: "Floor Management",
    desc: "Visual table grid with live status. Tap a table to start an order — no hunting for paper checks.",
  },
  {
    icon: UtensilsCrossed,
    title: "Menu Engine",
    desc: "Categories, variants, add-ons, daily specials. Toggle availability in one click. Organised for Indian restaurant menus.",
  },
  {
    icon: ChefHat,
    title: "Kitchen Display",
    desc: "Orders appear instantly with item-level status. Timers track prep time — yellow at 15m, red at 30m. Sound alerts for new tickets.",
  },
  {
    icon: Receipt,
    title: "GST Billing",
    desc: "Auto-CGST/SGST per item. Discounts with reason codes, split bills, manual line items. Generate tax-compliant invoices.",
  },
  {
    icon: QrCode,
    title: "QR Menu",
    desc: "Customers scan table QR to browse the menu. No app required. Built for dine-in — call waiter, see prices, check out.",
  },
  {
    icon: IndianRupee,
    title: "Payments",
    desc: "Razorpay (UPI, cards, netbanking), Stripe (international), and offline cash. Payment audit trail for every transaction.",
  },
  {
    icon: Package,
    title: "Inventory",
    desc: "Ingredient tracking with min/max levels. Colour-coded stock bars. Deductions happen automatically when orders complete.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "7-day revenue trend, best-selling items, hourly volume, order status breakdown. Data-informed decisions for your business.",
  },
]

const roles = [
  {
    role: "Waiter",
    icon: Users,
    color: "text-orange-600 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-800",
    bg: "bg-orange-50/80 dark:bg-orange-950/20",
    items: ["Tap table → start order", "Browse menu by category", "Add custom notes per item", "Fire order to kitchen in one tap"],
  },
  {
    role: "Chef",
    icon: ChefHat,
    color: "text-red-600 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
    bg: "bg-red-50/80 dark:bg-red-950/20",
    items: ["Live ticket wall with timers", "Prep → Ready → Serve per item", "Colour alerts at 15m / 30m", "Audio chime on new orders"],
  },
  {
    role: "Cashier",
    icon: Receipt,
    color: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
    bg: "bg-emerald-50/80 dark:bg-emerald-950/20",
    items: ["Auto GST bill generation", "Discounts with approval flow", "Cash / UPI / Card / Netbanking", "Razorpay checkout modal"],
  },
  {
    role: "Owner",
    icon: BarChart3,
    color: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
    bg: "bg-blue-50/80 dark:bg-blue-950/20",
    items: ["Live KPI dashboard", "Revenue trend & order analytics", "Menu, inventory & staff mgmt", "Export-ready reports"],
  },
]

const stats = [
  { value: "5+", label: "Roles", desc: "Waiter to owner" },
  { value: "9", label: "Modules", desc: "Full restaurant stack" },
  { value: "GST", label: "Compliant", desc: "Auto CGST/SGST" },
  { value: "QR", label: "Scan & order", desc: "No app needed" },
]

const payments = [
  { name: "Razorpay", desc: "UPI, cards, netbanking" },
  { name: "Stripe", desc: "International payments" },
  { name: "Cash", desc: "Offline with reference notes" },
]

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Bolt className="h-5 w-5 text-primary" />
            <span>RMS</span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#roles" className="hover:text-foreground transition-colors">Roles</a>
            <a href="#payments" className="hover:text-foreground transition-colors">Payments</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex h-9 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="mx-auto max-w-6xl px-4 py-24 sm:py-32 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
              <Sparkles className="h-3 w-3 text-primary" />
              Built for Indian restaurants
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-[1.05]">
              Run your restaurant
              <span className="text-primary block mt-1">from one screen.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed">
              Orders, kitchen display, GST billing, inventory, and QR menus — purpose-built
              for small to medium restaurants across India.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center rounded-md bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90 transition-colors gap-2"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium hover:bg-accent transition-colors gap-2"
              >
                Explore Features
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              No credit card required &middot; Set up in 2 minutes
            </p>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="border-b bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold tracking-tight sm:text-3xl">{s.value}</div>
                <div className="text-sm font-medium mt-0.5">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to run a restaurant</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Nine integrated modules that work together — from the moment a guest walks in
              to the final GST invoice.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className="group relative rounded-lg border p-6 hover:shadow-md hover:border-foreground/20 transition-all duration-300"
                >
                  <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-lg bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold mb-1.5">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="border-b py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Designed for every role</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Role-based dashboards so each team member sees exactly what they need — nothing more, nothing less.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {roles.map((r) => {
              const Icon = r.icon
              return (
                <div
                  key={r.role}
                  className={`rounded-xl border-2 p-5 ${r.bg} ${r.border} hover:-translate-y-1 transition-transform duration-300`}
                >
                  <div className={`flex items-center gap-2 mb-4 ${r.color}`}>
                    <Icon className="h-5 w-5" />
                    <span className="font-bold text-lg">{r.role}</span>
                  </div>
                  <ul className="space-y-2.5">
                    {r.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className={`h-4 w-4 mt-0.5 shrink-0 ${r.color}`} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Payments */}
      <section id="payments" className="border-b py-20 sm:py-28 bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-3">Payment methods</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-12">
            Collect payments the way your customers prefer — online or offline, domestic or international.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {payments.map((p) => (
              <div
                key={p.name}
                className="rounded-xl border bg-background px-8 py-6 min-w-[180px] hover:shadow-sm hover:border-foreground/20 transition-all"
              >
                <div className="font-semibold text-base">{p.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="mx-auto max-w-6xl px-4 text-center relative">
          <div className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
            <Sparkles className="h-3 w-3 text-primary" />
            Free to get started
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-3">
            Ready to simplify your operations?
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto mb-10 text-lg">
            Set up in minutes. No credit card required. Your whole team will thank you.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-md bg-foreground px-8 text-sm font-medium text-background hover:bg-foreground/90 transition-colors gap-2 shadow-lg shadow-foreground/10"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium hover:bg-accent transition-colors gap-2"
            >
              <Smartphone className="h-4 w-4" />
              View Demo
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
            <Bolt className="h-4 w-4 text-primary" />
            RMS
          </div>
          <p>&copy; {new Date().getFullYear()} Restaurant Management System. Built for Indian restaurants.</p>
          <div className="flex items-center gap-4">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#roles" className="hover:text-foreground transition-colors">Roles</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
